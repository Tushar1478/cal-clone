import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Users, Plus, Shield, Settings, Mail, UserPlus, Crown, MoreHorizontal } from "lucide-react";

const DEMO_TEAMS = [
  {
    id: "1",
    name: "Engineering",
    slug: "engineering",
    members: [
      { name: "John Doe", email: "john@cal.com", role: "Owner", avatar: "JD" },
      { name: "Alice Johnson", email: "alice@example.com", role: "Admin", avatar: "AJ" },
      { name: "Bob Smith", email: "bob@example.com", role: "Member", avatar: "BS" },
    ],
    eventTypes: 4,
  },
  {
    id: "2",
    name: "Sales",
    slug: "sales",
    members: [
      { name: "John Doe", email: "john@cal.com", role: "Owner", avatar: "JD" },
      { name: "Diana Prince", email: "diana@example.com", role: "Member", avatar: "DP" },
    ],
    eventTypes: 2,
  },
];

export default function TeamsPage() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage teams to share event types and collaborate.
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          New team
        </Button>
      </div>

      <div className="space-y-4">
        {DEMO_TEAMS.map((team) => (
          <div key={team.id} className="cal-card overflow-hidden">
            {/* Team header */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-[hsl(var(--cal-info)/0.15)] flex items-center justify-center">
                  <Users className="h-5 w-5" style={{ color: "hsl(var(--cal-info))" }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{team.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {team.members.length} member{team.members.length !== 1 ? "s" : ""} · {team.eventTypes} event type{team.eventTypes !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                  <UserPlus className="h-3 w-3" />
                  Invite
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Members list */}
            <div className="border-t border-border divide-y divide-border">
              {team.members.map((member) => (
                <div key={member.email} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-xs font-semibold text-foreground">{member.avatar}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{member.name}</p>
                        {member.role === "Owner" && <Crown className="h-3 w-3 text-[hsl(var(--cal-warning))]" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      member.role === "Owner" ? "cal-badge-warning" : member.role === "Admin" ? "cal-badge-info" : "bg-secondary text-muted-foreground"
                    }`}>
                      {member.role}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upgrade banner */}
      <div className="cal-card mt-6 p-5 border-dashed">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-md bg-[hsl(var(--cal-warning)/0.15)] flex items-center justify-center shrink-0">
            <Shield className="h-4.5 w-4.5" style={{ color: "hsl(var(--cal-warning))" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Upgrade to Teams</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Get round-robin scheduling, collective events, and advanced team features with Cal.com Teams.
            </p>
            <Button size="sm" className="mt-3 h-8 text-xs">Upgrade now</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
