import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Route,
  Plus,
  ArrowRight,
  Users,
  Globe,
  Clock,
  ToggleLeft,
  MoreHorizontal,
  Zap,
  GitBranch,
} from "lucide-react";

const DEMO_FORMS = [
  {
    id: "1",
    name: "Sales Inquiry Form",
    description: "Route leads based on company size, budget, and industry",
    routes: 4,
    responses: 128,
    active: true,
    rules: [
      { condition: "Company size > 100", destination: "Enterprise Team", icon: Users },
      { condition: "Budget > $10k", destination: "Senior AE", icon: Users },
      { condition: "Industry = Tech", destination: "Tech Sales", icon: Globe },
      { condition: "Default", destination: "General Sales", icon: Clock },
    ],
  },
  {
    id: "2",
    name: "Support Triage",
    description: "Route support requests to the right specialist",
    routes: 3,
    responses: 56,
    active: true,
    rules: [
      { condition: "Priority = Critical", destination: "Senior Engineer", icon: Zap },
      { condition: "Type = Billing", destination: "Finance Team", icon: Users },
      { condition: "Default", destination: "General Support", icon: Clock },
    ],
  },
  {
    id: "3",
    name: "Onboarding Flow",
    description: "Route new customers to the right onboarding specialist",
    routes: 2,
    responses: 0,
    active: false,
    rules: [
      { condition: "Plan = Enterprise", destination: "Enterprise Onboarding", icon: Users },
      { condition: "Default", destination: "Self-serve Onboarding", icon: Globe },
    ],
  },
];

export default function RoutingPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Routing Forms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ask qualifying questions and route respondents to the right person or event.
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New form
        </Button>
      </div>

      <div className="space-y-4">
        {DEMO_FORMS.map((form) => (
          <div key={form.id} className="cal-card overflow-hidden">
            {/* Form header */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-md flex items-center justify-center ${
                  form.active ? "bg-[hsl(var(--cal-success)/0.15)]" : "bg-secondary"
                }`}>
                  <GitBranch className="h-5 w-5" style={{ color: form.active ? "hsl(var(--cal-success))" : "hsl(var(--muted-foreground))" }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{form.name}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      form.active ? "cal-badge-success" : "bg-secondary text-muted-foreground"
                    }`}>
                      {form.active ? "Active" : "Draft"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{form.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{form.responses} response{form.responses !== 1 ? "s" : ""}</p>
                  <p className="text-xs text-muted-foreground">{form.routes} route{form.routes !== 1 ? "s" : ""}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Routes */}
            <div className="border-t border-border px-5 py-3 space-y-2">
              {form.rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded text-[11px] truncate max-w-[200px]">
                    {rule.condition}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <rule.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-foreground font-medium">{rule.destination}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pro banner */}
      <div className="cal-card mt-6 p-5 border-dashed">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-md bg-[hsl(var(--cal-info)/0.15)] flex items-center justify-center shrink-0">
            <Route className="h-4.5 w-4.5" style={{ color: "hsl(var(--cal-info))" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Advanced Routing</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use conditional logic, weighted distribution, and CRM data to route leads intelligently with Cal.com Platform.
            </p>
            <Button size="sm" variant="outline" className="mt-3 h-8 text-xs">Learn more</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
