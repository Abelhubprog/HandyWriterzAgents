"""State management for HandyWriterz agent workflow."""

from __future__ import annotations

import operator
from typing import TypedDict, Optional, List, Dict, Any

from langchain_core.messages import BaseMessage
from langgraph.graph import add_messages
from typing_extensions import Annotated

from agent.base import UserParams, DocumentChunk, Source, EvaluationResult, TurnitinReport


class HandyWriterzState(TypedDict):
    """Main state for the HandyWriterz agent workflow."""
    
    # Core identifiers
    conversation_id: str
    user_id: str
    wallet_address: Optional[str]
    
    # User input and parameters
    messages: Annotated[List[BaseMessage], add_messages]
    user_params: UserParams
    uploaded_docs: List[DocumentChunk]
    
    # Planning phase
    outline: Optional[Dict[str, Any]]
    research_agenda: List[str]
    
    # Research phase  
    search_queries: Annotated[List[str], operator.add]
    search_results: Annotated[List[Dict[str, Any]], operator.add]  # Raw search results
    raw_search_results: Annotated[List[Dict[str, Any]], operator.add]  # Legacy field
    filtered_sources: List[Source]
    verified_sources: List[Source]
    evidence_map: Dict[str, Any]  # Evidence data for hover cards
    
    # Writing phase
    draft_content: Optional[str]
    current_draft: Optional[str]
    revision_count: int
    
    # Evaluation phase
    evaluation_results: List[EvaluationResult]
    evaluation_score: Optional[float]
    
    # Turnitin processing
    turnitin_reports: List[TurnitinReport]
    turnitin_passed: bool
    
    # Final output
    formatted_document: Optional[str]
    learning_outcomes_report: Optional[str]
    download_urls: Dict[str, str]
    
    # Workflow control
    current_node: Optional[str]
    workflow_status: str  # "pending", "in_progress", "completed", "failed"
    error_message: Optional[str]
    retry_count: int
    
    # Configuration
    max_iterations: int
    enable_tutor_review: bool
    
    # Metadata
    start_time: Optional[float]
    end_time: Optional[float]
    processing_metrics: Dict[str, Any]


class UserIntentState(TypedDict):
    """State for user intent processing node."""
    
    conversation_id: str
    user_id: str
    wallet_address: str
    is_authenticated: bool
    payment_verified: bool
    uploaded_files: List[Dict[str, Any]]
    processed_chunks: List[DocumentChunk]
    user_params: UserParams


class PlannerState(TypedDict):
    """State for the planner node."""
    
    user_prompt: str
    context_documents: List[DocumentChunk]
    user_params: UserParams
    outline: Dict[str, Any]
    research_agenda: List[str]
    estimated_complexity: str


class SearchState(TypedDict):
    """State for search agent nodes."""
    
    query: str
    search_provider: str  # "perplexity", "o3", "claude"
    results: List[Dict[str, Any]]
    search_id: str
    search_depth: str  # "quick", "deep", "comprehensive"


class SourceFilterState(TypedDict):
    """State for source filtering node."""
    
    raw_results: List[Dict[str, Any]]
    deduped_results: List[Dict[str, Any]]
    scored_sources: List[Source]
    selected_sources: List[Source]
    rejection_reasons: Dict[str, str]


class WriterState(TypedDict):
    """State for the writer node."""
    
    outline: Dict[str, Any]
    sources: List[Source]
    user_params: UserParams
    context_docs: List[DocumentChunk]
    draft: str
    word_count: int
    citation_count: int


class EvaluatorState(TypedDict):
    """State for evaluator nodes."""
    
    draft_content: str
    evaluation_criteria: Dict[str, Any]
    model_evaluations: List[EvaluationResult]
    consensus_score: float
    needs_revision: bool
    revision_suggestions: List[str]


class TurnitinState(TypedDict):
    """State for Turnitin processing."""
    
    document_content: str
    document_format: str  # "docx", "txt"
    submission_id: Optional[str]
    polling_attempts: int
    report: Optional[TurnitinReport]
    status: str  # "pending", "submitted", "processing", "completed", "failed"


