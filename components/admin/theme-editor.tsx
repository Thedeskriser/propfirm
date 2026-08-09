"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { ThemeSettings } from "@/types/api";

export function ThemeEditor() {
  const [settings, setSettings] = useState<ThemeSettings>({
    primaryColor: "#0f172a",
    primaryForeground: "#ffffff",
    radius: "0.5rem",
    fontFamily: "Inter, sans-serif",
    heroTitle: "Trade",
    heroHighlight: "our capital.",
    heroSubtitle: "Pass our two-phase evaluation, get funded with up to $200,000, and trade with zero personal financial risk. Withdraw profits in 24 hours.",
    heroBadge: "Now accepting traders worldwide"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'theme' | 'landing'>('theme');

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/theme")
      .then(res => res.json())
      .then(data => {
        if (data && data.primaryColor) {
          setSettings(prev => ({...prev, ...data}));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.theme.save(settings);
      alert("Settings saved successfully! Changes will apply immediately.");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading editor...</div>;

  return (
    <Card className="max-w-2xl overflow-hidden">
      <div className="flex border-b">
        <button 
          onClick={() => setActiveTab('theme')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'theme' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Theme & Colors
        </button>
        <button 
          onClick={() => setActiveTab('landing')}
          className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'landing' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Landing Page Content
        </button>
      </div>

      <div className="p-6 space-y-6">
        {activeTab === 'theme' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  value={settings.primaryColor}
                  onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                  className="h-10 w-20 cursor-pointer rounded"
                />
                <input 
                  type="text" 
                  value={settings.primaryColor}
                  onChange={e => setSettings({...settings, primaryColor: e.target.value})}
                  className="flex-1 rounded-md border p-2 bg-transparent"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Main color used for buttons, links, and active states.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Primary Text Color</label>
              <div className="flex gap-4 items-center">
                <input 
                  type="color" 
                  value={settings.primaryForeground}
                  onChange={e => setSettings({...settings, primaryForeground: e.target.value})}
                  className="h-10 w-20 cursor-pointer rounded"
                />
                <input 
                  type="text" 
                  value={settings.primaryForeground}
                  onChange={e => setSettings({...settings, primaryForeground: e.target.value})}
                  className="flex-1 rounded-md border p-2 bg-transparent"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Text color when placed inside a primary colored button.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Border Radius</label>
              <select 
                value={settings.radius}
                onChange={e => setSettings({...settings, radius: e.target.value})}
                className="w-full rounded-md border p-2 bg-transparent"
              >
                <option value="0rem">0rem (Square)</option>
                <option value="0.25rem">0.25rem (Slight curve)</option>
                <option value="0.5rem">0.5rem (Default)</option>
                <option value="0.75rem">0.75rem (Rounded)</option>
                <option value="1rem">1rem (Very Rounded)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Font Family</label>
              <select 
                value={settings.fontFamily}
                onChange={e => setSettings({...settings, fontFamily: e.target.value})}
                className="w-full rounded-md border p-2 bg-transparent"
              >
                <option value="Inter, sans-serif">Inter (Modern)</option>
                <option value="Roboto, sans-serif">Roboto (Clean)</option>
                <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech)</option>
                <option value="system-ui, sans-serif">System UI (Native)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'landing' && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <label className="block text-sm font-medium mb-2">Hero Badge</label>
              <input 
                type="text" 
                value={settings.heroBadge || ''}
                onChange={e => setSettings({...settings, heroBadge: e.target.value})}
                className="w-full rounded-md border p-2 bg-transparent"
                placeholder="e.g. Now accepting traders worldwide"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Title</label>
              <input 
                type="text" 
                value={settings.heroTitle || ''}
                onChange={e => setSettings({...settings, heroTitle: e.target.value})}
                className="w-full rounded-md border p-2 bg-transparent"
                placeholder="e.g. Trade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Highlight Text (Primary Color)</label>
              <input 
                type="text" 
                value={settings.heroHighlight || ''}
                onChange={e => setSettings({...settings, heroHighlight: e.target.value})}
                className="w-full rounded-md border p-2 bg-transparent"
                placeholder="e.g. our capital."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hero Subtitle</label>
              <textarea 
                value={settings.heroSubtitle || ''}
                onChange={e => setSettings({...settings, heroSubtitle: e.target.value})}
                className="w-full rounded-md border p-2 bg-transparent min-h-[100px]"
                placeholder="Description text below the title..."
              />
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
