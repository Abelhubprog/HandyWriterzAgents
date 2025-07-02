"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Import new components
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { CostDisplay, CompactCostDisplay } from "@/components/CostDisplay";
import { 
  TimelineStepSkeleton, 
  EvidenceCardSkeleton, 
  ChatMessageSkeleton,
  ShimmerSkeleton 
} from "@/components/skeletons";

// Import hooks
import { useSettings } from "@/contexts/SettingsContext";
import { useAppShortcuts, useFocusMode } from "@/hooks/useKeyboardShortcuts";

import { 
  Upload, 
  Send, 
  FileText, 
  Brain, 
  Search, 
  PenTool, 
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Wallet,
  Settings,
  X,
  Mic,
  Focus,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Square,
  Copy
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ProcessStep {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: number;
  message?: string;
  tokensUsed?: number;
  cost?: number;
  startTime?: Date;
  endTime?: Date;
}

interface UserParams {
  wordCount: number;
  field: string;
  writeupType: string;
  sourceAgeYears: number;
  region: string;
  citationStyle: string;
}

interface WizardPreferences {
  inputMethod: "upload" | "voice" | "text";
  template: "essay" | "report" | "dissertation" | "article";
  showWizardCompleted: boolean;
}

export default function EnhancedChatPage() {
  const { settings, updateSettings } = useSettings();
  const { isFocusMode, toggleFocusMode } = useFocusMode();

  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardPreferences, setWizardPreferences] = useState<WizardPreferences | null>(null);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Cost tracking
  const [currentCost, setCurrentCost] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);

  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    { id: "auth", name: "Authentication", status: "pending", progress: 0, cost: 0 },
    { id: "planning", name: "Planning & Outline", status: "pending", progress: 0, cost: 0 },
    { id: "research", name: "Academic Research", status: "pending", progress: 0, cost: 0 },
    { id: "writing", name: "Content Generation", status: "pending", progress: 0, cost: 0 },
    { id: "evaluation", name: "Quality Evaluation", status: "pending", progress: 0, cost: 0 },
    { id: "plagiarism", name: "Plagiarism Check", status: "pending", progress: 0, cost: 0 },
    { id: "formatting", name: "Final Formatting", status: "pending", progress: 0, cost: 0 },
  ]);

  const [userParams, setUserParams] = useState<UserParams>({
    wordCount: 1000,
    field: "general",
    writeupType: wizardPreferences?.template || "essay",
    sourceAgeYears: 10,
    region: "UK",
    citationStyle: settings.defaultCitation
  });

  const [showParamPanel, setShowParamPanel] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Calculate estimated cost
  useEffect(() => {
    const pages = Math.ceil(userParams.wordCount / 275);
    const costPerPage = 12; // £12 per page
    setEstimatedCost(pages * costPerPage);
  }, [userParams.wordCount]);

  // Update citation style from settings
  useEffect(() => {
    setUserParams(prev => ({ 
      ...prev, 
      citationStyle: settings.defaultCitation 
    }));
  }, [settings.defaultCitation]);

  // Function definitions
  const startWritingProcess = async () => {
    if (!prompt.trim()) {
      addMessage("system", "Please enter your writing prompt.");
      return;
    }

    if (!isWalletConnected) {
      addMessage("system", "Please connect your wallet first to proceed with payment.");
      return;
    }

    setIsProcessing(true);
    setIsPaused(false);
    const startTime = Date.now();
    
    addMessage("user", prompt);
    addMessage("assistant", "Starting your academic writing process. You can watch the progress in the timeline on the right.", true);

    try {
      const response = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          user_params: userParams,
          auth_token: "mock_token",
          payment_transaction_id: "mock_tx",
          uploaded_file_urls: []
        })
      });

      const result = await response.json();
      
      if (result.conversation_id) {
        setConversationId(result.conversation_id);
        connectToEventStream(result.conversation_id);
        addMessage("assistant", "Process initiated! You can watch the progress in the timeline on the right.");
      }
    } catch (error) {
      addMessage("system", "Failed to start the writing process. Please try again.");
      setIsProcessing(false);
    }

    setPrompt("");
  };

  const stopWritingProcess = () => {
    setIsProcessing(false);
    setIsPaused(false);
    addMessage("system", "Writing process stopped.");
    // TODO: Send stop signal to backend
  };

  const saveDraft = () => {
    if (settings.autoSave) {
      // Auto-save is handled automatically
      addMessage("system", "Draft saved automatically.");
    } else {
      // Manual save
      addMessage("system", "Draft saved manually.");
    }
  };

  const downloadResult = () => {
    addMessage("system", "Downloading your completed work...");
    // TODO: Implement download functionality
  };

  // Keyboard shortcuts
  useAppShortcuts({
    onRun: startWritingProcess,
    onStop: stopWritingProcess,
    onSave: saveDraft,
    onToggleFocus: toggleFocusMode,
    onUpload: () => fileInputRef.current?.click(),
    onDownload: downloadResult,
  });

  // Handle file upload with optimistic preview
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['.pdf', '.docx', '.txt', '.md'];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return validTypes.includes(extension);
    });
    
    // Optimistic preview - show files immediately
    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    // TODO: Start background upload to R2
    validFiles.forEach(file => {
      uploadFileToR2(file).catch(error => {
        console.error('Upload failed:', error);
        // Remove failed file from preview
        setUploadedFiles(prev => prev.filter(f => f !== file));
        addMessage("system", `Failed to upload ${file.name}. Please try again.`);
      });
    });
  };

  const uploadFileToR2 = async (file: File): Promise<string> => {
    // Simulate upload process
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve(`https://r2.example.com/${file.name}`);
        } else {
          reject(new Error('Upload failed'));
        }
      }, 2000);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // TODO: Implement actual voice recording with Whisper API
    } catch (error) {
      addMessage("system", "Failed to access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setRecordingTime(0);
    // TODO: Process recording and convert to text
  };

  const connectWallet = async () => {
    try {
      // Simulate wallet connection with Dynamic.xyz
      setIsWalletConnected(true);
      addMessage("system", "Wallet connected successfully. You can now start your academic writing request.");
    } catch (error) {
      addMessage("system", "Failed to connect wallet. Please try again.");
    }
  };

  const addMessage = (type: "user" | "assistant" | "system", content: string, isStreaming = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      isStreaming
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateProcessStep = (
    stepId: string, 
    status: ProcessStep["status"], 
    progress: number, 
    message?: string,
    tokensUsed?: number,
    cost?: number
  ) => {
    setProcessSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            status, 
            progress, 
            message,
            tokensUsed,
            cost,
            startTime: status === "in_progress" ? new Date() : step.startTime,
            endTime: status === "completed" || status === "failed" ? new Date() : step.endTime
          }
        : step
    ));
    
    if (tokensUsed) {
      setTotalTokensUsed(prev => prev + tokensUsed);
    }
    if (cost) {
      setCurrentCost(prev => prev + cost);
    }
  };

  const pauseWritingProcess = () => {
    setIsPaused(true);
    addMessage("system", "Writing process paused. Click resume to continue.");
    // TODO: Send pause signal to backend
  };

  const resumeWritingProcess = () => {
    setIsPaused(false);
    addMessage("system", "Writing process resumed.");
    // TODO: Send resume signal to backend
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addMessage("system", "Copied to clipboard!");
  };

  const connectToEventStream = (convId: string) => {
    const eventSource = new EventSource(`/api/stream/${convId}`);
    setIsConnected(true);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "node_start":
            updateProcessStep(data.data.node, "in_progress", 0, "Starting...");
            break;
          
          case "node_progress":
            updateProcessStep(
              data.data.node, 
              "in_progress", 
              data.data.progress,
              data.data.message,
              data.data.tokens_used,
              data.data.cost
            );
            break;
          
          case "node_complete":
            updateProcessStep(
              data.data.node, 
              "completed", 
              100, 
              "Completed",
              data.data.tokens_used,
              data.data.cost
            );
            break;
          
          case "streaming_content":
            updateStreamingMessage(data.data.content);
            break;
          
          case "process_complete":
            setIsProcessing(false);
            addMessage("assistant", "Your academic writing is complete! You can download it now.");
            break;
          
          case "error":
            addMessage("system", `Error: ${data.data.message}`);
            break;
        }
      } catch (error) {
        console.error("Failed to parse SSE data:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      addMessage("system", "Connection lost. Attempting to reconnect...");
    };
  };

  const updateStreamingMessage = (content: string) => {
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.isStreaming) {
        return [
          ...prev.slice(0, -1),
          { ...lastMessage, content: lastMessage.content + content }
        ];
      }
      return prev;
    });
  };

  const handleWizardComplete = (preferences: WizardPreferences) => {
    setWizardPreferences(preferences);
    setUserParams(prev => ({ ...prev, writeupType: preferences.template }));
    setShowWizard(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 ${isFocusMode ? 'focus-mode' : ''}`}>
      {/* Onboarding Wizard */}
      {showWizard && (
        <OnboardingWizard onComplete={handleWizardComplete} />
      )}

      <div className="flex h-screen">
        {/* Parameter Panel */}
        <div className={`param-panel w-80 border-r/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl transition-all duration-300 ${isFocusMode ? 'hidden' : ''}`}>
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Parameters</h2>
              <div className="flex items-center gap-2">
                <SettingsDrawer />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFocusMode}
                  className="focus-mode-toggle"
                >
                  <Focus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-5rem)] p-4">
            <div className="space-y-6">
              {/* Cost Display */}
              <CostDisplay
                currentCost={currentCost}
                estimatedTotal={estimatedCost}
                tokensUsed={totalTokensUsed}
                processingTime={processingTime}
                isProcessing={isProcessing}
                showBreakdown={isProcessing}
              />

              {/* Word Count */}
              <div className="space-y-2">
                <Label htmlFor="wordCount">Word Count: {userParams.wordCount}</Label>
                <Slider
                  id="wordCount"
                  min={250}
                  max={10000}
                  step={250}
                  value={[userParams.wordCount]}
                  onValueChange={(value) => 
                    setUserParams(prev => ({ ...prev, wordCount: value[0] }))
                  }
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>250</span>
                  <span>10,000</span>
                </div>
              </div>

              {/* Academic Field */}
              <div className="space-y-2">
                <Label htmlFor="field">Academic Field</Label>
                <Select
                  value={userParams.field}
                  onValueChange={(value) => 
                    setUserParams(prev => ({ ...prev, field: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="psychology">Psychology</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="literature">Literature</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="medicine">Medicine</SelectItem>
                    <SelectItem value="law">Law</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Writing Type */}
              <div className="space-y-2">
                <Label htmlFor="writeupType">Writing Type</Label>
                <Select
                  value={userParams.writeupType}
                  onValueChange={(value) => 
                    setUserParams(prev => ({ ...prev, writeupType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="dissertation">Dissertation</SelectItem>
                    <SelectItem value="article">Journal Article</SelectItem>
                    <SelectItem value="thesis">Thesis</SelectItem>
                    <SelectItem value="review">Literature Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Citation Style */}
              <div className="space-y-2">
                <Label htmlFor="citationStyle">Citation Style</Label>
                <Select
                  value={userParams.citationStyle}
                  onValueChange={(value) => 
                    setUserParams(prev => ({ ...prev, citationStyle: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harvard">Harvard</SelectItem>
                    <SelectItem value="apa">APA</SelectItem>
                    <SelectItem value="vancouver">Vancouver</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Source Documents</Label>
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload PDF, DOCX, or TXT files
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Wallet Connection */}
              <div className="space-y-2">
                {!isWalletConnected ? (
                  <Button 
                    onClick={connectWallet} 
                    className="w-full"
                    variant="outline"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">Wallet Connected</span>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="main-content flex-1 flex flex-col bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl">
          {/* Header */}
          <div className="border-b border-gray-200/50 dark:border-gray-700/50 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">HandyWriterz</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AI-Powered Academic Writing Assistant
                </p>
              </div>
              
              {/* Focus Mode Toggle Button (hidden in focus mode) */}
              {isFocusMode && (
                <Button
                  variant="ghost"
                  onClick={toggleFocusMode}
                  className="focus-mode-toggle"
                >
                  <Maximize2 className="h-4 w-4" />
                  <span className="ml-2">Exit Focus</span>
                </Button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <Brain className="relative mx-auto h-16 w-16 text-blue-500 mb-4 animate-float" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">Ready to help with your academic writing</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Describe your assignment or upload source materials to get started
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">Essays</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">Reports</span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">Research Papers</span>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type !== "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Brain className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                      message.type === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-200 dark:shadow-blue-800/50"
                        : message.type === "system"
                        ? "bg-gray-100/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border border-gray-200/50 dark:border-gray-700/50"
                        : "bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-gray-200 dark:shadow-gray-800/50"
                    }`}
                    role={message.type === "assistant" ? "status" : undefined}
                    aria-live={message.isStreaming ? "polite" : undefined}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-50">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    
                    {message.type === "assistant" && !message.isStreaming && (
                      <div className="mt-2 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {message.type === "user" && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">U</span>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Loading states */}
              {isProcessing && messages[messages.length - 1]?.isStreaming && (
                <ChatMessageSkeleton />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isProcessing && (
                    <>
                      {isPaused ? (
                        <Button onClick={resumeWritingProcess} size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      ) : (
                        <Button onClick={pauseWritingProcess} size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      <Button onClick={stopWritingProcess} size="sm" variant="destructive">
                        <Square className="h-4 w-4 mr-1" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>
                
                {currentCost > 0 && (
                  <CompactCostDisplay currentCost={currentCost} isProcessing={isProcessing} />
                )}
              </div>

              {/* Input Form */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your academic writing requirements... (⌘+Enter to start)"
                    className="min-h-[60px] pr-20 resize-none"
                    disabled={isProcessing}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        startWritingProcess();
                      }
                    }}
                  />
                  
                  {/* Voice Input Button */}
                  <div className="absolute right-2 bottom-2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={isRecording ? "text-red-600" : ""}
                    >
                      <Mic className="h-4 w-4" />
                      {isRecording && (
                        <span className="ml-1 text-xs">{formatTime(recordingTime)}</span>
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button 
                  onClick={startWritingProcess}
                  disabled={!prompt.trim() || isProcessing || !isWalletConnected}
                  className="px-6"
                >
                  {isProcessing ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Hints */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Press ⌘+Enter to start • ? for shortcuts
                </span>
                {estimatedCost > 0 && (
                  <span>
                    Estimated cost: £{estimatedCost.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Process Timeline */}
        <div className={`timeline-panel w-80 border-l/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl transition-all duration-300 ${isFocusMode ? 'hidden' : ''}`}>
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Process Timeline</h2>
            {isProcessing && (
              <p className="text-sm text-muted-foreground">
                Writing in progress...
              </p>
            )}
          </div>
          
          <ScrollArea className="h-[calc(100vh-5rem)] p-4">
            <div className="space-y-4">
              {processSteps.map((step) => (
                <div key={step.id} className="space-y-2">
                  {step.status === "pending" && !isProcessing ? (
                    <TimelineStepSkeleton />
                  ) : (
                    <Card className={`transition-colors ${
                      step.status === "completed" ? "bg-green-50 dark:bg-green-900/20" :
                      step.status === "in_progress" ? "bg-blue-50 dark:bg-blue-900/20" :
                      step.status === "failed" ? "bg-red-50 dark:bg-red-900/20" :
                      ""
                    }`}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {step.status === "completed" && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {step.status === "in_progress" && <Clock className="h-4 w-4 text-blue-600 animate-spin" />}
                          {step.status === "failed" && <AlertCircle className="h-4 w-4 text-red-600" />}
                          {step.status === "pending" && <div className="h-4 w-4 rounded-full border-2 border-muted" />}
                          
                          <span className="font-medium text-sm">{step.name}</span>
                        </div>
                        
                        {step.status !== "pending" && (
                          <Progress value={step.progress} className="mb-2" />
                        )}
                        
                        {step.message && (
                          <p className="text-xs text-muted-foreground mb-1">{step.message}</p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {step.tokensUsed && (
                            <span>{step.tokensUsed.toLocaleString()} tokens</span>
                          )}
                          {step.cost && step.cost > 0 && (
                            <span>£{step.cost.toFixed(2)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
            
            {/* Timeline Footer with Total Cost */}
            {currentCost > 0 && (
              <div className="mt-6 pt-4 border-t">
                <CompactCostDisplay currentCost={currentCost} isProcessing={isProcessing} />
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
