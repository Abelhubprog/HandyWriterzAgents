"""Memory Writer node for per-user writing fingerprint storage."""

import json
import time
from typing import Dict, Any

from langchain_core.runnables import RunnableConfig

from agent.base import BaseNode
from agent.handywriterz_state import HandyWriterzState


class MemoryWriterNode(BaseNode):
    """Stores and updates user writing fingerprint after evaluation."""
    
    def __init__(self):
        super().__init__("memory_writer", timeout_seconds=30.0, max_retries=2)
    
    async def execute(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Extract writing fingerprint and store in memory."""
        try:
            current_draft = state.get("current_draft", "")
            evaluation_results = state.get("evaluation_results", [])
            user_id = state.get("user_id", "")
            
            if not current_draft or not user_id:
                return {"memory_updated": False}
            
            # Extract writing metrics
            fingerprint = self._extract_writing_fingerprint(current_draft, evaluation_results)
            
            # Store/update in database
            await self._store_user_memory(user_id, fingerprint)
            
            self._broadcast_progress(state, "Writing memory updated", 100.0)
            
            return {
                "memory_updated": True,
                "writing_fingerprint": fingerprint
            }
            
        except Exception as e:
            self.logger.error(f"Memory writing failed: {e}")
            raise
    
    def _extract_writing_fingerprint(self, draft: str, evaluations: list) -> Dict[str, Any]:
        """Extract writing style metrics from draft."""
        sentences = [s.strip() for s in draft.split('.') if s.strip()]
        words = draft.split()
        
        # Basic metrics
        avg_sentence_length = len(words) / max(len(sentences), 1)
        
        # Citation density (citations per 100 words)
        citation_count = len([w for w in words if '(' in w and ')' in w])
        citation_density = (citation_count / max(len(words), 1)) * 100
        
        # Tone metrics from evaluations
        tone_metrics = {}
        if evaluations:
            avg_score = sum(eval_result.get("score", 0) for eval_result in evaluations) / len(evaluations)
            tone_metrics = {
                "average_quality_score": avg_score,
                "academic_formality": self._assess_formality(draft),
                "complexity_score": self._assess_complexity(draft)
            }
        
        return {
            "tone_metrics": tone_metrics,
            "avg_sentence_length": avg_sentence_length,
            "citation_density": citation_density,
            "word_count": len(words),
            "paragraph_count": len([p for p in draft.split('\n\n') if p.strip()]),
            "timestamp": time.time()
        }
    
    def _assess_formality(self, text: str) -> float:
        """Assess academic formality level (0-1)."""
        formal_indicators = [
            "however", "furthermore", "therefore", "consequently",
            "research", "study", "analysis", "evidence", "findings"
        ]
        informal_indicators = [
            "really", "pretty", "kind of", "sort of", "basically"
        ]
        
        text_lower = text.lower()
        formal_count = sum(1 for indicator in formal_indicators if indicator in text_lower)
        informal_count = sum(1 for indicator in informal_indicators if indicator in text_lower)
        
        return min(1.0, formal_count / max(formal_count + informal_count, 1))
    
    def _assess_complexity(self, text: str) -> float:
        """Assess sentence complexity (0-1)."""
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        if not sentences:
            return 0.0
        
        complex_indicators = [
            "which", "that", "although", "whereas", "furthermore",
            "however", "nevertheless", "consequently"
        ]
        
        complex_sentence_count = 0
        for sentence in sentences:
            if any(indicator in sentence.lower() for indicator in complex_indicators):
                complex_sentence_count += 1
        
        return complex_sentence_count / len(sentences)
    
    async def _store_user_memory(self, user_id: str, fingerprint: Dict[str, Any]):
        """Store writing fingerprint in database."""
        # TODO(fill-secret): Implement Supabase connection
        # For now, log the fingerprint
        self.logger.info(f"Storing fingerprint for user {user_id}: {json.dumps(fingerprint, indent=2)}")
        
        # In production, this would be:
        # await supabase.table('user_memories').upsert({
        #     'user_id': user_id,
        #     'fingerprint': fingerprint,
        #     'updated_at': datetime.utcnow()
        # })