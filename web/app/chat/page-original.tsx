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
  X
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

interface ProcessStep {
  id: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: number;
  message?: string;
}

interface UserParams {
  wordCount: number;
  field: string;
  writeupType: string;
  sourceAgeYears: number;
  region: string;
  citationStyle: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    { id: "auth", name: "Authentication", status: "pending", progress: 0 },
    { id: "planning", name: "Planning & Outline", status: "pending", progress: 0 },
    { id: "research", name: "Academic Research", status: "pending", progress: 0 },
    { id: "writing", name: "Content Generation", status: "pending", progress: 0 },
    { id: "evaluation", name: "Quality Evaluation", status: "pending", progress: 0 },
    { id: "plagiarism", name: "Plagiarism Check", status: "pending", progress: 0 },
    { id: "formatting", name: "Final Formatting", status: "pending", progress: 0 },
  ]);

  const [userParams, setUserParams] = useState<UserParams>({
    wordCount: 1000,
    field: "general",
    writeupType: "essay",
    sourceAgeYears: 10,
    region: "UK",
    citationStyle: "Harvard"
  });

  const [showParamPanel, setShowParamPanel] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate estimated cost
  useEffect(() => {
    const pages = Math.ceil(userParams.wordCount / 275);
    const costPerPage = 12; // £12 per page
    setEstimatedCost(pages * costPerPage);
  }, [userParams.wordCount]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['.pdf', '.docx', '.txt', '.md'];
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return validTypes.includes(extension);
    });
    
    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const connectWallet = async () => {
    // This would integrate with Dynamic.xyz
    try {
      // Simulate wallet connection
      setIsWalletConnected(true);
      addMessage("system", "Wallet connected successfully. You can now start your academic writing request.");
    } catch (error) {
      addMessage("system", "Failed to connect wallet. Please try again.");
    }
  };

  const addMessage = (type: "user" | "assistant" | "system", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const updateProcessStep = (stepId: string, status: ProcessStep["status"], progress: number, message?: string) => {
    setProcessSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, progress, message }
        : step
    ));
  };

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
    addMessage("user", prompt);
    addMessage("assistant", "Starting your academic writing process. I'll guide you through each step...");

    try {
      // Start the writing process
      const response = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          user_params: userParams,
          auth_token: "mock_token", // This would come from Dynamic.xyz
          payment_transaction_id: "mock_tx", // This would come from the payment
          uploaded_file_urls: [] // URLs from file uploads
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
            updateProcessStep(data.data.node, "in_progress", data.data.progress || 50, data.data.message);
            break;
          
          case "node_complete":
            updateProcessStep(data.data.node, "completed", 100, "Completed");
            break;
          
          case "token":
            // Handle streaming tokens
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.type === "assistant" && lastMessage.content.includes("Writing content:")) {
                return prev.slice(0, -1).concat({
                  ...lastMessage,
                  content: lastMessage.content + data.data.token
                });
              } else {
                return [...prev, {
                  id: Date.now().toString(),
                  type: "assistant",
                  content: "Writing content: " + data.data.token,
                  timestamp: new Date()
                }];
              }
            });
            break;
          
          case "workflow_complete":
            setIsProcessing(false);
            addMessage("assistant", "🎉 Your academic document has been completed! You can now download it below.");
            break;
          
          case "workflow_failed":
            setIsProcessing(false);
            addMessage("system", `Process failed: ${data.data.error || "Unknown error"}`);
            break;
        }
      } catch (error) {
        console.error("Error parsing event:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };
  };

  const getStepIcon = (step: ProcessStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Parameter Panel */}
      {showParamPanel && (
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Writing Parameters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowParamPanel(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Wallet Connection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isWalletConnected ? (
                  <Button onClick={connectWallet} className="w-full">
                    Connect Wallet
                  </Button>
                ) : (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Wallet Connected
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Estimated cost: £{estimatedCost}
                </div>
              </CardContent>
            </Card>

            {/* Word Count */}
            <div className="space-y-2">
              <Label>Word Count: {userParams.wordCount}</Label>
              <Slider
                value={[userParams.wordCount]}
                onValueChange={([value]) => setUserParams(prev => ({ ...prev, wordCount: value }))}
                min={250}
                max={10000}
                step={250}
                className="w-full"
              />
              <div className="text-xs text-gray-500">
                Pages: {Math.ceil(userParams.wordCount / 275)}
              </div>
            </div>

            {/* Academic Field */}
            <div className="space-y-2">
              <Label>Academic Field</Label>
              <Select value={userParams.field} onValueChange={(value) => setUserParams(prev => ({ ...prev, field: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="adult-nursing">Adult Nursing</SelectItem>
                  <SelectItem value="mental-health-nursing">Mental Health Nursing</SelectItem>
                  <SelectItem value="pediatric-nursing">Pediatric Nursing</SelectItem>
                  <SelectItem value="health-social-care">Health & Social Care</SelectItem>
                  <SelectItem value="social-work">Social Work</SelectItem>
                  <SelectItem value="law">Law</SelectItem>
                  <SelectItem value="medicine">Medicine</SelectItem>
                  <SelectItem value="psychology">Psychology</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={userParams.writeupType} onValueChange={(value) => setUserParams(prev => ({ ...prev, writeupType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="dissertation">Dissertation</SelectItem>
                  <SelectItem value="case-study">Case Study</SelectItem>
                  <SelectItem value="research-paper">Research Paper</SelectItem>
                  <SelectItem value="reflection">Reflection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Source Age */}
            <div className="space-y-2">
              <Label>Source Age Limit: {userParams.sourceAgeYears} years</Label>
              <Slider
                value={[userParams.sourceAgeYears]}
                onValueChange={([value]) => setUserParams(prev => ({ ...prev, sourceAgeYears: value }))}
                min={2}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            {/* Region */}
            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={userParams.region} onValueChange={(value) => setUserParams(prev => ({ ...prev, region: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="EU">European Union</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Citation Style */}
            <div className="space-y-2">
              <Label>Citation Style</Label>
              <Select value={userParams.citationStyle} onValueChange={(value) => setUserParams(prev => ({ ...prev, citationStyle: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Harvard">Harvard</SelectItem>
                  <SelectItem value="APA">APA</SelectItem>
                  <SelectItem value="MLA">MLA</SelectItem>
                  <SelectItem value="Chicago">Chicago</SelectItem>
                  <SelectItem value="Vancouver">Vancouver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload Documents</Label>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploadedFiles.length > 0 && (
                <div className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <span className="truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold">HandyWriterz AI Assistant</h1>
              {isConnected && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Connected
                </Badge>
              )}
            </div>
            {!showParamPanel && (
              <Button
                variant="outline"
                onClick={() => setShowParamPanel(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Welcome to HandyWriterz</h3>
                <p>Enter your academic writing prompt below to get started.</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : message.type === "system"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your academic writing prompt here..."
              className="flex-1 min-h-[60px] max-h-[200px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  startWritingProcess();
                }
              }}
              disabled={isProcessing}
            />
            <Button
              onClick={startWritingProcess}
              disabled={isProcessing || !prompt.trim()}
              size="lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Press Ctrl+Enter to send • {userParams.wordCount} words • £{estimatedCost}
          </div>
        </div>
      </div>

      {/* Process Timeline */}
      <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Process Timeline</h2>
        
        <div className="space-y-4">
          {processSteps.map((step, index) => (
            <div key={step.id} className="space-y-2">
              <div className="flex items-center space-x-3">
                {getStepIcon(step)}
                <span className="text-sm font-medium">{step.name}</span>
              </div>
              
              {step.status === "in_progress" && (
                <Progress value={step.progress} className="h-2" />
              )}
              
              {step.message && (
                <p className="text-xs text-gray-600 dark:text-gray-400 ml-8">
                  {step.message}
                </p>
              )}
              
              {index < processSteps.length - 1 && (
                <Separator className="ml-2.5 w-px h-4" orientation="vertical" />
              )}
            </div>
          ))}
        </div>

        {/* Download Section */}
        {processSteps.some(step => step.status === "completed") && (
          <div className="mt-8 space-y-2">
            <h3 className="text-sm font-semibold">Downloads</h3>
            <Button variant="outline" className="w-full text-left justify-start">
              <Download className="h-4 w-4 mr-2" />
              Final Document (.docx)
            </Button>
            <Button variant="outline" className="w-full text-left justify-start">
              <Download className="h-4 w-4 mr-2" />
              Learning Outcomes Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}