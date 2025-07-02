"""Writer node for generating academic content with proper citations."""

import os
import re
from typing import Dict, Any, List, AsyncIterator

from langchain_core.runnables import RunnableConfig
from langchain_google_genai import ChatGoogleGenerativeAI

from agent.base import StreamingNode, UserParams, Source
from agent.handywriterz_state import HandyWriterzState


class WriterNode(StreamingNode):
    """Generates academic content with proper citations and structure."""
    
    def __init__(self):
        super().__init__("writer", timeout_seconds=300.0, max_retries=2)
    
    async def execute(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute the academic writing process."""
        try:
            # Extract required components
            outline = state.get("outline", {})
            verified_sources = state.get("verified_sources", [])
            user_params = UserParams(**state.get("user_params", {}))
            context_docs = state.get("uploaded_docs", [])
            
            if not outline:
                raise ValueError("No outline provided for writing")
            
            if not verified_sources:
                raise ValueError("No verified sources provided for writing")
            
            self._broadcast_progress(state, "Preparing to write academic content...", 5.0)
            
            # Generate the academic content with streaming
            draft_content = await self._generate_academic_content(
                outline, verified_sources, user_params, context_docs, state
            )
            
            # Validate the generated content
            validation_result = self._validate_content(draft_content, user_params, verified_sources)
            
            self._broadcast_progress(state, "Writing completed successfully", 100.0)
            
            return {
                "current_draft": draft_content,
                "word_count": validation_result["word_count"],
                "citation_count": validation_result["citation_count"],
                "sections_completed": validation_result["sections_count"],
                "content_quality": validation_result["quality_metrics"],
                "writing_complete": True
            }
            
        except Exception as e:
            self.logger.error(f"Writing failed: {e}")
            raise
    
    async def _generate_academic_content(
        self,
        outline: Dict[str, Any],
        sources: List[Dict[str, Any]],
        user_params: UserParams,
        context_docs: List[Dict[str, Any]],
        state: HandyWriterzState
    ) -> str:
        """Generate academic content with streaming output."""
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash-exp",
                temperature=0.2,
                max_retries=3,
                api_key=os.getenv("GEMINI_API_KEY"),
                streaming=True
            )
            
            # Build comprehensive writing prompt
            prompt = self._build_writing_prompt(outline, sources, user_params, context_docs)
            
            self._broadcast_progress(state, "Starting content generation...", 10.0)
            
            # Stream the content generation
            full_content = ""
            async for chunk in llm.astream(prompt):
                if hasattr(chunk, 'content') and chunk.content:
                    full_content += chunk.content
                    self._broadcast_token(state, chunk.content)
                    
                    # Update progress based on word count
                    current_words = len(full_content.split())
                    target_words = user_params.word_count
                    progress = min(90.0, 10.0 + (current_words / target_words) * 80.0)
                    
                    if current_words % 100 == 0:  # Update every 100 words
                        self._broadcast_progress(
                            state, 
                            f"Generated {current_words}/{target_words} words...", 
                            progress
                        )
            
            # Post-process the content
            processed_content = self._post_process_content(full_content, sources, user_params)
            
            return processed_content
            
        except Exception as e:
            self.logger.error(f"Content generation failed: {e}")
            raise
    
    def _build_writing_prompt(
        self,
        outline: Dict[str, Any],
        sources: List[Dict[str, Any]],
        user_params: UserParams,
        context_docs: List[Dict[str, Any]]
    ) -> str:
        """Build comprehensive writing prompt."""
        
        # Format sources for reference
        formatted_sources = self._format_sources_for_prompt(sources)
        
        # Format context documents
        context_summary = self._format_context_docs(context_docs)
        
        # Format outline structure
        outline_text = self._format_outline_for_prompt(outline)
        
        prompt = f"""
You are an expert academic writer specializing in {user_params.field}. Write a high-quality {user_params.writeup_type} 
following the provided outline and incorporating the verified sources.

**Writing Specifications:**
- Word Count: {user_params.word_count} words (±3%)
- Academic Field: {user_params.field}
- Document Type: {user_params.writeup_type}
- Citation Style: {user_params.citation_style}
- Academic Level: Postgraduate
- Region: {user_params.region}
- Language: {user_params.language}

**Document Outline:**
{outline_text}

**Verified Academic Sources (MUST USE ALL):**
{formatted_sources}

**Context Documents:**
{context_summary}

**Writing Requirements:**

1. **Academic Excellence:**
   - Use formal, academic language appropriate for postgraduate level
   - Demonstrate critical thinking and analytical depth
   - Present balanced arguments with evidence-based reasoning
   - Follow {user_params.region} academic conventions

2. **Citation Requirements:**
   - Use {user_params.citation_style} citation style throughout
   - Cite ALL provided sources appropriately
   - Include in-text citations for every claim and argument
   - Do NOT create or hallucinate any sources not in the provided list
   - Ensure citations are accurate and properly formatted

3. **Structure Requirements:**
   - Follow the provided outline structure exactly
   - Include clear introduction with thesis statement
   - Develop each main section with supporting evidence
   - Write substantive conclusion that synthesizes key points
   - Use appropriate headings and subheadings

4. **Content Quality:**
   - Integrate sources naturally and meaningfully
   - Demonstrate synthesis of multiple perspectives
   - Include critical evaluation of evidence
   - Show awareness of limitations and counterarguments
   - Maintain logical flow and coherence throughout

5. **Field-Specific Requirements:**
   - Apply relevant {user_params.field} theories and frameworks
   - Use appropriate terminology and concepts
   - Consider ethical implications where relevant
   - Reference current best practices and guidelines

**Important Guidelines:**
- Write ONLY the content, no meta-commentary
- Maintain consistent academic tone throughout
- Ensure each paragraph has a clear purpose and focus
- Use transitional phrases to connect ideas
- Avoid personal opinions unless explicitly required
- Include methodology section if appropriate for document type

Begin writing the {user_params.writeup_type} now:
"""
        return prompt
    
    def _format_sources_for_prompt(self, sources: List[Dict[str, Any]]) -> str:
        """Format sources for inclusion in the prompt."""
        if not sources:
            return "No sources provided."
        
        formatted = []
        for i, source in enumerate(sources, 1):
            source_info = f"{i}. "
            
            if source.get("title"):
                source_info += f"Title: {source['title']}\n   "
            
            if source.get("author"):
                source_info += f"Author(s): {source['author']}\n   "
            
            if source.get("year"):
                source_info += f"Year: {source['year']}\n   "
            
            if source.get("url"):
                source_info += f"URL: {source['url']}\n   "
            
            if source.get("doi"):
                source_info += f"DOI: {source['doi']}\n   "
            
            if source.get("abstract"):
                abstract = source['abstract'][:500] + "..." if len(source['abstract']) > 500 else source['abstract']
                source_info += f"Abstract: {abstract}\n   "
            
            if source.get("citation"):
                source_info += f"Formatted Citation: {source['citation']}"
            
            formatted.append(source_info)
        
        return "\n\n".join(formatted)
    
    def _format_context_docs(self, context_docs: List[Dict[str, Any]]) -> str:
        """Format context documents for the prompt."""
        if not context_docs:
            return "No additional context documents provided."
        
        formatted = []
        for doc in context_docs[:3]:  # Limit to first 3 to avoid token overflow
            content = doc.get("content", "")[:1000]  # Truncate to 1000 chars
            filename = doc.get("metadata", {}).get("file_name", "Unknown")
            formatted.append(f"Document: {filename}\nContent: {content}...")
        
        return "\n\n".join(formatted)
    
    def _format_outline_for_prompt(self, outline: Dict[str, Any]) -> str:
        """Format outline structure for the prompt."""
        if isinstance(outline, list):
            sections = outline
        else:
            sections = outline.get("outline", [])
        
        formatted_sections = []
        for section in sections:
            section_text = f"## {section.get('title', 'Untitled Section')}\n"
            section_text += f"Word Allocation: {section.get('word_allocation', 'Not specified')} words\n"
            
            if section.get("description"):
                section_text += f"Description: {section['description']}\n"
            
            if section.get("key_points"):
                section_text += "Key Points to Address:\n"
                for point in section["key_points"]:
                    section_text += f"- {point}\n"
            
            if section.get("subsections"):
                section_text += "Subsections:\n"
                for subsection in section["subsections"]:
                    section_text += f"  - {subsection.get('title', 'Untitled')}: {subsection.get('word_allocation', 'N/A')} words\n"
            
            formatted_sections.append(section_text)
        
        return "\n\n".join(formatted_sections)
    
    def _post_process_content(self, content: str, sources: List[Dict[str, Any]], user_params: UserParams) -> str:
        """Post-process the generated content for quality and formatting."""
        try:
            # Clean up any formatting issues
            content = self._clean_formatting(content)
            
            # Validate citations are present
            content = self._ensure_citations_present(content, sources)
            
            # Adjust word count if necessary
            content = self._adjust_word_count(content, user_params.word_count)
            
            # Final formatting pass
            content = self._apply_final_formatting(content)
            
            return content
            
        except Exception as e:
            self.logger.error(f"Post-processing failed: {e}")
            return content  # Return unprocessed content rather than fail
    
    def _clean_formatting(self, content: str) -> str:
        """Clean up formatting issues in the content."""
        # Remove excessive whitespace
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # Ensure proper paragraph spacing
        content = re.sub(r'\n\n+', '\n\n', content)
        
        # Fix common punctuation issues
        content = re.sub(r'\s+([,.;:!?])', r'\1', content)
        
        return content.strip()
    
    def _ensure_citations_present(self, content: str, sources: List[Dict[str, Any]]) -> str:
        """Ensure all sources are cited in the content."""
        # This is a simplified check - in production, you'd want more sophisticated citation validation
        cited_sources = 0
        
        for source in sources:
            if source.get("author") and source["author"].lower() in content.lower():
                cited_sources += 1
            elif source.get("year") and str(source["year"]) in content:
                cited_sources += 1
        
        citation_rate = cited_sources / len(sources) if sources else 1
        
        if citation_rate < 0.7:  # If less than 70% of sources are cited
            self.logger.warning(f"Low citation rate detected: {citation_rate:.1%}")
        
        return content
    
    def _adjust_word_count(self, content: str, target_words: int) -> str:
        """Adjust content length to meet target word count."""
        current_words = len(content.split())
        tolerance = 0.05  # 5% tolerance
        
        min_words = int(target_words * (1 - tolerance))
        max_words = int(target_words * (1 + tolerance))
        
        if min_words <= current_words <= max_words:
            return content  # Word count is acceptable
        
        if current_words < min_words:
            # Content is too short - this should trigger a rewrite in evaluation
            self.logger.warning(f"Content too short: {current_words}/{target_words} words")
        
        elif current_words > max_words:
            # Content is too long - trim by removing least important sentences
            sentences = content.split('. ')
            target_sentence_count = int(len(sentences) * (target_words / current_words))
            trimmed_content = '. '.join(sentences[:target_sentence_count])
            return trimmed_content + '.'
        
        return content
    
    def _apply_final_formatting(self, content: str) -> str:
        """Apply final formatting touches."""
        # Ensure proper capitalization after periods
        content = re.sub(r'(\. )([a-z])', lambda m: m.group(1) + m.group(2).upper(), content)
        
        # Ensure proper spacing around citations
        content = re.sub(r'([a-zA-Z])\(', r'\1 (', content)
        
        return content
    
    def _validate_content(self, content: str, user_params: UserParams, sources: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate the generated content quality."""
        words = content.split()
        word_count = len(words)
        
        # Count citations (simplified - looks for parenthetical citations)
        citation_pattern = r'\([^)]*\d{4}[^)]*\)'
        citations = re.findall(citation_pattern, content)
        citation_count = len(citations)
        
        # Count sections (simplified - looks for headings)
        section_pattern = r'^#+\s+.+$'
        sections = re.findall(section_pattern, content, re.MULTILINE)
        sections_count = len(sections)
        
        # Calculate quality metrics
        quality_metrics = {
            "word_count_accuracy": 1.0 - abs(word_count - user_params.word_count) / user_params.word_count,
            "citation_density": citation_count / max(1, word_count // 100),  # Citations per 100 words
            "source_utilization": citation_count / max(1, len(sources)),
            "paragraph_count": len([p for p in content.split('\n\n') if p.strip()]),
            "average_sentence_length": word_count / max(1, content.count('.')),
            "academic_tone_score": self._assess_academic_tone(content)
        }
        
        return {
            "word_count": word_count,
            "citation_count": citation_count,
            "sections_count": sections_count,
            "quality_metrics": quality_metrics
        }
    
    def _assess_academic_tone(self, content: str) -> float:
        """Assess the academic tone of the content."""
        # Academic indicators
        academic_terms = [
            "however", "furthermore", "therefore", "consequently", "nevertheless",
            "research", "study", "analysis", "evidence", "findings", "conclusion",
            "significant", "demonstrate", "indicate", "suggest", "examine"
        ]
        
        # Informal indicators (negative)
        informal_terms = [
            "basically", "really", "pretty", "kind of", "sort of", "stuff",
            "things", "obviously", "clearly", "definitely"
        ]
        
        content_lower = content.lower()
        
        academic_count = sum(1 for term in academic_terms if term in content_lower)
        informal_count = sum(1 for term in informal_terms if term in content_lower)
        
        total_words = len(content.split())
        academic_ratio = academic_count / max(1, total_words // 100)
        informal_ratio = informal_count / max(1, total_words // 100)
        
        # Score from 0 to 1, where 1 is most academic
        score = min(1.0, academic_ratio - informal_ratio * 0.5)
        return max(0.0, score)