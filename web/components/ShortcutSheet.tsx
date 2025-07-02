"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Keyboard, 
  Play, 
  Square, 
  Focus, 
  ArrowLeft, 
  ArrowRight,
  Settings,
  Search,
  Download,
  Upload
} from "lucide-react";

interface ShortcutGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcuts: {
    keys: string[];
    description: string;
    action: string;
  }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Writing Controls",
    icon: Play,
    shortcuts: [
      {
        keys: ["⌘", "Enter"],
        description: "Start writing process",
        action: "Run"
      },
      {
        keys: ["Esc"],
        description: "Stop current process",
        action: "Stop"
      },
      {
        keys: ["⌘", "S"],
        description: "Save current draft",
        action: "Save"
      }
    ]
  },
  {
    title: "Navigation",
    icon: ArrowRight,
    shortcuts: [
      {
        keys: ["←", "→"],
        description: "Switch between timeline steps",
        action: "Navigate"
      },
      {
        keys: ["⌘", "1"],
        description: "Go to chat",
        action: "Chat"
      },
      {
        keys: ["⌘", "2"],
        description: "Go to parameters",
        action: "Parameters"
      },
      {
        keys: ["⌘", "3"],
        description: "Go to timeline",
        action: "Timeline"
      }
    ]
  },
  {
    title: "Interface",
    icon: Focus,
    shortcuts: [
      {
        keys: ["Ctrl", "Shift", "K"],
        description: "Toggle distraction-free mode",
        action: "Focus Mode"
      },
      {
        keys: ["⌘", ","],
        description: "Open settings",
        action: "Settings"
      },
      {
        keys: ["⌘", "K"],
        description: "Open command palette",
        action: "Search"
      },
      {
        keys: ["?"],
        description: "Show this help",
        action: "Help"
      }
    ]
  },
  {
    title: "File Operations",
    icon: Upload,
    shortcuts: [
      {
        keys: ["⌘", "U"],
        description: "Upload files",
        action: "Upload"
      },
      {
        keys: ["⌘", "D"],
        description: "Download result",
        action: "Download"
      },
      {
        keys: ["⌘", "Shift", "C"],
        description: "Copy to clipboard",
        action: "Copy"
      }
    ]
  }
];

export function ShortcutSheet() {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for ? key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "?" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        // Check if we're not in an input field
        const activeElement = document.activeElement as HTMLElement;
        const isInputActive = activeElement && (
          activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.contentEditable === "true"
        );
        
        if (!isInputActive) {
          event.preventDefault();
          setIsOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const formatKey = (key: string) => {
    const keyMap: { [key: string]: string } = {
      "⌘": "Cmd",
      "Ctrl": "Ctrl",
      "Shift": "Shift",
      "Alt": "Alt",
      "Enter": "Enter",
      "Esc": "Esc",
      "←": "Left",
      "→": "Right",
      "↑": "Up",
      "↓": "Down"
    };
    
    return keyMap[key] || key;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {shortcutGroups.map((group, groupIndex) => {
            const Icon = group.icon;
            
            return (
              <div key={groupIndex} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-sm">{group.title}</h3>
                </div>
                
                <div className="grid gap-2">
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <div
                      key={shortcutIndex}
                      className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <Badge 
                              variant="outline" 
                              className="font-mono text-xs px-2 py-1 bg-background"
                            >
                              {formatKey(key)}
                            </Badge>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {groupIndex < shortcutGroups.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Keyboard className="h-4 w-4" />
            <span>
              Press <Badge variant="outline" className="font-mono text-xs mx-1">?</Badge> 
              anytime to view shortcuts
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
