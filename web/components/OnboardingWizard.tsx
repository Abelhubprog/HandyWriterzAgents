"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Mic, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  Shield
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete: (preferences: WizardPreferences) => void;
}

interface WizardPreferences {
  inputMethod: "upload" | "voice" | "text";
  template: "essay" | "report" | "dissertation" | "article";
  showWizardCompleted: boolean;
}

const inputMethods = [
  {
    id: "upload" as const,
    title: "Upload Documents",
    description: "Upload PDFs, Word docs, or research papers",
    icon: Upload,
    benefits: ["Analyze existing sources", "Extract key information", "Build upon research"]
  },
  {
    id: "voice" as const,
    title: "Voice Input",
    description: "Speak your ideas and requirements",
    icon: Mic,
    benefits: ["Natural conversation", "Quick idea capture", "Hands-free input"]
  },
  {
    id: "text" as const,
    title: "Text Prompt",
    description: "Type your writing requirements",
    icon: FileText,
    benefits: ["Precise instructions", "Detailed specifications", "Easy editing"]
  }
];

const templates = [
  {
    id: "essay" as const,
    title: "Academic Essay",
    description: "Structured argumentative writing",
    icon: GraduationCap,
    wordRange: "1,000 - 5,000 words",
    features: ["Thesis development", "Evidence analysis", "Critical reasoning"]
  },
  {
    id: "report" as const,
    title: "Research Report",
    description: "Comprehensive research analysis",
    icon: BookOpen,
    wordRange: "2,000 - 10,000 words",
    features: ["Data analysis", "Methodology", "Recommendations"]
  },
  {
    id: "dissertation" as const,
    title: "Dissertation",
    description: "Extensive academic research",
    icon: Newspaper,
    wordRange: "10,000+ words",
    features: ["Literature review", "Original research", "Academic rigor"]
  },
  {
    id: "article" as const,
    title: "Journal Article",
    description: "Publication-ready research",
    icon: FileText,
    wordRange: "3,000 - 8,000 words",
    features: ["Peer review ready", "Citation standards", "Academic format"]
  }
];

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<Partial<WizardPreferences>>({});

  // Check if wizard should be shown
  useEffect(() => {
    const wizardSeen = localStorage.getItem("handywriterz-wizard-seen");
    if (!wizardSeen) {
      setIsOpen(true);
    }
  }, []);

  const totalSteps = 2;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleInputMethodSelect = (method: WizardPreferences["inputMethod"]) => {
    setPreferences(prev => ({ ...prev, inputMethod: method }));
  };

  const handleTemplateSelect = (template: WizardPreferences["template"]) => {
    setPreferences(prev => ({ ...prev, template }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    const finalPreferences: WizardPreferences = {
      inputMethod: preferences.inputMethod || "text",
      template: preferences.template || "essay",
      showWizardCompleted: true
    };

    // Mark wizard as seen
    localStorage.setItem("handywriterz-wizard-seen", "true");
    
    setIsOpen(false);
    onComplete(finalPreferences);
  };

  const canProceed = () => {
    if (currentStep === 0) return !!preferences.inputMethod;
    if (currentStep === 1) return !!preferences.template;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Welcome to HandyWriterz</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Let's personalize your academic writing experience in just 2 quick steps
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="my-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Input Method */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">How would you like to provide your requirements?</h3>
              <p className="text-muted-foreground">Choose your preferred way to communicate with HandyWriterz</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {inputMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = preferences.inputMethod === method.id;
                
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleInputMethodSelect(method.id)}
                  >
                    <CardHeader className="text-center pb-2">
                      <Icon className={`h-8 w-8 mx-auto ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <CardTitle className="text-lg">{method.title}</CardTitle>
                      <CardDescription>{method.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {method.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">What type of writing do you need?</h3>
              <p className="text-muted-foreground">Select the template that best matches your assignment</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const Icon = template.icon;
                const isSelected = preferences.template === template.id;
                
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Icon className={`h-6 w-6 mt-1 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          <CardDescription className="mb-2">{template.description}</CardDescription>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {template.wordRange}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {template.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Your preferences are stored locally and can be changed anytime
          </div>

          {currentStep === totalSteps - 1 ? (
            <Button 
              onClick={handleComplete}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Get Started
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
