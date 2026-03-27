import { useState } from "react";
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
import { User, Palette, Clock, Link as LinkIcon, Copy } from "lucide-react";

const BRAND_COLORS = [
  "#292929", "#2563eb", "#dc2626", "#16a34a", "#9333ea",
  "#db2777", "#ea580c", "#0891b2", "#4f46e5", "#ca8a04",
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(getProfile());

  const handleSave = () => {
    saveProfile(profile);
    toast.success("Settings saved");
  };

  const publicUrl = `${window.location.origin}/${profile.username}`;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6 bg-secondary">
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
                <div className="h-16 w-16 rounded-full bg-[hsl(240,60%,60%)] flex items-center justify-center ring-4 ring-[hsl(240,60%,60%)/0.15]">
                  <span className="text-xl font-bold text-white">
                    {profile.avatar.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Profile picture</p>
                  <p className="text-xs text-muted-foreground">
                    Recommended size 64×64px (max 5mb)
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                    Upload
                  </Button>
                </div>
              </div>

              <Separator className="bg-border" />

              <div>
                <Label>Your name</Label>
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
                  className="mt-1.5 max-w-md"
                />
              </div>

              <div>
                <Label>Username</Label>
                <div className="flex items-center mt-1.5 max-w-md">
                  <span className="text-sm text-muted-foreground bg-secondary border border-r-0 border-border rounded-l-md px-3 h-10 flex items-center">
                    cal.com/
                  </span>
                  <Input
                    value={profile.username}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      })
                    }
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  placeholder="A short bio about yourself..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="mt-1.5 max-w-md"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="mt-1.5 max-w-md"
                />
              </div>
            </div>

            <div className="px-6 py-3 border-t border-border flex justify-end">
              <Button onClick={handleSave} size="sm">
                Save
              </Button>
            </div>
          </div>

          {/* Public URL card */}
          <div className="cal-card mt-4 p-5">
            <div className="flex items-center gap-2 mb-3">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Your public URL</span>
            </div>
            <div className="flex items-center gap-2 max-w-md">
              <Input readOnly value={publicUrl} className="text-sm" />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 h-10 w-10"
                onClick={() => {
                  navigator.clipboard.writeText(publicUrl);
                  toast.success("URL copied");
                }}
              >
                <Copy className="h-4 w-4" />
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
                  onValueChange={(v) => setProfile({ ...profile, timeFormat: v as "12h" | "24h" })}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 hour (2:00 PM)</SelectItem>
                    <SelectItem value="24h">24 hour (14:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator className="bg-border" />
              <div>
                <Label>Week starts on</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  First day of the week in calendar views.
                </p>
                <Select
                  value={profile.weekStart}
                  onValueChange={(v) => setProfile({ ...profile, weekStart: v as "sunday" | "monday" })}
                >
                  <SelectTrigger className="w-56">
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
              <Button onClick={handleSave} size="sm">Save</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="cal-card">
            <div className="p-6 space-y-6">
              <div>
                <Label>Brand color</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Used as the accent on your booking pages.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {BRAND_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        profile.brandColor === c
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setProfile({ ...profile, brandColor: c })}
                    />
                  ))}
                </div>
              </div>
              <Separator className="bg-border" />
              <div>
                <Label>Theme</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Choose the app appearance.
                </p>
                <Select
                  value={profile.theme}
                  onValueChange={(v) => setProfile({ ...profile, theme: v as "light" | "system" })}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-border flex justify-end">
              <Button onClick={handleSave} size="sm">Save</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