class FormatterState(TypedDict):
    """State for document formatting."""
    
    final_content: str
    citation_style: str
    learning_outcomes: List[str]
    formatted_document: str
    lo_report: str
    export_formats: List[str]


class FailHandlerState(TypedDict):
    """State for error handling."""
    
    error_type: str
    error_message: str
    failed_node: str
    recovery_strategy: str
    recoverable: bool
    partial_results: Dict[str, Any]


# Specialized states for different workflow phases
class ResearchPhaseState(TypedDict):
    """Combined state for the research phase."""
    
    research_agenda: List[str]
    search_results: Dict[str, List[Dict[str, Any]]]  # Provider -> Results
    filtered_sources: List[Source]
    research_summary: str
    phase_complete: bool


class WritingPhaseState(TypedDict):
    """Combined state for the writing phase."""
    
    outline: Dict[str, Any]
    sources: List[Source]
    drafts: List[str]
    evaluations: List[EvaluationResult]
    turnitin_results: List[TurnitinReport]
    phase_complete: bool


class QualityPhaseState(TypedDict):
    """Combined state for quality assurance phase."""
    
    final_draft: str
    evaluation_results: List[EvaluationResult]
    turnitin_report: TurnitinReport
    tutor_review: Optional[Dict[str, Any]]
    quality_passed: bool


# Helper functions for state management
def get_current_word_count(state: HandyWriterzState) -> int:
    """Get current word count from draft."""
    if not state.get("current_draft"):
        return 0
    return len(state["current_draft"].split())


def get_target_word_count(state: HandyWriterzState) -> int:
    """Get target word count from user parameters."""
    return state.get("user_params", {}).get("word_count", 1000)


def is_word_count_acceptable(state: HandyWriterzState, tolerance: float = 0.1) -> bool:
    """Check if current word count is within acceptable range."""
    current = get_current_word_count(state)
    target = get_target_word_count(state)
    
    if target == 0:
        return True
        
    ratio = current / target
    return (1 - tolerance) <= ratio <= (1 + tolerance)


def get_phase_progress(state: HandyWriterzState) -> Dict[str, bool]:
    """Get completion status of each workflow phase."""
    return {
        "user_intent": bool(state.get("user_params")),
        "planning": bool(state.get("outline")),
        "research": bool(state.get("verified_sources")),
        "writing": bool(state.get("current_draft")),
        "evaluation": bool(state.get("evaluation_results")),
        "turnitin": state.get("turnitin_passed", False),
        "formatting": bool(state.get("formatted_document")),
    }


def calculate_overall_progress(state: HandyWriterzState) -> float:
    """Calculate overall workflow progress percentage."""
    phases = get_phase_progress(state)
    completed = sum(phases.values())
    total = len(phases)
    return (completed / total) * 100 if total > 0 else 0.0


def should_retry_node(state: HandyWriterzState, node_name: str, max_retries: int = 3) -> bool:
    """Determine if a node should be retried based on current state."""
    retry_count = state.get("retry_count", 0)
    return retry_count < max_retries and state.get("workflow_status") != "failed"


def update_processing_metrics(state: HandyWriterzState, node_name: str, duration: float, success: bool):
    """Update processing metrics for a completed node."""
    if "processing_metrics" not in state:
        state["processing_metrics"] = {}
    
    state["processing_metrics"][node_name] = {
        "duration": duration,
        "success": success,
        "timestamp": state.get("end_time")
    }


# State validation functions
def validate_user_params(user_params: Dict[str, Any]) -> UserParams:
    """Validate and convert user parameters."""
    try:
        return UserParams(**user_params)
    except Exception as e:
        raise ValueError(f"Invalid user parameters: {e}")


def validate_document_chunks(chunks: List[Dict[str, Any]]) -> List[DocumentChunk]:
    """Validate and convert document chunks."""
    try:
        return [DocumentChunk(**chunk) for chunk in chunks]
    except Exception as e:
        raise ValueError(f"Invalid document chunks: {e}")


def validate_sources(sources: List[Dict[str, Any]]) -> List[Source]:
    """Validate and convert sources."""
    try:
        return [Source(**source) for source in sources]
    except Exception as e:
        raise ValueError(f"Invalid sources: {e}")