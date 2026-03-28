import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, Check, Star, Zap } from "lucide-react";

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  installed: boolean;
  rating: number;
  popular: boolean;
}

const APPS: App[] = [
  { id: "1", name: "Google Calendar", description: "Sync your Google Calendar to prevent double bookings and keep everything in one place.", icon: "📅", category: "calendar", installed: true, rating: 4.8, popular: true },
  { id: "2", name: "Outlook Calendar", description: "Connect your Outlook/Office 365 calendar for two-way sync.", icon: "📆", category: "calendar", installed: false, rating: 4.6, popular: true },
  { id: "3", name: "Apple Calendar", description: "Sync with Apple iCal and iCloud Calendar.", icon: "🍎", category: "calendar", installed: false, rating: 4.3, popular: false },
  { id: "4", name: "Zoom", description: "Automatically generate unique Zoom meeting links for your bookings.", icon: "📹", category: "conferencing", installed: true, rating: 4.7, popular: true },
  { id: "5", name: "Google Meet", description: "Add Google Meet video conference links to your events.", icon: "🎥", category: "conferencing", installed: false, rating: 4.5, popular: true },
  { id: "6", name: "Microsoft Teams", description: "Generate Microsoft Teams meeting links automatically.", icon: "💬", category: "conferencing", installed: false, rating: 4.4, popular: false },
  { id: "7", name: "Stripe", description: "Accept payments for your meetings. Charge for consultations or paid events.", icon: "💳", category: "payment", installed: false, rating: 4.6, popular: true },
  { id: "8", name: "PayPal", description: "Accept PayPal payments before or after meetings.", icon: "💰", category: "payment", installed: false, rating: 4.2, popular: false },
  { id: "9", name: "Zapier", description: "Connect Cal.com with 5000+ apps. Automate your scheduling workflows.", icon: "⚡", category: "automation", installed: false, rating: 4.7, popular: true },
  { id: "10", name: "Webhooks", description: "Send real-time notifications to external services when bookings are created.", icon: "🔗", category: "automation", installed: true, rating: 4.4, popular: false },
  { id: "11", name: "HubSpot", description: "Sync meeting data to HubSpot CRM. Auto-create contacts and activities.", icon: "🧡", category: "crm", installed: false, rating: 4.5, popular: true },
  { id: "12", name: "Salesforce", description: "Integrate with Salesforce to log meetings and sync contacts.", icon: "☁️", category: "crm", installed: false, rating: 4.3, popular: false },
  { id: "13", name: "Slack", description: "Get Slack notifications when bookings are created, cancelled, or rescheduled.", icon: "💬", category: "messaging", installed: false, rating: 4.6, popular: true },
  { id: "14", name: "Cal Video", description: "Use Cal.com's built-in video conferencing. No extra accounts needed.", icon: "📺", category: "conferencing", installed: true, rating: 4.2, popular: false },
];

const CATEGORIES = [
  { value: "all", label: "All apps" },
  { value: "calendar", label: "Calendars" },
  { value: "conferencing", label: "Conferencing" },
  { value: "payment", label: "Payment" },
  { value: "automation", label: "Automation" },
  { value: "crm", label: "CRM" },
  { value: "messaging", label: "Messaging" },
];

export default function AppsPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = APPS.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || app.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = tab === "all" || tab === "installed" ? true : app.category === tab;
    const matchesInstalled = tab === "installed" ? app.installed : true;
    return matchesSearch && matchesCategory && matchesInstalled;
  });

  const installedCount = APPS.filter((a) => a.installed).length;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">App Store</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your favorite tools and supercharge your scheduling workflow.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-secondary/50 border-border"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary mb-6 flex-wrap h-auto gap-1 p-1">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value} className="text-xs">
              {cat.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="installed" className="text-xs">
            Installed ({installedCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Apps grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((app) => (
          <div key={app.id} className="cal-card p-4 flex flex-col justify-between hover:border-muted-foreground/30 transition-colors">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{app.icon}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-foreground">{app.name}</h3>
                      {app.popular && <Zap className="h-3 w-3 text-[hsl(var(--cal-warning))]" />}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-[hsl(var(--cal-warning))] text-[hsl(var(--cal-warning))]" />
                      <span className="text-[11px] text-muted-foreground">{app.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{app.description}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium">{app.category}</span>
              {app.installed ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "hsl(var(--cal-success))" }}>
                  <Check className="h-3 w-3" />
                  Installed
                </span>
              ) : (
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Install
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">No apps found matching your search.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
