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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Palette,
  Clock,
  Link as LinkIcon,
  Copy,
  Settings,
  Calendar,
  Video,
  BriefcaseBusiness,
  Bell,
  Layers,
  CreditCard,
  ArrowLeft,
  Search,
  Key,
  ShieldCheck,
  Sparkles,
  CalendarOff,
  ChevronRight,
} from "lucide-react";

const BRAND_COLORS = [
  "#292929", "#2563eb", "#dc2626", "#16a34a", "#9333ea",
  "#db2777", "#ea580c", "#0891b2", "#4f46e5", "#ca8a04",
];

type Section =
  | "overview"
  | "profile"
  | "general"
  | "calendars"
  | "conferencing"
  | "out-of-office"
  | "billing"
  | "plans"
  | "appearance"
  | "notifications"
  | "features"
  | "password"
  | "impersonation"
  | "compliance";

const personalSettings = [
  {
    id: "profile" as Section,
    icon: User,
    title: "Profile",
    description: "Manage your profile details or delete your account",
  },
  {
    id: "general" as Section,
    icon: Settings,
    title: "General",
    description: "Manage language, timezone, and other preferences",
  },
  {
    id: "calendars" as Section,
    icon: Calendar,
    title: "Calendars",
    description: "Connect and manage your calendar integrations",
  },
  {
    id: "conferencing" as Section,
    icon: Video,
    title: "Conferencing",
    description: "Configure your video conferencing apps",
  },
  {
    id: "out-of-office" as Section,
    icon: CalendarOff,
    title: "Out of office",
    description: "Set your away dates and redirect bookings",
  },
  {
    id: "billing" as Section,
    icon: CreditCard,
    title: "Manage billing",
    description: "View and manage your subscription and invoices",
  },
  {
    id: "plans" as Section,
    icon: Layers,
    title: "Plans",
    description: "Compare plans and upgrade your subscription",
  },
  {
    id: "appearance" as Section,
    icon: Palette,
    title: "Appearance",
    description: "Customize your booking page theme and branding",
  },
  {
    id: "notifications" as Section,
    icon: Bell,
    title: "Push notifications",
    description: "Configure push notification preferences",
  },
  {
    id: "features" as Section,
    icon: Sparkles,
    title: "Features",
    description: "Opt in to new and experimental features",
  },
];

const securitySettings = [
  {
    id: "password" as Section,
    icon: Key,
    title: "Password",
    description: "Change your account password",
  },
  {
    id: "impersonation" as Section,
    icon: User,
    title: "Impersonation",
    description: "Allow team members to impersonate your account",
  },
  {
    id: "compliance" as Section,
    icon: ShieldCheck,
    title: "Compliance",
    description: "Manage compliance and data settings",
  },
];

const sidebarPersonal = [
  { id: "profile" as Section, label: "Profile" },
  { id: "general" as Section, label: "General" },
  { id: "calendars" as Section, label: "Calendars" },
  { id: "conferencing" as Section, label: "Conferencing" },
  { id: "appearance" as Section, label: "Appearance" },
  { id: "out-of-office" as Section, label: "Out of office" },
  { id: "notifications" as Section, label: "Push notifications" },
  { id: "features" as Section, label: "Features" },
];

