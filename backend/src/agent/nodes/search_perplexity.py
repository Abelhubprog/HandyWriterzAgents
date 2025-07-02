"""Perplexity search agent for academic research."""

import asyncio
import os
from typing import Dict, Any, List

import httpx
from langchain_core.runnables import RunnableConfig

from agent.base import BaseNode
from agent.handywriterz_state import HandyWriterzState, SearchState


class PerplexitySearchNode(BaseNode):
    """Search agent powered by Perplexity Deep Research API."""
    
    def __init__(self):
        super().__init__("search_perplexity", timeout_seconds=90.0, max_retries=3)
        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        if not self.api_key:
            raise ValueError("PERPLEXITY_API_KEY environment variable is required")
    
    async def execute(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute Perplexity search for academic sources."""
        try:
            research_agenda = state.get("research_agenda", [])
            user_params = state.get("user_params", {})
            
            if not research_agenda:
                raise ValueError("No research agenda provided")
            
            self._broadcast_progress(state, "Starting Perplexity deep research...", 10.0)
            
            # Execute searches with rate limiting
            search_results = []
            total_queries = len(research_agenda)
            
            for i, query in enumerate(research_agenda):
                try:
                    self._broadcast_progress(
                        state, 
                        f"Searching: {query[:50]}...", 
                        10.0 + (i / total_queries) * 80.0
                    )
                    
                    result = await self._execute_search(query, user_params)
                    search_results.append(result)
                    
                    # Rate limiting - wait between requests
                    if i < total_queries - 1:
                        await asyncio.sleep(1.0)
                        
                except Exception as e:
                    self.logger.warning(f"Search failed for query '{query}': {e}")
                    # Continue with other queries even if one fails
                    continue
            
            self._broadcast_progress(state, "Perplexity search completed", 100.0)
            
            return {
                "perplexity_results": search_results,
                "search_provider": "perplexity",
                "queries_executed": len(search_results),
                "queries_total": total_queries
            }
            
        except Exception as e:
            self.logger.error(f"Perplexity search failed: {e}")
            raise
    
    async def _execute_search(self, query: str, user_params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single Perplexity search query."""
        try:
            # Enhance query for academic focus
            academic_query = self._enhance_query_for_academic_search(query, user_params)
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.perplexity.ai/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.1-sonar-large-128k-online",
                        "messages": [
                            {
                                "role": "system",
                                "content": self._get_system_prompt(user_params)
                            },
                            {
                                "role": "user", 
                                "content": academic_query
                            }
                        ],
                        "temperature": 0.2,
                        "search_domain_filter": ["perplexity.ai"],
                        "return_citations": True,
                        "search_recency_filter": self._get_recency_filter(user_params),
                        "top_p": 0.9,
                        "stream": False
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"Perplexity API error: {response.status_code} - {response.text}")
                
                result = response.json()
                
                # Extract and process the response
                return self._process_search_result(result, query, academic_query)
                
        except Exception as e:
            self.logger.error(f"Perplexity search execution failed: {e}")
            raise
    
    def _enhance_query_for_academic_search(self, query: str, user_params: Dict[str, Any]) -> str:
        """Enhance search query for academic focus."""
        field = user_params.get("field", "")
        region = user_params.get("region", "")
        max_years = user_params.get("source_age_years", 10)
        
        # Add academic terms and constraints
        enhanced_query = f"""
        Academic research query: {query}
        
        Please provide comprehensive academic research focusing on:
        - Peer-reviewed journal articles and academic sources
        - Recent research from the last {max_years} years
        - Studies relevant to {field} field
        - Evidence-based findings and methodologies
        """
        
        if region and region.lower() != "general":
            enhanced_query += f"- Research with {region} context or applicability"
        
        enhanced_query += """
        
        Requirements:
        1. Prioritize systematic reviews, meta-analyses, and peer-reviewed studies
        2. Include DOI numbers when available
        3. Focus on high-impact academic journals
        4. Provide detailed abstracts and key findings
        5. Exclude non-academic sources like blogs, news articles, or opinion pieces
        """
        
        return enhanced_query
    
    def _get_system_prompt(self, user_params: Dict[str, Any]) -> str:
        """Get system prompt for Perplexity search."""
        field = user_params.get("field", "academic")
        
        return f"""
        You are an expert academic researcher specializing in {field}. Your task is to conduct 
        comprehensive literature searches and provide detailed, evidence-based responses.
        
        Guidelines:
        1. Focus exclusively on academic and scholarly sources
        2. Prioritize peer-reviewed journals, systematic reviews, and meta-analyses
        3. Provide complete citations with DOI numbers when available
        4. Summarize key findings, methodologies, and limitations
        5. Assess the credibility and relevance of each source
        6. Identify gaps in current research
        7. Note any conflicting findings in the literature
        
        Output format:
        - Start with a brief summary of the research landscape
        - List each source with full citation details
        - Provide detailed abstracts and key findings
        - Note the relevance and quality of each source
        - Conclude with research gaps and future directions
        """
    
    def _get_recency_filter(self, user_params: Dict[str, Any]) -> str:
        """Get recency filter based on user parameters."""
        max_years = user_params.get("source_age_years", 10)
        
        if max_years <= 2:
            return "year"
        elif max_years <= 5:
            return "year"  # Perplexity API limitation
        else:
            return "year"  # Default to most recent
    
    def _process_search_result(self, result: Dict[str, Any], original_query: str, enhanced_query: str) -> Dict[str, Any]:
        """Process and structure the search result."""
        try:
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            citations = result.get("citations", [])
            
            # Extract sources from content and citations
            sources = self._extract_sources_from_content(content, citations)
            
            return {
                "original_query": original_query,
                "enhanced_query": enhanced_query,
                "content": content,
                "sources": sources,
                "citation_count": len(citations),
                "search_quality": self._assess_search_quality(content, sources),
                "timestamp": result.get("created"),
                "model_used": result.get("model"),
                "provider": "perplexity"
            }
            
        except Exception as e:
            self.logger.error(f"Result processing failed: {e}")
            return {
                "original_query": original_query,
                "error": str(e),
                "sources": [],
                "provider": "perplexity"
            }
    
    def _extract_sources_from_content(self, content: str, citations: List[Dict]) -> List[Dict[str, Any]]:
        """Extract structured source information."""
        sources = []
        
        try:
            # Process citations from API response
            for citation in citations:
                source = {
                    "url": citation.get("url", ""),
                    "title": citation.get("title", ""),
                    "snippet": citation.get("snippet", ""),
                    "domain": citation.get("domain", ""),
                    "credibility_score": self._assess_domain_credibility(citation.get("domain", "")),
                    "citation_type": "api_citation",
                    "provider": "perplexity"
                }
                sources.append(source)
            
            # Also try to extract additional sources mentioned in content
            content_sources = self._extract_sources_from_text(content)
            sources.extend(content_sources)
            
            return sources
            
        except Exception as e:
            self.logger.error(f"Source extraction failed: {e}")
            return []
    
    def _extract_sources_from_text(self, content: str) -> List[Dict[str, Any]]:
        """Extract sources mentioned in the text content."""
        sources = []
        
        # Look for DOI patterns
        import re
        doi_pattern = r'10\.\d{4,}/[^\s]+'
        dois = re.findall(doi_pattern, content)
        
        for doi in dois:
            sources.append({
                "doi": doi,
                "url": f"https://doi.org/{doi}",
                "title": "Academic paper (DOI found)",
                "credibility_score": 0.9,  # High credibility for DOI sources
                "citation_type": "extracted_doi",
                "provider": "perplexity"
            })
        
        # Look for journal names and author citations
        # This is a simplified extraction - could be enhanced further
        journal_patterns = [
            r'published in ([A-Z][a-zA-Z\s&]+Journal[a-zA-Z\s]*)',
            r'([A-Z][a-zA-Z\s]+Journal[a-zA-Z\s]*) found that',
            r'according to ([A-Z][a-zA-Z\s]+Journal[a-zA-Z\s]*)'
        ]
        
        for pattern in journal_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches[:5]:  # Limit to 5 matches per pattern
                sources.append({
                    "title": match,
                    "source_type": "journal",
                    "credibility_score": 0.8,
                    "citation_type": "extracted_journal",
                    "provider": "perplexity"
                })
        
        return sources
    
    def _assess_domain_credibility(self, domain: str) -> float:
        """Assess the credibility of a domain."""
        if not domain:
            return 0.5
        
        # High credibility domains
        high_credibility = [
            ".edu", ".ac.uk", ".gov", "pubmed", "scholar.google", 
            "jstor", "springer", "wiley", "elsevier", "nature.com",
            "sciencedirect", "tandfonline", "sage", "apa.org"
        ]
        
        # Medium credibility domains
        medium_credibility = [
            "researchgate", "academia.edu", "arxiv", "biorxiv",
            "ssrn", "who.int", "cdc.gov", "nhs.uk"
        ]
        
        domain_lower = domain.lower()
        
        for high_domain in high_credibility:
            if high_domain in domain_lower:
                return 0.9
        
        for medium_domain in medium_credibility:
            if medium_domain in domain_lower:
                return 0.7
        
        # Default credibility for unknown domains
        return 0.5
    
    def _assess_search_quality(self, content: str, sources: List[Dict]) -> Dict[str, Any]:
        """Assess the quality of search results."""
        return {
            "content_length": len(content),
            "source_count": len(sources),
            "high_credibility_sources": len([s for s in sources if s.get("credibility_score", 0) > 0.8]),
            "doi_sources": len([s for s in sources if "doi" in s]),
            "academic_focus": "academic" in content.lower() or "research" in content.lower(),
            "quality_score": min(1.0, (len(sources) * 0.1) + (len(content) / 5000))
        }