import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Zap,
  Mail,
  MessageSquare,
  Clock,
  Check,
  MoreHorizontal,
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarX,
  Webhook,
} from "lucide-react";

const DEMO_WORKFLOWS = [
  {
    id: "1",
    name: "Booking Confirmation",
    description: "Send confirmation email and SMS when a new booking is created",
    active: true,
    trigger: "New booking",
    triggerIcon: CalendarCheck,
    steps: [
      { type: "email", label: "Send confirmation email to attendee", icon: Mail, delay: null },
      { type: "sms", label: "Send SMS reminder", icon: MessageSquare, delay: "1 hour before" },
    ],
    totalRuns: 342,
  },
  {
    id: "2",
    name: "Pre-meeting Reminder",
    description: "Send a reminder 24 hours and 1 hour before the meeting",
    active: true,
    trigger: "Before event",
    triggerIcon: Clock,
    steps: [
      { type: "email", label: "24h reminder email", icon: Mail, delay: "24 hours before" },
      { type: "email", label: "1h reminder email", icon: Mail, delay: "1 hour before" },
      { type: "sms", label: "1h reminder SMS", icon: MessageSquare, delay: "1 hour before" },
    ],
    totalRuns: 891,
  },
  {
    id: "3",
    name: "Cancellation Follow-up",
    description: "Send a follow-up when a booking is cancelled",
    active: false,
    trigger: "Cancelled booking",
    triggerIcon: CalendarX,
    steps: [
      { type: "email", label: "Send cancellation survey", icon: Mail, delay: null },
      { type: "webhook", label: "Notify CRM", icon: Webhook, delay: null },
    ],
    totalRuns: 23,
  },
  {
    id: "4",
    name: "No-show Detection",
    description: "Flag no-shows and trigger a re-engagement workflow",
    active: true,
    trigger: "After event (no-show)",
    triggerIcon: Bell,
    steps: [
      { type: "email", label: "Send reschedule link", icon: Mail, delay: "30 minutes after" },
    ],
    totalRuns: 15,
  },
];

export default function WorkflowsPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Automate notifications, reminders, and follow-ups around your bookings.
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New workflow
        </Button>
      </div>

      <div className="space-y-3">
        {DEMO_WORKFLOWS.map((wf) => (
          <div key={wf.id} className="cal-card overflow-hidden hover:border-muted-foreground/30 transition-colors">
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-md flex items-center justify-center ${
                    wf.active ? "bg-[hsl(var(--cal-success)/0.15)]" : "bg-secondary"
                  }`}>
                    <Zap className="h-4 w-4" style={{ color: wf.active ? "hsl(var(--cal-success))" : "hsl(var(--muted-foreground))" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">{wf.name}</h3>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        wf.active ? "cal-badge-success" : "bg-secondary text-muted-foreground"
                      }`}>
                        {wf.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{wf.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{wf.totalRuns} runs</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Visual pipeline */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {/* Trigger */}
                <div className="flex items-center gap-1.5 bg-secondary rounded-md px-3 py-2 shrink-0">
                  <wf.triggerIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{wf.trigger}</span>
                </div>

                {wf.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2 shrink-0">
                    <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                    <div className="flex items-center gap-1.5 bg-secondary/60 border border-border rounded-md px-3 py-2">
                      <step.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-foreground block">{step.label}</span>
                        {step.delay && (
                          <span className="text-[10px] text-muted-foreground">{step.delay}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
