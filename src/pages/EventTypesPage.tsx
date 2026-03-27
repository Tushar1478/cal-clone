import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Copy, ExternalLink, MoreHorizontal, Pencil, Trash2, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { EventType, EVENT_COLORS } from "@/lib/types";
import { getEventTypes, saveEventType, deleteEventType } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    duration: 30,
    color: EVENT_COLORS[0],
  });

  useEffect(() => {
    setEventTypes(getEventTypes());
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", slug: "", description: "", duration: 30, color: EVENT_COLORS[0] });
    setDialogOpen(true);
  };

  const openEdit = (et: EventType) => {
    setEditing(et);
    setForm({
      title: et.title,
      slug: et.slug,
      description: et.description,
      duration: et.duration,
      color: et.color,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and URL slug are required");
      return;
    }
    const et: EventType = {
      id: editing?.id || crypto.randomUUID(),
      title: form.title,
      slug: form.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      description: form.description,
      duration: form.duration,
      color: form.color,
      isActive: editing?.isActive ?? true,
    };
    saveEventType(et);
    setEventTypes(getEventTypes());
    setDialogOpen(false);
    toast.success(editing ? "Event type updated" : "Event type created");
  };

  const handleDelete = (id: string) => {
    deleteEventType(id);
    setEventTypes(getEventTypes());
    toast.success("Event type deleted");
  };

  const handleToggle = (et: EventType) => {
    saveEventType({ ...et, isActive: !et.isActive });
    setEventTypes(getEventTypes());
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`);
    toast.success("Link copied to clipboard");
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Event Types</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create events to share for people to book on your calendar.
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      <div className="cal-card overflow-hidden divide-y divide-border">
        {eventTypes.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground">No event types yet.</p>
            <Button onClick={openCreate} variant="outline" size="sm" className="mt-3">
              Create your first event type
            </Button>
          </div>
        )}
        {eventTypes.map((et) => (
          <div
            key={et.id}
            className={`flex items-center justify-between px-5 py-4 hover:bg-cal-subtle transition-colors ${
              !et.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-1 h-10 rounded-full flex-shrink-0"
                style={{ backgroundColor: et.color }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">{et.title}</h3>
                  {!et.isActive && (
                    <span className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
                      Disabled
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {et.duration}m
                  </span>
                  <span className="text-xs text-muted-foreground">/{et.slug}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex gap-1.5 text-xs text-muted-foreground"
                onClick={() => copyLink(et.slug)}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy link
              </Button>
              <Link to={`/book/${et.slug}`} target="_blank">
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-xs text-muted-foreground">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview
                </Button>
              </Link>
              <Switch checked={et.isActive} onCheckedChange={() => handleToggle(et)} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(et)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => copyLink(et.slug)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(et.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event Type" : "Add a new event type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Quick Chat"
                value={form.title}
                onChange={(e) => {
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: editing
                      ? form.slug
                      : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
                  });
                }}
              />
            </div>
            <div>
              <Label>URL Slug</Label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">/book/</span>
                <Input
                  placeholder="quick-chat"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="A brief description of this event..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min={5}
                max={480}
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-1">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-7 w-7 rounded-full border-2 transition-transform ${
                      form.color === c ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setForm({ ...form, color: c })}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editing ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
