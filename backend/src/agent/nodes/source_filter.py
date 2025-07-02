"""Source Filter node for evidence validation and hover card data storage."""

import json
import time
from typing import Dict, Any, List
from langchain_core.runnables import RunnableConfig

from agent.base import BaseNode
from agent.handywriterz_state import HandyWriterzState


class SourceFilterNode(BaseNode):
    """Filters sources and stores evidence data for hover cards."""
    
    def __init__(self):
        super().__init__("source_filter", timeout_seconds=45.0, max_retries=2)
    
    async def execute(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Filter sources and create evidence mappings for hover cards."""
        try:
            search_results = state.get("search_results", [])
            research_parameters = state.get("research_parameters", {})
            
            if not search_results:
                return {"filtered_sources": [], "evidence_map": {}}
            
            # Filter sources based on credibility and relevance
            filtered_sources = await self._filter_sources(search_results, research_parameters)
            
            # Create evidence map for hover cards
            evidence_map = self._create_evidence_map(filtered_sources)
            
            # Store evidence for future paragraphs
            await self._store_evidence_data(evidence_map, state.get("user_id", ""))
            
            self._broadcast_progress(state, f"Filtered {len(filtered_sources)} high-quality sources", 100.0)
            
            return {
                "filtered_sources": filtered_sources,
                "evidence_map": evidence_map,
                "source_count": len(filtered_sources)
            }
            
        except Exception as e:
            self.logger.error(f"Source filtering failed: {e}")
            raise
    
    async def _filter_sources(self, search_results: List[Dict], parameters: Dict) -> List[Dict]:
        """Filter sources based on credibility and relevance."""
        field = parameters.get("field", "general")
        citation_style = parameters.get("citation_style", "harvard")
        word_count = parameters.get("word_count", 2000)
        
        # Calculate required source count based on word count
        min_sources = max(5, word_count // 400)  # 1 source per ~400 words minimum
        max_sources = min(20, word_count // 200)  # 1 source per ~200 words maximum
        
        filtered = []
        
        for source in search_results:
            # Skip if missing essential data
            if not source.get("url") or not source.get("title"):
                continue
            
            # Calculate credibility score
            credibility_score = self._calculate_credibility(source, field)
            
            # Skip low-credibility sources
            if credibility_score < 0.6:
                continue
            
            # Extract key evidence paragraphs
            evidence_paragraphs = self._extract_evidence_paragraphs(source)
            
            # Enhance source with metadata
            enhanced_source = {
                **source,
                "credibility_score": credibility_score,
                "evidence_paragraphs": evidence_paragraphs,
                "citation_format": self._format_citation(source, citation_style),
                "field_relevance": self._assess_field_relevance(source, field),
                "timestamp": time.time()
            }
            
            filtered.append(enhanced_source)
        
        # Sort by credibility and relevance
        filtered.sort(key=lambda x: (x["credibility_score"] + x["field_relevance"]) / 2, reverse=True)
        
        # Return optimal number of sources
        return filtered[:max_sources]
    
    def _calculate_credibility(self, source: Dict, field: str) -> float:
        """Calculate source credibility score (0-1)."""
        url = source.get("url", "").lower()
        domain = url.split("//")[-1].split("/")[0] if "//" in url else ""
        
        # Academic and institutional domains
        academic_indicators = [
            ".edu", ".ac.uk", ".gov", "pubmed", "jstor", "springer", 
            "wiley", "elsevier", "nature", "science", "ncbi", "nih"
        ]
        
        # Field-specific credible sources
        field_sources = {
            "nursing": ["nursingworld.org", "aacnnursing.org", "cochrane.org"],
            "law": ["westlaw", "lexisnexis", "justia", "law.com"],
            "medicine": ["medscape", "uptodate", "bmj", "nejm"],
            "social_work": ["nasw.org", "cswe.org", "socialworkers.org"]
        }
        
        score = 0.5  # Base score
        
        # Academic domain bonus
        if any(indicator in domain for indicator in academic_indicators):
            score += 0.3
        
        # Field-specific bonus
        field_domains = field_sources.get(field, [])
        if any(domain_name in domain for domain_name in field_domains):
            score += 0.2
        
        # Publication date penalty (older sources lose credibility)
        pub_date = source.get("published_date", "")
        if pub_date:
            try:
                # Simple year extraction and age penalty
                year = int(pub_date[:4]) if len(pub_date) >= 4 else 2020
                current_year = 2024
                age = current_year - year
                if age > 5:
                    score -= min(0.2, age * 0.02)
            except:
                pass
        
        # Content quality indicators
        content = source.get("content", "") + source.get("snippet", "")
        if "peer-reviewed" in content.lower():
            score += 0.1
        if "doi:" in content.lower():
            score += 0.1
        
        return min(1.0, max(0.0, score))
    
    def _extract_evidence_paragraphs(self, source: Dict) -> List[Dict]:
        """Extract key evidence paragraphs from source content."""
        content = source.get("content", "") or source.get("snippet", "")
        if not content:
            return []
        
        # Split into paragraphs
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        evidence_paragraphs = []
        for i, paragraph in enumerate(paragraphs[:5]):  # Limit to first 5 paragraphs
            # Score paragraph relevance
            relevance_score = self._score_paragraph_relevance(paragraph)
            
            if relevance_score > 0.6:  # Only include relevant paragraphs
                evidence_paragraphs.append({
                    "text": paragraph,
                    "position": i,
                    "relevance_score": relevance_score,
                    "key_phrases": self._extract_key_phrases(paragraph)
                })
        
        return evidence_paragraphs
    
    def _score_paragraph_relevance(self, paragraph: str) -> float:
        """Score paragraph relevance for academic writing."""
        paragraph_lower = paragraph.lower()
        
        # Evidence indicators
        evidence_indicators = [
            "research shows", "study found", "evidence suggests", "findings indicate",
            "data reveals", "analysis demonstrates", "according to", "statistics show"
        ]
        
        # Academic language indicators
        academic_indicators = [
            "furthermore", "however", "therefore", "consequently", "moreover",
            "empirical", "methodology", "systematic", "significant"
        ]
        
        score = 0.3  # Base score
        
        # Evidence presence
        evidence_count = sum(1 for indicator in evidence_indicators 
                           if indicator in paragraph_lower)
        score += min(0.4, evidence_count * 0.1)
        
        # Academic language
        academic_count = sum(1 for indicator in academic_indicators 
                           if indicator in paragraph_lower)
        score += min(0.3, academic_count * 0.05)
        
        # Length penalty for very short paragraphs
        if len(paragraph.split()) < 20:
            score -= 0.2
        
        return min(1.0, max(0.0, score))
    
    def _extract_key_phrases(self, paragraph: str) -> List[str]:
        """Extract key phrases for hover card display."""
        # Simple key phrase extraction
        words = paragraph.lower().split()
        phrases = []
        
        # Look for common academic phrases
        academic_phrases = [
            "research shows", "study found", "evidence suggests", "data indicates",
            "analysis reveals", "findings demonstrate", "according to research"
        ]
        
        for phrase in academic_phrases:
            if phrase in paragraph.lower():
                phrases.append(phrase)
        
        return phrases[:3]  # Limit to 3 key phrases
    
    def _assess_field_relevance(self, source: Dict, field: str) -> float:
        """Assess how relevant source is to specified field."""
        content = (source.get("content", "") + " " + 
                  source.get("title", "") + " " + 
                  source.get("snippet", "")).lower()
        
        field_keywords = {
            "nursing": ["patient", "healthcare", "clinical", "nursing", "medical", "treatment"],
            "law": ["legal", "court", "statute", "regulation", "judicial", "litigation"],
            "medicine": ["medical", "clinical", "patient", "diagnosis", "treatment", "therapeutic"],
            "social_work": ["social", "community", "intervention", "client", "welfare", "support"],
            "business": ["business", "management", "corporate", "financial", "market", "strategy"],
            "education": ["education", "learning", "student", "teaching", "academic", "curriculum"]
        }
        
        keywords = field_keywords.get(field, ["academic", "research", "study"])
        
        relevance_score = 0.0
        for keyword in keywords:
            if keyword in content:
                relevance_score += 0.15
        
        return min(1.0, relevance_score)
    
    def _format_citation(self, source: Dict, style: str) -> str:
        """Format citation in specified style."""
        title = source.get("title", "Untitled")
        url = source.get("url", "")
        date = source.get("published_date", "")
        author = source.get("author", "Unknown Author")
        
        if style.lower() == "harvard":
            return f"{author} ({date[:4] if date else 'n.d.'}). {title}. Retrieved from {url}"
        elif style.lower() == "apa":
            return f"{author} ({date[:4] if date else 'n.d.'}). {title}. Retrieved from {url}"
        elif style.lower() == "mla":
            return f"{author}. \"{title}.\" Web. {date if date else 'n.d.'} <{url}>."
        else:  # Chicago
            return f"{author}. \"{title}.\" Accessed {date if date else 'n.d.'}. {url}."
    
    def _create_evidence_map(self, filtered_sources: List[Dict]) -> Dict[str, Any]:
        """Create evidence mapping for hover cards."""
        evidence_map = {}
        
        for i, source in enumerate(filtered_sources):
            source_id = f"source_{i}"
            
            # Store evidence data for each source
            evidence_map[source_id] = {
                "source_info": {
                    "title": source.get("title", ""),
                    "url": source.get("url", ""),
                    "author": source.get("author", "Unknown Author"),
                    "date": source.get("published_date", ""),
                    "credibility_score": source.get("credibility_score", 0.0)
                },
                "evidence_paragraphs": source.get("evidence_paragraphs", []),
                "citation": source.get("citation_format", ""),
                "key_points": self._extract_key_points(source)
            }
        
        return evidence_map
    
    def _extract_key_points(self, source: Dict) -> List[str]:
        """Extract key points for hover card summary."""
        evidence_paragraphs = source.get("evidence_paragraphs", [])
        key_points = []
        
        for paragraph in evidence_paragraphs[:3]:  # Top 3 paragraphs
            text = paragraph.get("text", "")
            # Extract first sentence as key point
            sentences = text.split(". ")
            if sentences and len(sentences[0]) > 20:
                key_points.append(sentences[0] + ".")
        
        return key_points
    
    async def _store_evidence_data(self, evidence_map: Dict, user_id: str):
        """Store evidence data for hover card retrieval."""
        # TODO(fill-secret): Implement Redis or database storage
        # For now, log the evidence map
        self.logger.info(f"Storing evidence map for user {user_id}: {len(evidence_map)} sources")
        
        # In production, this would store in Redis for quick hover card retrieval:
        # await redis.setex(f"evidence_map:{user_id}:{timestamp}", 
        #                   3600,  # 1 hour TTL
        #                   json.dumps(evidence_map))