"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Settings = {
  theme: "light" | "dark" | "system";
  fontSize: number;
  lineHeight: number;
  autoSave: boolean;
  defaultCitation: "harvard" | "apa" | "vancouver" | "chicago";
  privateUploads: boolean;
  showCoachMarks: boolean;
  distrationFreeMode: boolean;
  soundEnabled: boolean;
  compactMode: boolean;
};

const defaultSettings: Settings = {
  theme: "system",
  fontSize: 16,
  lineHeight: 1.6,
  autoSave: true,
  defaultCitation: "harvard",
  privateUploads: false,
  showCoachMarks: true,
  distrationFreeMode: false,
  soundEnabled: true,
  compactMode: false,
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("handywriterz-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem("handywriterz-settings", JSON.stringify(settings));
        
        // Also sync to user profile if authenticated
        // This could be extended to sync to Supabase
        syncToUserProfile(settings);
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  }, [settings, isLoading]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.theme === "system") {
      root.classList.remove("light", "dark");
      // Let system preference take over
    } else {
      root.classList.remove("light", "dark");
      root.classList.add(settings.theme);
    }

    // Apply custom CSS properties
    root.style.setProperty("--font-size", `${settings.fontSize}px`);
    root.style.setProperty("--line-height", settings.lineHeight.toString());
  }, [settings.theme, settings.fontSize, settings.lineHeight]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const syncToUserProfile = async (settings: Settings) => {
    // This would sync to Supabase user profile
    // For now, we'll just use localStorage
    try {
      // await supabase.from('profiles').upsert({
      //   user_id: user.id,
      //   settings: settings
      // });
    } catch (error) {
      console.error("Failed to sync settings to profile:", error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
