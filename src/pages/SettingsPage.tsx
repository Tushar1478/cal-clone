import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { UserProfile } from "@/lib/types";
import { getProfile, saveProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Palette, Clock, Globe, Link as LinkIcon, Copy, ExternalLink } from "lucide-react";

const BRAND_COLORS = [
  "#292929", "#2563eb", "#dc2626", "#16a34a", "#9333ea",
  "#db2777", "#ea580c", "#0891b2", "#4f46e5", "#ca8a04",
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [tab, setTab] = useState("profile");

  const handleSave = () => {
    saveProfile(profile);
    toast.success("Settings saved");
  };

  const publicUrl = `${window.location.origin}/${profile.username}`;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-1.5">
            <User className="h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="cal-card">
            <div className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">
                    {profile.avatar}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Profile photo</p>
                  <p className="text-xs text-muted-foreground">
                    This is your avatar displayed across the platform.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const initials = name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2);
                      setProfile({ ...profile, name, avatar: initials || "?" });
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Username</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm text-muted-foreground">cal.com/</span>
                    <Input
                      value={profile.username}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          username: e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  placeholder="A short bio about yourself..."
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is displayed on your public booking pages.
                </p>
              </div>

              {/* Public URL */}
              <div className="bg-cal-subtle rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Your public URL</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={publicUrl}
                    className="text-sm bg-background"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      toast.success("URL copied to clipboard");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-border flex justify-end">
              <Button onClick={handleSave} size="sm">
                Save changes
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="general">
          <div className="cal-card">
            <div className="p-6 space-y-6">
              <div>
                <Label>Time format</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  How times are displayed throughout the app.
                </p>
                <Select
                  value={profile.timeFormat}
                  onValueChange={(v) =>
                    setProfile({ ...profile, timeFormat: v as "12h" | "24h" })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 hour (2:00 PM)</SelectItem>
                    <SelectItem value="24h">24 hour (14:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label>Week starts on</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  First day of the week in calendar views.
                </p>
                <Select
                  value={profile.weekStart}
                  onValueChange={(v) =>
                    setProfile({
                      ...profile,
                      weekStart: v as "sunday" | "monday",
                    })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-border flex justify-end">
              <Button onClick={handleSave} size="sm">
                Save changes
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="cal-card">
            <div className="p-6 space-y-6">
              <div>
                <Label>Brand color</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Used as the accent color on your booking pages.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {BRAND_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        profile.brandColor === c
                          ? "border-foreground scale-110 ring-2 ring-foreground/20"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() =>
                        setProfile({ ...profile, brandColor: c })
                      }
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label>Theme</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Choose the app appearance.
                </p>
                <Select
                  value={profile.theme}
                  onValueChange={(v) =>
                    setProfile({
                      ...profile,
                      theme: v as "light" | "system",
                    })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-border flex justify-end">
              <Button onClick={handleSave} size="sm">
                Save changes
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
