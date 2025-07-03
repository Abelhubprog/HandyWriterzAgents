"""Main LangGraph orchestration for HandyWriterz academic writing workflow."""

import os
from typing import Dict, Any, List

from dotenv import load_dotenv
from langchain_core.runnables import RunnableConfig
from langgraph.graph import StateGraph, START, END
from langgraph.types import Send

from agent.handywriterz_state import HandyWriterzState
from agent.nodes.user_intent import UserIntentNode
from agent.nodes.planner import PlannerNode
from agent.nodes.search_perplexity import PerplexitySearchNode
from agent.nodes.writer import WriterNode
from agent.nodes.memory_writer import MemoryWriterNode

# Revolutionary new agents
from agent.nodes.master_orchestrator import MasterOrchestratorAgent
from agent.nodes.enhanced_user_intent import EnhancedUserIntentAgent

# Revolutionary sophisticated agents
from agent.nodes.search_o3_advanced import revolutionary_o3_search_node
from agent.nodes.search_claude_advanced import revolutionary_claude_search_node
from agent.nodes.evaluator_advanced import revolutionary_evaluator_node
from agent.nodes.turnitin_advanced import revolutionary_turnitin_node
from agent.nodes.formatter_advanced import revolutionary_formatter_node
from agent.nodes.fail_handler_advanced import revolutionary_fail_handler_node

# Existing workflow nodes
from agent.nodes.source_filter import SourceFilterNode

load_dotenv()

# Validate required environment variables
required_env_vars = [
    "GEMINI_API_KEY",
    "PERPLEXITY_API_KEY", 
    "DATABASE_URL",
    "REDIS_URL"
]

for var in required_env_vars:
    if not os.getenv(var):
        raise ValueError(f"Required environment variable {var} is not set")


