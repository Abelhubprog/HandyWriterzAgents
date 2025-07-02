"use client";

import { useEffect, useState } from "react";

export interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in input fields
      const activeElement = document.activeElement;
      const isInputActive = activeElement && (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        (activeElement as HTMLElement).contentEditable === "true"
      );

      if (isInputActive && event.key !== "Escape") {
        return;
      }

      shortcuts.forEach((shortcut) => {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const metaMatch = !!shortcut.metaKey === !!event.metaKey;
        const ctrlMatch = !!shortcut.ctrlKey === !!event.ctrlKey;
        const shiftMatch = !!shortcut.shiftKey === !!event.shiftKey;
        const altMatch = !!shortcut.altKey === !!event.altKey;

        if (keyMatch && metaMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.callback();
        }
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

export function useDistractionFreeMode() {
  const [isDistractionFree, setIsDistractionFree] = useState(false);

  const toggleDistractionFree = () => {
    setIsDistractionFree(prev => !prev);
  };

  // Apply CSS class to body when distraction-free mode is active
  useEffect(() => {
    if (isDistractionFree) {
      document.body.classList.add("distraction-free");
    } else {
      document.body.classList.remove("distraction-free");
    }

    return () => {
      document.body.classList.remove("distraction-free");
    };
  }, [isDistractionFree]);

  return {
    isDistractionFree,
    setIsDistractionFree,
    toggleDistractionFree,
  };
}

export function useFocusMode() {
  const [isFocusMode, setIsFocusMode] = useState(false);

  const toggleFocusMode = () => {
    setIsFocusMode(prev => !prev);
  };

  const enableFocusMode = () => setIsFocusMode(true);
  const disableFocusMode = () => setIsFocusMode(false);

  // Apply focus mode styles
  useEffect(() => {
    const root = document.documentElement;
    if (isFocusMode) {
      root.style.setProperty("--focus-mode", "1");
      root.classList.add("focus-mode");
    } else {
      root.style.removeProperty("--focus-mode");
      root.classList.remove("focus-mode");
    }

    return () => {
      root.style.removeProperty("--focus-mode");
      root.classList.remove("focus-mode");
    };
  }, [isFocusMode]);

  return {
    isFocusMode,
    setIsFocusMode,
    toggleFocusMode,
    enableFocusMode,
    disableFocusMode,
  };
}

// Hook for handling common app shortcuts
export function useAppShortcuts(callbacks: {
  onRun?: () => void;
  onStop?: () => void;
  onSave?: () => void;
  onSettings?: () => void;
  onHelp?: () => void;
  onToggleFocus?: () => void;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
  onUpload?: () => void;
  onDownload?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    // Writing controls
    {
      key: "Enter",
      metaKey: true,
      callback: callbacks.onRun || (() => {}),
      description: "Start writing process",
    },
    {
      key: "Escape",
      callback: callbacks.onStop || (() => {}),
      description: "Stop current process",
    },
    {
      key: "s",
      metaKey: true,
      callback: callbacks.onSave || (() => {}),
      description: "Save draft",
    },
    // Interface controls
    {
      key: "k",
      ctrlKey: true,
      shiftKey: true,
      callback: callbacks.onToggleFocus || (() => {}),
      description: "Toggle focus mode",
    },
    {
      key: ",",
      metaKey: true,
      callback: callbacks.onSettings || (() => {}),
      description: "Open settings",
    },
    {
      key: "?",
      callback: callbacks.onHelp || (() => {}),
      description: "Show help",
    },
    // Navigation
    {
      key: "ArrowLeft",
      callback: callbacks.onNavigateLeft || (() => {}),
      description: "Navigate left",
    },
    {
      key: "ArrowRight",
      callback: callbacks.onNavigateRight || (() => {}),
      description: "Navigate right",
    },
    // File operations
    {
      key: "u",
      metaKey: true,
      callback: callbacks.onUpload || (() => {}),
      description: "Upload files",
    },
    {
      key: "d",
      metaKey: true,
      callback: callbacks.onDownload || (() => {}),
      description: "Download result",
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
