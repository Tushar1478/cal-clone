import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  Share2,
  EyeOff,
  Files,
  Shield,
  Search,
  Link as LinkIcon,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { EventType, EVENT_COLORS, DURATION_OPTIONS, BUFFER_OPTIONS, CustomQuestion } from "@/lib/types";
import {
  getEventTypes,
  saveEventType,
  deleteEventType,
  duplicateEventType,
  getProfile,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { toast } from "sonner";

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const profile = getProfile();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    duration: 30,
    color: EVENT_COLORS[0],
    bufferBefore: 0,
    bufferAfter: 0,
    minNotice: 1,
    maxFutureDays: 60,
    customQuestions: [] as CustomQuestion[],
  });

  useEffect(() => {
    setEventTypes(getEventTypes());
  }, []);

  useEffect(() => {
    const openCreateDialog = () => setDialogOpen(true);
    window.addEventListener("cal:create-event-type", openCreateDialog);
    return () => window.removeEventListener("cal:create-event-type", openCreateDialog);
  }, []);

  const refresh = () => setEventTypes(getEventTypes());

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      description: "",
      duration: 30,
      color: EVENT_COLORS[0],
      bufferBefore: 0,
      bufferAfter: 0,
      minNotice: 1,
      maxFutureDays: 60,
      customQuestions: [],
    });
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
      bufferBefore: et.bufferBefore,
      bufferAfter: et.bufferAfter,
      minNotice: et.minNotice,
      maxFutureDays: et.maxFutureDays,
      customQuestions: et.customQuestions || [],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and URL slug are required");
      return;
    }
    const slug = form.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = getEventTypes().find(
      (e) => e.slug === slug && e.id !== editing?.id
    );
    if (existing) {
      toast.error("This URL slug is already in use");
      return;
    }

    const et: EventType = {
      id: editing?.id || crypto.randomUUID(),
      title: form.title,
      slug,
      description: form.description,
      duration: form.duration,
      color: form.color,
      isActive: editing?.isActive ?? true,
      bufferBefore: form.bufferBefore,
      bufferAfter: form.bufferAfter,
      customQuestions: form.customQuestions,
      minNotice: form.minNotice,
      maxFutureDays: form.maxFutureDays,
    };
    saveEventType(et);
    refresh();
    setDialogOpen(false);
    toast.success(editing ? "Event type updated" : "Event type created");
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteEventType(deletingId);
      refresh();
      toast.success("Event type deleted");
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const handleToggle = (et: EventType) => {
    saveEventType({ ...et, isActive: !et.isActive });
    refresh();
  };

  const handleDuplicate = (id: string) => {
    duplicateEventType(id);
    refresh();
    toast.success("Event type duplicated");
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`);
    toast.success("Link copied to clipboard");
  };

  const addQuestion = () => {
    setForm({
      ...form,
      customQuestions: [
        ...form.customQuestions,
        { id: crypto.randomUUID(), label: "", type: "text", required: false },
      ],
    });
  };

  const updateQuestion = (idx: number, updates: Partial<CustomQuestion>) => {
    const questions = [...form.customQuestions];
    questions[idx] = { ...questions[idx], ...updates };
    setForm({ ...form, customQuestions: questions });
  };

  const removeQuestion = (idx: number) => {
    setForm({
      ...form,
      customQuestions: form.customQuestions.filter((_, i) => i !== idx),
    });
  };

  const filtered = eventTypes.filter((et) => {
    if (!searchQuery) return true;
    return et.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           et.slug.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const activeTypes = filtered.filter((e) => e.isActive);
  const inactiveTypes = filtered.filter((e) => !e.isActive);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Event types</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure different events for people to book on your calendar.
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-44 h-9 text-sm bg-secondary border-border"
            />
          </div>
          <Button onClick={openCreate} size="sm" className="gap-1.5 h-9">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      <div className="fixed bottom-20 left-1/2 z-30 w-[calc(100%-5rem)] max-w-sm -translate-x-1/2 sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-full bg-card pl-9 border-border"
          />
        </div>
      </div>

      {/* Event Types List */}
      <div className="cal-card overflow-hidden divide-y divide-border">
        {filtered.length === 0 && eventTypes.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
              <LinkIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No event types yet
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first event type to start accepting bookings.
            </p>
            <Button onClick={openCreate} variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New event type
            </Button>
          </div>
        )}
        {filtered.length === 0 && eventTypes.length > 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No matching event types.</p>
          </div>
        )}

        {/* Inactive first (like Cal.com shows hidden on top) */}
        {inactiveTypes.map((et) => (
          <EventTypeRow
            key={et.id}
            et={et}
            profile={profile}
            onEdit={openEdit}
            onToggle={handleToggle}
            onDelete={confirmDelete}
            onDuplicate={handleDuplicate}
            onCopyLink={copyLink}
          />
        ))}
        {activeTypes.map((et) => (
          <EventTypeRow
            key={et.id}
            et={et}
            profile={profile}
            onEdit={openEdit}
            onToggle={handleToggle}
            onDelete={confirmDelete}
            onDuplicate={handleDuplicate}
            onCopyLink={copyLink}
          />
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit event type" : "New event type"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details for this event type."
                : "Create a new event type for people to book."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-1">
            <TabsList className="grid grid-cols-3 w-full bg-secondary">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-3">
              <div>
                <Label>Title *</Label>
                <Input
                  placeholder="Quick Chat"
                  value={form.title}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      title: e.target.value,
                      slug: editing
                        ? form.slug
                        : e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-|-$/g, ""),
                    });
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>URL Slug *</Label>
                <div className="flex items-center gap-0 mt-1">
                  <span className="text-sm text-muted-foreground bg-secondary border border-r-0 border-border rounded-l-md px-3 py-2 h-10 flex items-center">
                    /book/
                  </span>
                  <Input
                    placeholder="quick-chat"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="rounded-l-none"
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
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Select
                    value={String(form.duration)}
                    onValueChange={(v) => setForm({ ...form, duration: Number(v) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {EVENT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`h-6 w-6 rounded-full border-2 transition-all ${
                          form.color === c
                            ? "border-foreground scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                        onClick={() => setForm({ ...form, color: c })}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 pt-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Buffer before</Label>
                  <Select
                    value={String(form.bufferBefore)}
                    onValueChange={(v) => setForm({ ...form, bufferBefore: Number(v) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUFFER_OPTIONS.map((b) => (
                        <SelectItem key={b} value={String(b)}>
                          {b === 0 ? "No buffer" : `${b} min`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Buffer after</Label>
                  <Select
                    value={String(form.bufferAfter)}
                    onValueChange={(v) => setForm({ ...form, bufferAfter: Number(v) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUFFER_OPTIONS.map((b) => (
                        <SelectItem key={b} value={String(b)}>
                          {b === 0 ? "No buffer" : `${b} min`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Minimum notice (hours)</Label>
                <p className="text-xs text-muted-foreground mb-1">
                  How far in advance must bookings be made?
                </p>
                <Input
                  type="number"
                  min={0}
                  max={720}
                  value={form.minNotice}
                  onChange={(e) => setForm({ ...form, minNotice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Booking window (days)</Label>
                <p className="text-xs text-muted-foreground mb-1">
                  How far into the future can someone book?
                </p>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={form.maxFutureDays}
                  onChange={(e) => setForm({ ...form, maxFutureDays: Number(e.target.value) })}
                />
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4 pt-3">
              <p className="text-sm text-muted-foreground">
                Add custom questions to collect info from the booker.
              </p>
              {form.customQuestions.map((q, idx) => (
                <div key={q.id} className="border border-border rounded-lg p-3 space-y-2 bg-secondary/30">
                  <div className="flex items-start gap-2">
                    <Input
                      placeholder="Question label"
                      value={q.label}
                      onChange={(e) => updateQuestion(idx, { label: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive shrink-0"
                      onClick={() => removeQuestion(idx)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select
                      value={q.type}
                      onValueChange={(v) => updateQuestion(idx, { type: v as "text" | "textarea" | "select" })}
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Short text</SelectItem>
                        <SelectItem value="textarea">Long text</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(idx, { required: e.target.checked })}
                        className="rounded border-border"
                      />
                      Required
                    </label>
                  </div>
                  {q.type === "select" && (
                    <Input
                      placeholder="Option 1, Option 2, Option 3"
                      value={q.options?.join(", ") || ""}
                      onChange={(e) =>
                        updateQuestion(idx, {
                          options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean),
                        })
                      }
                      className="text-xs"
                    />
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addQuestion} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add question
              </Button>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editing ? "Save" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event type?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Anyone with the link will no longer be able to book.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

// ─── Event Type Row ────────────────────────────────────────

function EventTypeRow({
  et,
  profile,
  onEdit,
  onToggle,
  onDelete,
  onDuplicate,
  onCopyLink,
}: {
  et: EventType;
  profile: { username: string };
  onEdit: (et: EventType) => void;
  onToggle: (et: EventType) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopyLink: (slug: string) => void;
}) {
  return (
    <div className="group flex items-start justify-between gap-3 px-4 py-4 hover:bg-secondary/30 transition-colors sm:px-5 sm:py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1 min-w-0">
          <h3 className="truncate text-sm font-bold text-foreground">{et.title}</h3>
          {!et.isActive && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground sm:hidden">
              Hidden
            </span>
          )}
          <span className="hidden text-xs text-muted-foreground font-mono sm:inline">
            /book/{et.slug}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="cal-badge bg-secondary text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {et.duration}m
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-popover border-border">
            <DropdownMenuItem onClick={() => onEdit(et)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(et.id)}>
              <Files className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyLink(et.slug)}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggle(et)}>
              <Shield className="h-4 w-4 mr-2" />
              {et.isActive ? "Hide" : "Show"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(et.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="hidden items-center gap-1.5 shrink-0 sm:flex">
        {!et.isActive && (
          <span className="text-xs text-muted-foreground mr-2 font-medium">Hidden</span>
        )}
        <Switch
          checked={et.isActive}
          onCheckedChange={() => onToggle(et)}
        />
        <Link to={`/book/${et.slug}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => onCopyLink(et.slug)}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-popover border-border">
            <DropdownMenuItem onClick={() => onEdit(et)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(et.id)}>
              <Files className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyLink(et.slug)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(et.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
