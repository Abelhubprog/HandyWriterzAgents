"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/SettingsContext";
import { 
  Settings as SettingsIcon, 
  Palette, 
  Type, 
  Save, 
  FileText, 
  Shield,
  Monitor,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  RotateCcw
} from "lucide-react";

interface SettingsDrawerProps {
  trigger?: React.ReactNode;
}

export function SettingsDrawer({ trigger }: SettingsDrawerProps) {
  const { settings, updateSettings, resetSettings } = useSettings();

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <SettingsIcon className="h-4 w-4" />
      <span className="sr-only">Open Settings</span>
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent className="w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </SheetTitle>
          <SheetDescription>
            Customize your HandyWriterz experience
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Theme Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <Label className="text-sm font-medium">Appearance</Label>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Theme</Label>
                <RadioGroup
                  value={settings.theme}
                  onValueChange={(value: "light" | "dark" | "system") => 
                    updateSettings({ theme: value })
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-1 text-xs">
                      <Sun className="h-3 w-3" />
                      Light
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-1 text-xs">
                      <Moon className="h-3 w-3" />
                      Dark
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="flex items-center gap-1 text-xs">
                      <Monitor className="h-3 w-3" />
                      System
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <Separator />

          {/* Typography Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <Label className="text-sm font-medium">Typography</Label>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Font Size</Label>
                  <Badge variant="secondary" className="text-xs">
                    {settings.fontSize}px
                  </Badge>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSettings({ fontSize: value })}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground">Line Height</Label>
                  <Badge variant="secondary" className="text-xs">
                    {settings.lineHeight}
                  </Badge>
                </div>
                <Slider
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSettings({ lineHeight: value })}
                  min={1.2}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Tight</span>
                  <span>Loose</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Writing Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <Label className="text-sm font-medium">Writing</Label>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Auto-save drafts</Label>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSettings({ autoSave: checked })}
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Default Citation Style</Label>
                <Select
                  value={settings.defaultCitation}
                  onValueChange={(value: "harvard" | "apa" | "vancouver" | "chicago") =>
                    updateSettings({ defaultCitation: value })
                  }
                >
                  <SelectTrigger className="w-full">
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
            </div>
          </div>

          <Separator />

          {/* Privacy Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <Label className="text-sm font-medium">Privacy</Label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs text-muted-foreground">Private uploads by default</Label>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  New uploads will be private unless explicitly shared
                </p>
              </div>
              <Switch
                checked={settings.privateUploads}
                onCheckedChange={(checked) => updateSettings({ privateUploads: checked })}
              />
            </div>
          </div>

          <Separator />

          {/* Interface Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <Label className="text-sm font-medium">Interface</Label>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Show helpful hints</Label>
                <Switch
                  checked={settings.showCoachMarks}
                  onCheckedChange={(checked) => updateSettings({ showCoachMarks: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Sound effects</Label>
                  {settings.soundEnabled ? (
                    <Volume2 className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <VolumeX className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Compact mode</Label>
                  {settings.compactMode ? (
                    <Minimize2 className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <Maximize2 className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Reset Settings */}
          <div className="pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
