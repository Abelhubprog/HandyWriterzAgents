"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  Zap,
  DollarSign,
  Calculator
} from "lucide-react";

interface CostDisplayProps {
  currentCost: number;
  estimatedTotal?: number;
  tokensUsed?: number;
  processingTime?: number;
  currency?: string;
  showBreakdown?: boolean;
  isProcessing?: boolean;
}

interface CostBreakdown {
  planning: number;
  research: number;
  writing: number;
  evaluation: number;
  formatting: number;
}

export function CostDisplay({ 
  currentCost, 
  estimatedTotal,
  tokensUsed,
  processingTime,
  currency = "£",
  showBreakdown = false,
  isProcessing = false
}: CostDisplayProps) {
  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toFixed(2)}`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens < 1000) return tokens.toString();
    if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
    return `${(tokens / 1000000).toFixed(1)}M`;
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Cost so far
              </span>
            </div>
            {isProcessing && (
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-100" />
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-200" />
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(currentCost)}
            </div>
            {estimatedTotal && estimatedTotal > currentCost && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                of ~{formatCurrency(estimatedTotal)}
              </div>
            )}
          </div>
        </div>

        {(tokensUsed || processingTime) && (
          <>
            <Separator className="my-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {tokensUsed && (
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>{formatTokens(tokensUsed)} tokens</span>
                </div>
              )}
              {processingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(processingTime)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {showBreakdown && (
          <>
            <Separator className="my-3" />
            <CostBreakdownView currentCost={currentCost} currency={currency} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CostBreakdownView({ currentCost, currency }: { currentCost: number; currency: string }) {
  // This would come from actual usage data
  const breakdown: CostBreakdown = {
    planning: currentCost * 0.1,
    research: currentCost * 0.4,
    writing: currentCost * 0.3,
    evaluation: currentCost * 0.15,
    formatting: currentCost * 0.05,
  };

  const items = [
    { label: "Planning", cost: breakdown.planning, color: "bg-blue-500" },
    { label: "Research", cost: breakdown.research, color: "bg-green-500" },
    { label: "Writing", cost: breakdown.writing, color: "bg-purple-500" },
    { label: "Evaluation", cost: breakdown.evaluation, color: "bg-orange-500" },
    { label: "Formatting", cost: breakdown.formatting, color: "bg-pink-500" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Calculator className="h-3 w-3" />
        Cost Breakdown
      </div>
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
          <span className="font-mono">
            {currency}{item.cost.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

// Compact version for timeline footer
export function CompactCostDisplay({ 
  currentCost, 
  currency = "£", 
  isProcessing = false 
}: Pick<CostDisplayProps, "currentCost" | "currency" | "isProcessing">) {
  return (
    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
      <div className="flex items-center gap-1">
        <Coins className="h-3 w-3" />
        <span className="font-mono">
          {currency}{currentCost.toFixed(2)}
        </span>
        {isProcessing && (
          <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse ml-1" />
        )}
      </div>
    </Badge>
  );
}
