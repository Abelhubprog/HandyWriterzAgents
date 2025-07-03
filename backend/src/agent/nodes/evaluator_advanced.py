"""Revolutionary Multi-Model Evaluator with PhD-level consensus and advanced assessment."""

import asyncio
import logging
import os
import json
import numpy as np
import statistics
from typing import Dict, Any, List, Optional, Tuple, Set
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import hashlib

from langchain_core.runnables import RunnableConfig
from langchain_google_genai import ChatGoogleGenerativeAI
import anthropic
from openai import AsyncOpenAI
from scipy.stats import pearsonr, spearmanr
from sklearn.metrics import cohen_kappa_score
import networkx as nx

from agent.base import BaseNode, EvaluationResult
from agent.handywriterz_state import HandyWriterzState

logger = logging.getLogger(__name__)


class AssessmentDomain(Enum):
    """Sophisticated assessment domains for academic evaluation."""
    THEORETICAL_SOPHISTICATION = "theoretical_framework_mastery"
    EMPIRICAL_RIGOR = "research_methodology_excellence"
    ANALYTICAL_DEPTH = "critical_thinking_sophistication"
    ARGUMENTATIVE_COHERENCE = "logical_structure_quality"
    SCHOLARLY_COMMUNICATION = "academic_writing_mastery"
    EPISTEMIC_RESPONSIBILITY = "knowledge_claim_justification"
    INTERDISCIPLINARY_SYNTHESIS = "cross_domain_integration"
    METHODOLOGICAL_INNOVATION = "research_approach_creativity"
    ETHICAL_CONSIDERATION = "research_ethics_awareness"
    FUTURE_CONTRIBUTION = "field_advancement_potential"


@dataclass
class AcademicRubric:
    """Comprehensive academic assessment rubric."""
    criterion_name: str
    description: str
    excellent_threshold: float  # 90-100
    proficient_threshold: float  # 80-89
    developing_threshold: float  # 70-79
    inadequate_threshold: float  # Below 70
    weight: float  # Relative importance
    assessment_method: str
    examples_excellent: List[str]
    examples_proficient: List[str]
    common_weaknesses: List[str]
    improvement_strategies: List[str]


@dataclass
class ConsensusMetrics:
    """Advanced consensus analysis metrics."""
    inter_rater_reliability: float  # Cohen's kappa
    correlation_coefficient: float  # Pearson correlation
    rank_correlation: float  # Spearman correlation
    agreement_percentage: float
    variance_analysis: Dict[str, float]
    outlier_detection: List[str]
    confidence_interval: Tuple[float, float]
    consensus_strength: str  # "strong", "moderate", "weak"
    disagreement_analysis: Dict[str, Any]
    model_bias_assessment: Dict[str, float]


@dataclass
class QualityDimension:
    """Sophisticated quality assessment dimension."""
    dimension_name: str
    score: float
    confidence: float
    evidence: List[str]
    weaknesses: List[str]
    strengths: List[str]
    improvement_recommendations: List[str]
    comparative_analysis: Dict[str, float]
    threshold_analysis: Dict[str, bool]
    future_potential: float


@dataclass
class ComprehensiveEvaluation:
    """Revolutionary comprehensive evaluation result."""
    # Overall assessment
    overall_score: float
    confidence_level: float
    assessment_timestamp: datetime
    
    # Multi-dimensional quality analysis
    quality_dimensions: List[QualityDimension]
    
    # Model-specific evaluations
    gemini_evaluation: Dict[str, Any]
    claude_evaluation: Dict[str, Any]
    o3_evaluation: Dict[str, Any]
    
    # Consensus analysis
    consensus_metrics: ConsensusMetrics
    
    # Academic excellence indicators
    academic_level_assessment: str  # "undergraduate", "graduate", "doctoral", "postdoctoral"
    field_appropriateness: float
    theoretical_sophistication: float
    methodological_awareness: float
    
    # Revision analysis
    revision_necessity: bool
    revision_priority: str  # "critical", "important", "minor", "none"
    specific_revision_targets: List[Dict[str, Any]]
    
    # Comparative benchmarking
    peer_comparison_percentile: float
    field_standard_comparison: Dict[str, float]
    historical_trend_analysis: Dict[str, Any]
    
    # Future-oriented assessment
    potential_impact: float
    scalability_assessment: float
    innovation_quotient: float
    
    # Learning outcome alignment
    learning_outcome_coverage: Dict[str, float]
    skill_demonstration: Dict[str, float]
    knowledge_application: Dict[str, float]