class HandyWriterzOrchestrator:
    """Main orchestrator for the HandyWriterz academic writing workflow."""
    
    def __init__(self):
        # Revolutionary orchestration agents
        self.master_orchestrator = MasterOrchestratorAgent()
        self.enhanced_user_intent = EnhancedUserIntentAgent()
        
        # Existing workflow agents
        self.user_intent_node = UserIntentNode()
        self.planner_node = PlannerNode()
        self.perplexity_search_node = PerplexitySearchNode()
        self.writer_node = WriterNode()
        self.memory_writer_node = MemoryWriterNode()
        
        # Revolutionary sophisticated agents
        self.o3_search_node = revolutionary_o3_search_node
        self.claude_search_node = revolutionary_claude_search_node
        self.evaluator_node = revolutionary_evaluator_node
        self.turnitin_loop_node = revolutionary_turnitin_node
        self.formatter_node = revolutionary_formatter_node
        self.fail_handler_node = revolutionary_fail_handler_node
        
        # Existing workflow nodes
        self.source_filter_node = SourceFilterNode()
    
    def create_graph(self) -> StateGraph:
        """Create the LangGraph state graph for the workflow."""
        
        # Create the graph with our state schema
        builder = StateGraph(HandyWriterzState)
        
        # Add revolutionary orchestration nodes
        builder.add_node("master_orchestrator", self._execute_master_orchestrator)
        builder.add_node("enhanced_user_intent", self._execute_enhanced_user_intent)
        
        # Add existing workflow nodes
        builder.add_node("user_intent", self._execute_user_intent)
        builder.add_node("planner", self._execute_planner)
        builder.add_node("search_perplexity", self._execute_perplexity_search)
        
        # Add revolutionary sophisticated agents
        builder.add_node("search_o3_advanced", self._execute_o3_search)
        builder.add_node("search_claude_advanced", self._execute_claude_search)
        builder.add_node("source_filter", self._execute_source_filter)
        builder.add_node("writer", self._execute_writer)
        builder.add_node("evaluator_advanced", self._execute_evaluator)
        builder.add_node("turnitin_advanced", self._execute_turnitin_loop)
        builder.add_node("formatter_advanced", self._execute_formatter)
        builder.add_node("memory_writer", self._execute_memory_writer)
        builder.add_node("fail_handler_advanced", self._execute_fail_handler)
        
        # Define the workflow edges
        self._add_workflow_edges(builder)
        
        return builder.compile(name="handywriterz-academic-writing-agent")
    
    def _add_workflow_edges(self, builder: StateGraph):
        """Add edges to define the revolutionary workflow."""
        
        # 🎭 START WITH MASTER ORCHESTRATOR - Revolutionary workflow intelligence
        builder.add_edge(START, "master_orchestrator")
        
        # 🎯 Master Orchestrator determines optimal workflow path
        builder.add_conditional_edges(
            "master_orchestrator",
            self._route_from_orchestrator,
            ["enhanced_user_intent", "user_intent"]  # Choose based on complexity
        )
        
        # 🚀 Enhanced User Intent with revolutionary analysis
        builder.add_edge("enhanced_user_intent", "planner")
        
        # 📊 Legacy user intent fallback
        builder.add_edge("user_intent", "planner")
        
        # After planning, trigger parallel sophisticated search agents
        builder.add_conditional_edges(
            "planner",
            self._route_to_search_agents,
            ["search_perplexity", "search_o3_advanced", "search_claude_advanced"]
        )
        
        # From all searches to source filter (sophisticated aggregation)
        builder.add_edge("search_perplexity", "source_filter")
        builder.add_edge("search_o3_advanced", "source_filter")
        builder.add_edge("search_claude_advanced", "source_filter")
        
        # From source filter to writer
        builder.add_edge("source_filter", "writer")
        
        # From writer to advanced evaluation
        builder.add_edge("writer", "evaluator_advanced")
        
        # Conditional routing after evaluation
        builder.add_conditional_edges(
            "evaluator_advanced",
            self._route_after_evaluation,
            ["writer", "turnitin_advanced", "fail_handler_advanced"]
        )
        
        # From Turnitin to conditional routing
        builder.add_conditional_edges(
            "turnitin_advanced",
            self._route_after_turnitin,
            ["writer", "formatter_advanced", "fail_handler_advanced"]
        )
        
        # From formatter to memory writer for fingerprint storage
        builder.add_edge("formatter_advanced", "memory_writer")
        
        # Complete workflow
        builder.add_edge("memory_writer", END)
        
        # Fail handler routes back to appropriate recovery
        builder.add_conditional_edges(
            "fail_handler_advanced",
            self._route_from_fail_handler,
            ["writer", "search_perplexity", END]
        )
        
        # TODO: Add more sophisticated routing when all nodes are implemented
        # builder.add_conditional_edges(
        #     "source_filter",
        #     self._route_after_source_filter,
        #     ["writer", "fail_handler"]
        # )
        
        # builder.add_conditional_edges(
        #     "evaluator", 
        #     self._route_after_evaluation,
        #     ["writer", "turnitin_loop", "fail_handler"]
        # )
        
        # builder.add_conditional_edges(
        #     "turnitin_loop",
        #     self._route_after_turnitin,
        #     ["writer", "formatter", "fail_handler"]
        # )
    
    # Revolutionary Node execution methods
    async def _execute_master_orchestrator(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute revolutionary Master Orchestrator agent."""
        try:
            result = await self.master_orchestrator(state, config)
            return {**result, "current_node": "master_orchestrator"}
        except Exception as e:
            return await self._handle_node_error(state, "master_orchestrator", e)
    
    async def _execute_enhanced_user_intent(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute revolutionary Enhanced User Intent agent."""
        try:
            result = await self.enhanced_user_intent(state, config)
            return {**result, "current_node": "enhanced_user_intent"}
        except Exception as e:
            return await self._handle_node_error(state, "enhanced_user_intent", e)
    
    # Legacy Node execution methods
    async def _execute_user_intent(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute user intent processing."""
        try:
            result = await self.user_intent_node(state, config)
            return {**result, "current_node": "user_intent"}
        except Exception as e:
            return await self._handle_node_error(state, "user_intent", e)
    
    async def _execute_planner(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute planning."""
        try:
            result = await self.planner_node(state, config)
            return {**result, "current_node": "planner"}
        except Exception as e:
            return await self._handle_node_error(state, "planner", e)
    
    async def _execute_perplexity_search(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute Perplexity search."""
        try:
            result = await self.perplexity_search_node(state, config)
            # Store search results for source filter processing
            search_results = self._convert_perplexity_to_search_format(result.get("perplexity_results", []))
            return {
                **result, 
                "search_results": search_results,
                "current_node": "search_perplexity"
            }
        except Exception as e:
            return await self._handle_node_error(state, "search_perplexity", e)
    
    async def _execute_source_filter(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute source filtering."""
        try:
            result = await self.source_filter_node(state, config)
            return {**result, "current_node": "source_filter"}
        except Exception as e:
            return await self._handle_node_error(state, "source_filter", e)
    
    async def _execute_writer(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute writing."""
        try:
            result = await self.writer_node(state, config)
            return {**result, "current_node": "writer"}
        except Exception as e:
            return await self._handle_node_error(state, "writer", e)
    
    async def _execute_memory_writer(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute memory writer for user fingerprints."""
        try:
            result = await self.memory_writer_node(state, config)
            return {**result, "current_node": "memory_writer", "workflow_status": "completed"}
        except Exception as e:
            return await self._handle_node_error(state, "memory_writer", e)
    
    # Revolutionary sophisticated agent execution methods
    async def _execute_o3_search(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute revolutionary O3 search agent."""
        try:
            result = await self.o3_search_node(state, config)
            return {**result, "current_node": "search_o3_advanced"}
        except Exception as e:
            return await self._handle_node_error(state, "search_o3_advanced", e)
    
    async def _execute_claude_search(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute revolutionary Claude search agent."""
        try:
            result = await self.claude_search_node(state, config)
            return {**result, "current_node": "search_claude_advanced"}
        except Exception as e:
            return await self._handle_node_error(state, "search_claude_advanced", e)
    
    async def _execute_evaluator(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute revolutionary multi-model evaluator."""
        try:
            result = await self.evaluator_node(state, config)
            return {**result, "current_node": "evaluator_advanced"}
        except Exception as e:
            return await self._handle_node_error(state, "evaluator_advanced", e)
    
    async def _execute_turnitin_loop(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute revolutionary Turnitin agent."""
        try:
            result = await self.turnitin_loop_node(state, config)
            return {**result, "current_node": "turnitin_advanced"}
        except Exception as e:
            return await self._handle_node_error(state, "turnitin_advanced", e)
    
    async def _execute_formatter(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute revolutionary document formatter."""
        try:
            result = await self.formatter_node(state, config)
            return {**result, "current_node": "formatter_advanced"}
        except Exception as e:
            return await self._handle_node_error(state, "formatter_advanced", e)
    
    async def _execute_fail_handler(self, state: HandyWriterzState, config: RunnableConfig) -> Dict[str, Any]:
        """Execute revolutionary fail handler."""
        try:
            result = await self.fail_handler_node(state, config)
            return {**result, "current_node": "fail_handler_advanced"}
        except Exception as e:
            # Meta-failure handling
            return {
                "workflow_status": "critical_failure",
                "error_message": f"Fail handler failed: {str(e)}",
                "current_node": "critical_failure",
                "escalation_required": True
            }
    
    # Revolutionary Routing functions
    def _route_from_orchestrator(self, state: HandyWriterzState) -> str:
        """Revolutionary routing from Master Orchestrator based on workflow intelligence."""
        orchestration_result = state.get("orchestration_result", {})
        workflow_intelligence = orchestration_result.get("workflow_intelligence", {})
        
        # Determine complexity and route accordingly
        complexity = workflow_intelligence.get("academic_complexity", 5.0)
        success_probability = orchestration_result.get("success_probability", 0.8)
        
        # Use Enhanced User Intent for complex or high-value requests
        if complexity >= 7.0 or success_probability >= 0.9:
            return "enhanced_user_intent"
        else:
            return "user_intent"  # Fallback to legacy processing
    
    # Revolutionary parallel routing  
    def _route_to_search_agents(self, state: HandyWriterzState) -> List[Send]:
        """Route to sophisticated parallel search agents."""
        # Execute all search agents in parallel for maximum source diversity
        return [
            Send("search_perplexity", state),
            Send("search_o3_advanced", state), 
            Send("search_claude_advanced", state)
        ]
    
    def _route_after_source_filter(self, state: HandyWriterzState) -> str:
        """Route after source filtering."""
        verified_sources = state.get("verified_sources", [])
        
        if len(verified_sources) < 3:
            return "fail_handler"  # Not enough sources
        
        return "writer"
    
    def _route_after_evaluation(self, state: HandyWriterzState) -> str:
        """Route after revolutionary evaluation."""
        evaluation_result = state.get("comprehensive_evaluation", {})
        evaluation_score = evaluation_result.get("overall_score", 0)
        needs_revision = evaluation_result.get("needs_revision", True)
        revision_count = state.get("revision_count", 0)
        
        if evaluation_score >= 85 and not needs_revision:
            return "turnitin_advanced"  # High quality, proceed to academic integrity check
        elif revision_count < 3 and evaluation_score >= 60:
            return "writer"  # Needs revision but recoverable
        else:
            return "fail_handler_advanced"  # Too many revisions or too low quality
    
    def _route_after_turnitin(self, state: HandyWriterzState) -> str:
        """Route after revolutionary Turnitin processing."""
        turnitin_passed = state.get("turnitin_passed", False)
        similarity_passed = state.get("similarity_passed", False)
        ai_detection_passed = state.get("ai_detection_passed", False)
        revision_count = state.get("revision_count", 0)
        
        if turnitin_passed and similarity_passed and ai_detection_passed:
            return "formatter_advanced"  # Perfect - ready for sophisticated formatting
        elif revision_count < 4 and (similarity_passed or ai_detection_passed):
            return "writer"  # Partially passed, needs targeted revision
        else:
            return "fail_handler_advanced"  # Failed academic integrity standards
    
    def _route_from_fail_handler(self, state: HandyWriterzState) -> str:
        """Route from revolutionary fail handler based on recovery strategy."""
        recovery_result = state.get("recovery_successful", False)
        recovery_strategy = state.get("recovery_strategy", "")
        
        if recovery_result and "retry" in recovery_strategy.lower():
            return "writer"  # Recovery successful, retry writing
        elif recovery_result and "search" in recovery_strategy.lower():
            return "search_perplexity"  # Recovery suggests new search
        else:
            return END  # Unrecoverable failure, end workflow
    
    # Helper methods
    def _convert_perplexity_to_search_format(self, perplexity_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Convert Perplexity results to standard search format."""
        sources = []
        
        for result in perplexity_results:
            result_sources = result.get("sources", [])
            for source in result_sources:
                formatted_source = {
                    "url": source.get("url", ""),
                    "title": source.get("title", ""),
                    "author": source.get("author", "Unknown"),
                    "year": source.get("year", 2024),
                    "abstract": source.get("snippet", ""),
                    "credibility_score": source.get("credibility_score", 0.5),
                    "relevance_score": 0.8,  # Default relevance
                    "citation": self._format_citation(source),
                    "doi": source.get("doi", "")
                }
                sources.append(formatted_source)
        
        # Limit to top sources and remove duplicates
        unique_sources = []
        seen_urls = set()
        
        for source in sources:
            if source["url"] and source["url"] not in seen_urls:
                seen_urls.add(source["url"])
                unique_sources.append(source)
        
        # Sort by credibility and take top 15
        unique_sources.sort(key=lambda x: x["credibility_score"], reverse=True)
        return unique_sources[:15]
    
    def _format_citation(self, source: Dict[str, Any]) -> str:
        """Format a citation in Harvard style (temporary implementation)."""
        author = source.get("author", "Unknown")
        year = source.get("year", "n.d.")
        title = source.get("title", "Untitled")
        
        # Simplified Harvard format
        return f"{author} ({year}). {title}."
    
    async def _handle_node_error(self, state: HandyWriterzState, node_name: str, error: Exception) -> Dict[str, Any]:
        """Handle node execution errors."""
        error_info = {
            "workflow_status": "failed",
            "error_message": str(error),
            "failed_node": node_name,
            "current_node": "fail_handler"
        }
        
        # Increment retry count
        retry_count = state.get("retry_count", 0) + 1
        error_info["retry_count"] = retry_count
        
        # Determine if error is recoverable
        if retry_count < 3 and hasattr(error, 'recoverable') and error.recoverable:
            error_info["workflow_status"] = "retry_pending"
        
        return error_info


# Create the main graph instance
def create_handywriterz_graph() -> StateGraph:
    """Create and return the HandyWriterz workflow graph."""
    orchestrator = HandyWriterzOrchestrator()
    return orchestrator.create_graph()


# Export the main graph
handywriterz_graph = create_handywriterz_graph()