const sidebarSecurity = [
  { id: "password" as Section, label: "Password" },
  { id: "impersonation" as Section, label: "Impersonation" },
  { id: "compliance" as Section, label: "Compliance" },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [section, setSection] = useState<Section>("overview");
  const [search, setSearch] = useState("");

  const handleSave = () => {
    saveProfile(profile);
    toast.success("Settings saved");
  };

  const publicUrl = `${window.location.origin}/${profile.username}`;

  const filteredPersonal = personalSettings.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );
  const filteredSecurity = securitySettings.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex h-full -m-6">
        {/* Settings sidebar */}
        <div className="w-56 shrink-0 border-r border-border flex flex-col py-4 px-2 h-full overflow-y-auto">
          {/* Back to overview */}
          <button
            onClick={() => setSection("overview")}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            Back
          </button>

          {/* Overview shortcut */}
          <button
            onClick={() => setSection("overview")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors mb-3 ${
              section === "overview"
                ? "bg-accent text-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <Settings size={14} />
            Overview
          </button>

          {/* User info */}
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <div className="h-6 w-6 rounded-full bg-[hsl(240,60%,60%)] flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{profile.avatar.charAt(0)}</span>
            </div>
            <span className="text-sm font-medium text-foreground truncate">{profile.name}</span>
          </div>

          {/* Personal nav */}
          <div className="space-y-0.5 mb-4">
            {sidebarPersonal.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  section === item.id
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Security section */}
          <div className="flex items-center gap-2 px-3 py-1 mb-1">
            <Key size={13} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Security
            </span>
          </div>
          <div className="space-y-0.5">
            {sidebarSecurity.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  section === item.id
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* ── OVERVIEW ── */}
          {section === "overview" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="bg-secondary border border-border rounded-md pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring w-64"
                  />
                </div>
              </div>

              {/* Personal settings grid */}
              {filteredPersonal.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-sm font-semibold text-foreground mb-4">Personal settings</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredPersonal.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSection(item.id)}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left group"
                        >
                          <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center shrink-0">
                            <Icon size={16} className="text-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Security grid */}
              {filteredSecurity.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-foreground mb-4">Security</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSecurity.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSection(item.id)}
                          className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left group"
                        >
                          <div className="h-9 w-9 rounded-md bg-secondary flex items-center justify-center shrink-0">
                            <Icon size={16} className="text-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {search && filteredPersonal.length === 0 && filteredSecurity.length === 0 && (
                <p className="text-sm text-muted-foreground">No settings found for "{search}"</p>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {section === "profile" && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground">Profile</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your profile details or delete your account.
                </p>
              </div>

              <div className="cal-card">
                <div className="p-6 space-y-6">
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
                        const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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
                          setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })
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
                  <Button onClick={handleSave} size="sm">Save</Button>
                </div>
              </div>

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
                    onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success("URL copied"); }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── GENERAL ── */}
          {section === "general" && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground">General</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage language, timezone, and other preferences.
                </p>
              </div>
              <div className="cal-card">
                <div className="p-6 space-y-6">
                  <div>
                    <Label>Time format</Label>
                    <p className="text-xs text-muted-foreground mb-2">How times are displayed throughout the app.</p>
                    <Select value={profile.timeFormat} onValueChange={(v) => setProfile({ ...profile, timeFormat: v as "12h" | "24h" })}>
                      <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 hour (2:00 PM)</SelectItem>
                        <SelectItem value="24h">24 hour (14:00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator className="bg-border" />
                  <div>
                    <Label>Week starts on</Label>
                    <p className="text-xs text-muted-foreground mb-2">First day of the week in calendar views.</p>
                    <Select value={profile.weekStart} onValueChange={(v) => setProfile({ ...profile, weekStart: v as "sunday" | "monday" })}>
                      <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
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
            </div>
          )}

          {/* ── APPEARANCE ── */}
          {section === "appearance" && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground">Appearance</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Customize your booking page theme and branding.
                </p>
              </div>
              <div className="cal-card">
                <div className="p-6 space-y-6">
                  <div>
                    <Label>Brand color</Label>
                    <p className="text-xs text-muted-foreground mb-3">Used as the accent on your booking pages.</p>
                    <div className="flex gap-2 flex-wrap">
                      {BRAND_COLORS.map((c) => (
                        <button
                          key={c}
                          className={`h-8 w-8 rounded-full border-2 transition-all ${
                            profile.brandColor === c ? "border-foreground scale-110" : "border-transparent hover:scale-105"
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
                    <p className="text-xs text-muted-foreground mb-2">Choose the app appearance.</p>
                    <Select value={profile.theme} onValueChange={(v) => setProfile({ ...profile, theme: v as "light" | "system" })}>
                      <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
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
            </div>
          )}

          {/* ── PLACEHOLDER SECTIONS ── */}
          {["calendars", "conferencing", "out-of-office", "billing", "plans", "notifications", "features", "password", "impersonation", "compliance"].includes(section) && (
            <div className="max-w-2xl">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground capitalize">
                  {[...personalSettings, ...securitySettings].find((s) => s.id === section)?.title}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {[...personalSettings, ...securitySettings].find((s) => s.id === section)?.description}
                </p>
              </div>
              <div className="cal-card p-12 flex flex-col items-center justify-center text-center">
                {(() => {
                  const item = [...personalSettings, ...securitySettings].find((s) => s.id === section);
                  const Icon = item?.icon ?? Settings;
                  return (
                    <>
                      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                        <Icon size={22} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{item?.title}</p>
                      <p className="text-xs text-muted-foreground max-w-xs">{item?.description}</p>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