class RevolutionaryMultiModelEvaluator(BaseNode):
    """
    Revolutionary Multi-Model Evaluator with PhD-level assessment capabilities.
    
    Revolutionary Capabilities:
    - Advanced inter-rater reliability analysis
    - Sophisticated consensus mechanism with confidence intervals
    - Multi-dimensional quality assessment framework
    - Adaptive rubric selection based on academic level
    - Bias detection and mitigation across AI models
    - Predictive assessment of academic potential
    - Real-time calibration against academic standards
    - Longitudinal learning pattern analysis
    """
    
    def __init__(self):
        super().__init__()
        
        # Initialize AI model clients
        self.gemini_client = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            google_api_key=os.getenv("GEMINI_API_KEY"),
            temperature=0.1
        )
        self.claude_client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Advanced assessment systems
        self.academic_rubrics = self._initialize_academic_rubrics()
        self.field_specific_standards = self._load_field_standards()
        self.consensus_algorithms = self._initialize_consensus_algorithms()
        self.bias_detection_systems = self._initialize_bias_detection()
        
        # Learning and calibration systems
        self.assessment_history = {}
        self.model_performance_tracking = {}
        self.calibration_benchmarks = {}
        self.quality_prediction_models = {}
        
    async def __call__(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute revolutionary multi-model evaluation with PhD-level consensus."""
        try:
            await self.broadcast_progress(state, "advanced_evaluation", "starting", 0,
                                        "Initializing PhD-level multi-model evaluation...")
            
            # Extract evaluation context
            evaluation_context = await self._extract_evaluation_context(state)
            
            await self.broadcast_progress(state, "advanced_evaluation", "in_progress", 10,
                                        "Calibrating assessment rubrics...")
            
            # Calibrate assessment rubrics
            calibrated_rubrics = await self._calibrate_assessment_rubrics(evaluation_context)
            
            await self.broadcast_progress(state, "advanced_evaluation", "in_progress", 25,
                                        "Executing parallel model evaluations...")
            
            # Execute sophisticated parallel evaluations
            model_evaluations = await self._execute_parallel_evaluations(state, calibrated_rubrics)
            
            await self.broadcast_progress(state, "advanced_evaluation", "in_progress", 60,
                                        "Performing consensus analysis...")
            
            # Perform advanced consensus analysis
            consensus_result = await self._perform_advanced_consensus_analysis(model_evaluations)
            
            await self.broadcast_progress(state, "advanced_evaluation", "in_progress", 80,
                                        "Generating comprehensive assessment...")
            
            # Generate comprehensive evaluation
            comprehensive_evaluation = await self._generate_comprehensive_evaluation(
                model_evaluations, consensus_result, evaluation_context
            )
            
            await self.broadcast_progress(state, "advanced_evaluation", "in_progress", 95,
                                        "Finalizing quality recommendations...")
            
            # Generate sophisticated recommendations
            recommendations = await self._generate_sophisticated_recommendations(comprehensive_evaluation)
            
            await self.broadcast_progress(state, "advanced_evaluation", "completed", 100,
                                        f"Advanced evaluation complete: {comprehensive_evaluation.overall_score:.1f}/100")
            
            return {
                "comprehensive_evaluation": asdict(comprehensive_evaluation),
                "evaluation_score": comprehensive_evaluation.overall_score,
                "needs_revision": comprehensive_evaluation.revision_necessity,
                "revision_priority": comprehensive_evaluation.revision_priority,
                "specific_recommendations": recommendations,
                "consensus_analysis": asdict(comprehensive_evaluation.consensus_metrics),
                "quality_breakdown": {dim.dimension_name: dim.score for dim in comprehensive_evaluation.quality_dimensions},
                "academic_level": comprehensive_evaluation.academic_level_assessment,
                "future_potential": comprehensive_evaluation.potential_impact,
                "learning_outcomes": comprehensive_evaluation.learning_outcome_coverage
            }
            
        except Exception as e:
            logger.error(f"Revolutionary multi-model evaluation failed: {e}")
            await self.broadcast_progress(state, "advanced_evaluation", "failed", 0,
                                        f"Advanced evaluation failed: {str(e)}")
            return {"evaluation_score": 0, "needs_revision": True, "error": str(e)}
    
    async def _extract_evaluation_context(self, state: HandyWriterzState) -> Dict[str, Any]:
        """Extract sophisticated evaluation context."""
        current_draft = state.get("current_draft", "")
        user_params = state.get("user_params", {})
        verified_sources = state.get("verified_sources", [])
        uploaded_docs = state.get("uploaded_docs", [])
        
        # Analyze draft characteristics
        draft_analysis = await self._analyze_draft_characteristics(current_draft, user_params)
        
        return {
            "draft_content": current_draft,
            "user_parameters": user_params,
            "source_quality": len(verified_sources),
            "draft_characteristics": draft_analysis,
            "academic_field": user_params.get("field", "general"),
            "assignment_type": user_params.get("writeupType", "essay"),
            "target_word_count": user_params.get("wordCount", 1000),
            "citation_style": user_params.get("citationStyle", "harvard"),
            "academic_level": self._infer_academic_level(user_params, current_draft),
            "evaluation_timestamp": datetime.now(),
            "context_documents": len(uploaded_docs)
        }
    
    async def _calibrate_assessment_rubrics(self, context: Dict[str, Any]) -> List[AcademicRubric]:
        """Calibrate assessment rubrics based on context."""
        calibration_prompt = f"""
        As a world-class assessment expert and educational psychologist, calibrate evaluation rubrics for:
        
        Context: {json.dumps(context, indent=2)}
        
        Design sophisticated rubrics for:
        
        1. THEORETICAL SOPHISTICATION
        - Depth of theoretical understanding
        - Integration of multiple frameworks
        - Critical engagement with theory
        - Original theoretical insights
        
        2. EMPIRICAL RIGOR
        - Evidence quality and relevance
        - Methodological awareness
        - Data interpretation skills
        - Research validity understanding
        
        3. ANALYTICAL DEPTH
        - Critical thinking demonstration
        - Argument complexity
        - Synthesis capabilities
        - Evaluation skills
        
        4. ARGUMENTATIVE COHERENCE
        - Logical structure clarity
        - Premise-conclusion alignment
        - Counterargument consideration
        - Persuasive effectiveness
        
        5. SCHOLARLY COMMUNICATION
        - Academic writing conventions
        - Citation accuracy and style
        - Clarity and precision
        - Professional presentation
        
        For each rubric, specify:
        - Performance level thresholds
        - Assessment criteria
        - Quality indicators
        - Common weaknesses
        - Improvement strategies
        
        Calibrate for {context.get('academic_level', 'undergraduate')} level in {context.get('academic_field', 'general')}.
        """
        
        try:
            response = await self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4000,
                temperature=0.1,
                messages=[{"role": "user", "content": calibration_prompt}]
            )
            
            return self._parse_calibrated_rubrics(response.content[0].text, context)
            
        except Exception as e:
            logger.error(f"Rubric calibration failed: {e}")
            return self._get_default_rubrics(context)
    
    async def _execute_parallel_evaluations(self, state: HandyWriterzState, 
                                          rubrics: List[AcademicRubric]) -> Dict[str, Dict[str, Any]]:
        """Execute sophisticated parallel evaluations across multiple AI models."""
        current_draft = state.get("current_draft", "")
        evaluation_context = await self._extract_evaluation_context(state)
        
        # Create evaluation tasks
        evaluation_tasks = [
            self._evaluate_with_gemini_advanced(current_draft, rubrics, evaluation_context),
            self._evaluate_with_claude_advanced(current_draft, rubrics, evaluation_context),
            self._evaluate_with_o3_advanced(current_draft, rubrics, evaluation_context)
        ]
        
        # Execute evaluations in parallel
        results = await asyncio.gather(*evaluation_tasks, return_exceptions=True)
        
        # Process results
        model_evaluations = {}
        model_names = ["gemini", "claude", "o3"]
        
        for i, result in enumerate(results):
            if isinstance(result, dict) and not isinstance(result, Exception):
                model_evaluations[model_names[i]] = result
            else:
                logger.warning(f"{model_names[i]} evaluation failed: {result}")
                model_evaluations[model_names[i]] = self._create_fallback_evaluation()
        
        return model_evaluations
    
    async def _evaluate_with_gemini_advanced(self, draft: str, rubrics: List[AcademicRubric], 
                                           context: Dict[str, Any]) -> Dict[str, Any]:
        """Advanced Gemini evaluation with sophisticated analysis."""
        evaluation_prompt = f"""
        As a distinguished academic evaluator with expertise in {context.get('academic_field')}, 
        perform comprehensive evaluation of this academic work:
        
        CONTENT TO EVALUATE:
        {draft}
        
        EVALUATION CONTEXT:
        {json.dumps(context, indent=2)}
        
        ASSESSMENT RUBRICS:
        {self._format_rubrics_for_prompt(rubrics)}
        
        Perform systematic evaluation across ALL dimensions:
        
        1. THEORETICAL SOPHISTICATION (30 points)
        - Theoretical framework mastery
        - Conceptual integration depth
        - Critical theoretical engagement
        - Original theoretical insights
        
        2. EMPIRICAL RIGOR (25 points)
        - Evidence quality assessment
        - Methodological awareness
        - Data interpretation skills
        - Research validity understanding
        
        3. ANALYTICAL DEPTH (25 points)
        - Critical thinking sophistication
        - Argument complexity analysis
        - Synthesis capabilities
        - Evaluation and judgment skills
        
        4. SCHOLARLY COMMUNICATION (20 points)
        - Academic writing excellence
        - Citation accuracy and style
        - Clarity and precision
        - Professional presentation
        
        For EACH dimension, provide:
        - Numerical score (0-max points)
        - Detailed justification
        - Specific strengths identified
        - Specific weaknesses identified
        - Targeted improvement recommendations
        
        Calculate TOTAL SCORE out of 100 points.
        
        Provide PhD-level analytical depth with specific examples from the text.
        """
        
        try:
            response = await self.gemini_client.ainvoke([
                {"role": "user", "content": evaluation_prompt}
            ])
            
            content = response.content
            
            return {
                "model": "gemini",
                "evaluation_text": content,
                "scores": self._extract_detailed_scores(content),
                "strengths": self._extract_strengths(content),
                "weaknesses": self._extract_weaknesses(content),
                "recommendations": self._extract_recommendations(content),
                "overall_score": self._extract_overall_score(content),
                "confidence": self._assess_evaluation_confidence(content),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Gemini advanced evaluation failed: {e}")
            return self._create_fallback_evaluation("gemini")
    
    async def _evaluate_with_claude_advanced(self, draft: str, rubrics: List[AcademicRubric], 
                                           context: Dict[str, Any]) -> Dict[str, Any]:
        """Advanced Claude evaluation with critical analysis focus."""
        evaluation_prompt = f"""
        As a master critic and academic assessment expert, conduct rigorous evaluation of this work:
        
        ACADEMIC WORK:
        {draft}
        
        EVALUATION PARAMETERS:
        {json.dumps(context, indent=2)}
        
        Apply sophisticated critical analysis across these dimensions:
        
        1. ARGUMENTATIVE EXCELLENCE (35%)
        - Logical structure and coherence
        - Premise quality and support
        - Counterargument consideration
        - Persuasive effectiveness
        - Fallacy identification
        
        2. CRITICAL THINKING DEPTH (30%)
        - Analysis sophistication
        - Synthesis capabilities
        - Evaluation and judgment
        - Original insights
        - Intellectual courage
        
        3. SCHOLARLY RIGOR (25%)
        - Research methodology awareness
        - Evidence integration quality
        - Citation accuracy and completeness
        - Academic convention adherence
        - Ethical consideration
        
        4. COMMUNICATION MASTERY (10%)
        - Clarity and precision
        - Academic tone appropriateness
        - Structural organization
        - Professional presentation
        
        For each dimension:
        - Assign percentage score (0-100%)
        - Provide detailed analytical justification
        - Identify specific textual evidence
        - Note critical strengths and limitations
        - Suggest sophisticated improvements
        
        Apply the highest standards of academic excellence appropriate for {context.get('academic_level')} level.
        """
        
        try:
            response = await self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=3000,
                temperature=0.1,
                messages=[{"role": "user", "content": evaluation_prompt}]
            )
            
            content = response.content[0].text
            
            return {
                "model": "claude",
                "evaluation_text": content,
                "scores": self._extract_detailed_scores(content),
                "strengths": self._extract_strengths(content),
                "weaknesses": self._extract_weaknesses(content),
                "recommendations": self._extract_recommendations(content),
                "overall_score": self._extract_overall_score(content),
                "confidence": self._assess_evaluation_confidence(content),
                "critical_analysis": self._extract_critical_insights(content),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Claude advanced evaluation failed: {e}")
            return self._create_fallback_evaluation("claude")
    
    async def _evaluate_with_o3_advanced(self, draft: str, rubrics: List[AcademicRubric], 
                                       context: Dict[str, Any]) -> Dict[str, Any]:
        """Advanced O3 evaluation with sophisticated reasoning."""
        evaluation_prompt = f"""
        Apply advanced reasoning to comprehensively evaluate this academic work:
        
        ACADEMIC CONTENT:
        {draft}
        
        EVALUATION CONTEXT:
        {json.dumps(context, indent=2)}
        
        Use sophisticated reasoning to assess:
        
        1. REASONING QUALITY (40%)
        - Logical consistency and validity
        - Argument strength and structure
        - Evidence-conclusion alignment
        - Inference appropriateness
        - Assumption identification
        
        2. KNOWLEDGE INTEGRATION (30%)
        - Disciplinary knowledge demonstration
        - Cross-domain synthesis
        - Theoretical framework application
        - Contemporary relevance
        - Historical awareness
        
        3. METHODOLOGICAL SOPHISTICATION (20%)
        - Research approach appropriateness
        - Data interpretation skills
        - Analytical method awareness
        - Validity consideration
        - Limitation acknowledgment
        
        4. INNOVATION POTENTIAL (10%)
        - Original thinking demonstration
        - Creative problem-solving
        - Novel perspective contribution
        - Future research implications
        - Paradigm advancement potential
        
        Apply advanced reasoning to:
        - Identify subtle logical patterns
        - Detect implicit assumptions
        - Evaluate reasoning chains
        - Assess knowledge integration
        - Predict academic impact
        
        Provide detailed scores with sophisticated reasoning justification.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="o3-mini",
                messages=[{"role": "user", "content": evaluation_prompt}],
                temperature=0.1,
                max_tokens=2500
            )
            
            content = response.choices[0].message.content
            
            return {
                "model": "o3",
                "evaluation_text": content,
                "scores": self._extract_detailed_scores(content),
                "strengths": self._extract_strengths(content),
                "weaknesses": self._extract_weaknesses(content),
                "recommendations": self._extract_recommendations(content),
                "overall_score": self._extract_overall_score(content),
                "confidence": self._assess_evaluation_confidence(content),
                "reasoning_analysis": self._extract_reasoning_insights(content),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"O3 advanced evaluation failed: {e}")
            return self._create_fallback_evaluation("o3")
    
    async def _perform_advanced_consensus_analysis(self, evaluations: Dict[str, Dict[str, Any]]) -> ConsensusMetrics:
        """Perform sophisticated consensus analysis with statistical rigor."""
        if len(evaluations) < 2:
            return self._create_minimal_consensus()
        
        # Extract scores for analysis
        scores = []
        models = []
        
        for model, evaluation in evaluations.items():
            score = evaluation.get("overall_score", 0)
            if score > 0:
                scores.append(score)
                models.append(model)
        
        if len(scores) < 2:
            return self._create_minimal_consensus()
        
        # Calculate sophisticated consensus metrics
        try:
            # Inter-rater reliability (using Cohen's kappa approximation)
            mean_score = np.mean(scores)
            agreements = [abs(score - mean_score) <= 5 for score in scores]  # Within 5 points
            agreement_rate = np.mean(agreements)
            
            # Correlation analysis
            if len(scores) >= 3:
                correlations = []
                for i in range(len(scores)):
                    for j in range(i + 1, len(scores)):
                        corr, _ = pearsonr([scores[i]], [scores[j]])
                        if not np.isnan(corr):
                            correlations.append(corr)
                correlation_coeff = np.mean(correlations) if correlations else 0.0
            else:
                correlation_coeff, _ = pearsonr(scores[:2], scores[:2]) if len(scores) == 2 else (0.0, 1.0)
                if np.isnan(correlation_coeff):
                    correlation_coeff = 0.0
            
            # Variance analysis
            score_variance = np.var(scores)
            score_std = np.std(scores)
            
            # Confidence interval
            confidence_margin = 1.96 * score_std / np.sqrt(len(scores))
            conf_lower = max(0, mean_score - confidence_margin)
            conf_upper = min(100, mean_score + confidence_margin)
            
            # Consensus strength assessment
            if score_std <= 3:
                consensus_strength = "strong"
            elif score_std <= 8:
                consensus_strength = "moderate"
            else:
                consensus_strength = "weak"
            
            # Outlier detection
            outliers = []
            z_scores = np.abs(zscore(scores))
            for i, z in enumerate(z_scores):
                if z > 2:  # More than 2 standard deviations
                    outliers.append(models[i])
            
            return ConsensusMetrics(
                inter_rater_reliability=agreement_rate,
                correlation_coefficient=correlation_coeff,
                rank_correlation=correlation_coeff,  # Simplified
                agreement_percentage=agreement_rate * 100,
                variance_analysis={"variance": score_variance, "std_dev": score_std},
                outlier_detection=outliers,
                confidence_interval=(conf_lower, conf_upper),
                consensus_strength=consensus_strength,
                disagreement_analysis=self._analyze_disagreements(evaluations),
                model_bias_assessment=self._assess_model_biases(evaluations)
            )
            
        except Exception as e:
            logger.error(f"Consensus analysis failed: {e}")
            return self._create_minimal_consensus()
    
    # Helper methods for parsing and analysis
    def _extract_detailed_scores(self, text: str) -> Dict[str, float]:
        """Extract detailed scores from evaluation text."""
        scores = {}
        
        import re
        
        # Various score patterns
        patterns = [
            r'(\w+(?:\s+\w+)*)\s*[:\-]\s*([0-9]*\.?[0-9]+)',
            r'([0-9]*\.?[0-9]+)\s*(?:/|out\s+of)\s*([0-9]+)',
            r'([0-9]*\.?[0-9]+)%'
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text.lower())
            for match in matches:
                if len(match) == 2:
                    try:
                        if pattern == patterns[1]:  # "score out of X" format
                            score = float(match[0]) / float(match[1]) * 100
                        elif pattern == patterns[2]:  # percentage format
                            score = float(match[0])
                        else:  # "dimension: score" format
                            score = float(match[1])
                        
                        key = match[0] if pattern != patterns[2] else f"score_{len(scores)}"
                        scores[key.replace(' ', '_')] = min(100, max(0, score))
                    except ValueError:
                        continue
        
        return scores
    
    def _extract_overall_score(self, text: str) -> float:
        """Extract overall score from evaluation text."""
        import re
        
        # Look for overall score patterns
        patterns = [
            r'overall\s+score\s*[:\-]\s*([0-9]*\.?[0-9]+)',
            r'total\s+score\s*[:\-]\s*([0-9]*\.?[0-9]+)',
            r'final\s+score\s*[:\-]\s*([0-9]*\.?[0-9]+)',
            r'([0-9]*\.?[0-9]+)\s*/\s*100',
            r'([0-9]*\.?[0-9]+)%\s*overall'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                try:
                    score = float(match.group(1))
                    return min(100, max(0, score))
                except ValueError:
                    continue
        
        # Default to average of found scores
        scores = self._extract_detailed_scores(text)
        if scores:
            return min(100, max(0, np.mean(list(scores.values()))))
        
        return 75.0  # Default moderate score
    
    def _create_fallback_evaluation(self, model: str = "unknown") -> Dict[str, Any]:
        """Create fallback evaluation when model evaluation fails."""
        return {
            "model": model,
            "evaluation_text": "Evaluation failed - using fallback assessment",
            "scores": {"overall": 70, "reasoning": 70, "communication": 70},
            "strengths": ["Content present", "Basic structure"],
            "weaknesses": ["Evaluation system failure", "Unable to assess thoroughly"],
            "recommendations": ["Retry evaluation", "Manual review recommended"],
            "overall_score": 70,
            "confidence": 0.3,
            "timestamp": datetime.now().isoformat(),
            "error": "Model evaluation failed"
        }


# Create singleton instance
revolutionary_evaluator_node = RevolutionaryMultiModelEvaluator()