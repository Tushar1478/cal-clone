import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  EyeOff,
  Eye,
  Files,
  Link as LinkIcon,
  Code2,
  ChevronDown,
  Globe,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  EventType,
  EVENT_COLORS,
  DURATION_OPTIONS,
  BUFFER_OPTIONS,
  CustomQuestion,
} from "@/lib/types";
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
  DialogFooter,
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

// ─── helpers ──────────────────────────────────────────────

function toSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitiseSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Page ─────────────────────────────────────────────────

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventType | null>(null);
  const profile = getProfile();

  const blankForm = () => ({
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

  const [form, setForm] = useState(blankForm());

  useEffect(() => {
    setEventTypes(getEventTypes());
  }, []);

  const refresh = () => setEventTypes(getEventTypes());

  // ── Create flow ──────────────────────────────────────────
  const openCreate = () => {
    setForm(blankForm());
    setCreateOpen(true);
  };

  const handleCreate = () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and URL slug are required");
      return;
    }
    const slug = sanitiseSlug(form.slug);
    if (getEventTypes().find((e) => e.slug === slug)) {
      toast.error("This URL slug is already in use");
      return;
    }
    const et: EventType = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      slug,
      description: form.description,
      duration: form.duration,
      color: form.color,
      isActive: true,
      bufferBefore: form.bufferBefore,
      bufferAfter: form.bufferAfter,
      customQuestions: [],
      minNotice: form.minNotice,
      maxFutureDays: form.maxFutureDays,
    };
    saveEventType(et);
    refresh();
    setCreateOpen(false);
    toast.success(`${et.title} event type created successfully`);
  };

  // ── Edit flow ────────────────────────────────────────────
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
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and URL slug are required");
      return;
    }
    const slug = sanitiseSlug(form.slug);
    if (getEventTypes().find((e) => e.slug === slug && e.id !== editing.id)) {
      toast.error("This URL slug is already in use");
      return;
    }
    const et: EventType = {
      ...editing,
      title: form.title.trim(),
      slug,
      description: form.description,
      duration: form.duration,
      color: form.color,
      bufferBefore: form.bufferBefore,
      bufferAfter: form.bufferAfter,
      customQuestions: form.customQuestions,
      minNotice: form.minNotice,
      maxFutureDays: form.maxFutureDays,
    };
    saveEventType(et);
    refresh();
    setEditOpen(false);
    toast.success(`${et.title} event type updated successfully`);
  };

  // ── Delete ───────────────────────────────────────────────
  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteEventType(deletingId);
      refresh();
      toast.success("Event type deleted successfully");
    }
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  // ── Toggle / Duplicate / Copy ────────────────────────────
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

  // ── Questions helpers ────────────────────────────────────
  const addQuestion = () =>
    setForm((f) => ({
      ...f,
      customQuestions: [
        ...f.customQuestions,
        { id: crypto.randomUUID(), label: "", type: "text", required: false },
      ],
    }));

  const updateQuestion = (idx: number, updates: Partial<CustomQuestion>) =>
    setForm((f) => {
      const q = [...f.customQuestions];
      q[idx] = { ...q[idx], ...updates };
      return { ...f, customQuestions: q };
    });

  const removeQuestion = (idx: number) =>
    setForm((f) => ({
      ...f,
      customQuestions: f.customQuestions.filter((_, i) => i !== idx),
    }));

  return (
    <DashboardLayout>
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Event Types</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure different events for people to book on your calendar.
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          className="h-9 gap-1.5 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New event type
        </Button>
      </div>

      {/* ── Profile group header ─────────────────────────── */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        {/* Group header row */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0 select-none">
              {profile.username?.slice(0, 2).toUpperCase() || "ME"}
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">
                {profile.username}
              </span>
              <span className="ml-1.5 text-xs text-muted-foreground">
                {eventTypes.length}{" "}
                {eventTypes.length === 1 ? "event type" : "event types"}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={openCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>

        {/* ── Empty state ──────────────────────────────── */}
        {eventTypes.length === 0 && (
          <div className="px-6 py-16 text-center flex flex-col items-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-full border-2 border-dashed border-border flex items-center justify-center">
              <LinkIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Create your first event type
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-5">
              Event types enable you to share links that show available times on
              your calendar and allow people to make bookings with you.
            </p>
            <Button
              onClick={openCreate}
              size="sm"
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              New event type
            </Button>
          </div>
        )}

        {/* ── Event type rows ──────────────────────────── */}
        {eventTypes.length > 0 && (
          <ul className="divide-y divide-border">
            {eventTypes.map((et) => (
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
          </ul>
        )}
      </div>

      {/* ── Create dialog (lightweight — title/slug/duration only) ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Add new event type
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Create a new event type to start accepting bookings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Quick Chat"
                value={form.title}
                autoFocus
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    title: e.target.value,
                    slug: toSlug(e.target.value),
                  }))
                }
              />
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                URL <span className="text-destructive">*</span>
              </Label>
              <div className="flex rounded-md overflow-hidden border border-input focus-within:ring-1 focus-within:ring-ring">
                <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm border-r border-input whitespace-nowrap shrink-0">
                  /{profile.username}/
                </span>
                <Input
                  placeholder="quick-chat"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value }))
                  }
                  className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Duration</Label>
              <Select
                value={String(form.duration)}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, duration: Number(v) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {EVENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    className={`h-6 w-6 rounded-full border-2 transition-transform ${
                      form.color === c
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setForm((f) => ({ ...f, color: c }))}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog (full settings) ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[88vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Edit event type
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Make changes to your event type settings.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="setup" className="mt-1">
            <TabsList className="grid grid-cols-3 w-full bg-muted/50 h-9">
              <TabsTrigger value="setup" className="text-xs">
                Setup
              </TabsTrigger>
              <TabsTrigger value="availability" className="text-xs">
                Availability
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs">
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* ── Setup tab ── */}
            <TabsContent value="setup" className="space-y-5 pt-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Quick Chat"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">URL</Label>
                <div className="flex rounded-md overflow-hidden border border-input focus-within:ring-1 focus-within:ring-ring">
                  <span className="flex items-center px-3 bg-muted text-muted-foreground text-sm border-r border-input whitespace-nowrap shrink-0">
                    /{profile.username}/
                  </span>
                  <Input
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  placeholder="A brief description of this event..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Duration</Label>
                  <Select
                    value={String(form.duration)}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, duration: Number(v) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Color</Label>
                  <div className="flex gap-2 flex-wrap pt-1">
                    {EVENT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`h-6 w-6 rounded-full border-2 transition-transform ${
                          form.color === c
                            ? "border-foreground scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                        onClick={() => setForm((f) => ({ ...f, color: c }))}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom questions section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Booking questions
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={addQuestion}
                  >
                    <Plus className="h-3 w-3" />
                    Add question
                  </Button>
                </div>
                {form.customQuestions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No custom questions yet. Add questions to collect info from
                    bookers.
                  </p>
                )}
                {form.customQuestions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="border border-border rounded-lg p-3 space-y-2 bg-muted/20"
                  >
                    <div className="flex items-start gap-2">
                      <Input
                        placeholder="Question label"
                        value={q.label}
                        onChange={(e) =>
                          updateQuestion(idx, { label: e.target.value })
                        }
                        className="flex-1 h-8 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeQuestion(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={q.type}
                        onValueChange={(v) =>
                          updateQuestion(idx, {
                            type: v as "text" | "textarea" | "select",
                          })
                        }
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
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
                          onChange={(e) =>
                            updateQuestion(idx, { required: e.target.checked })
                          }
                          className="rounded"
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
                            options: e.target.value
                              .split(",")
                              .map((o) => o.trim())
                              .filter(Boolean),
                          })
                        }
                        className="text-xs h-7"
                      />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* ── Availability tab ── */}
            <TabsContent value="availability" className="space-y-5 pt-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Minimum notice (hours)
                </Label>
                <p className="text-xs text-muted-foreground">
                  How far in advance must bookings be made?
                </p>
                <Input
                  type="number"
                  min={0}
                  max={720}
                  value={form.minNotice}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      minNotice: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Booking window (days)
                </Label>
                <p className="text-xs text-muted-foreground">
                  How far into the future can someone book?
                </p>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={form.maxFutureDays}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      maxFutureDays: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </TabsContent>

            {/* ── Advanced tab ── */}
            <TabsContent value="advanced" className="space-y-5 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Buffer before</Label>
                  <Select
                    value={String(form.bufferBefore)}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, bufferBefore: Number(v) }))
                    }
                  >
                    <SelectTrigger>
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
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Buffer after</Label>
                  <Select
                    value={String(form.bufferAfter)}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, bufferAfter: Number(v) }))
                    }
                  >
                    <SelectTrigger>
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
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-2 border-t border-border gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event type?</AlertDialogTitle>
            <AlertDialogDescription>
              Anyone who you've shared this link with will no longer be able to
              book using it.
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
  const bookingUrl = `/${profile.username}/${et.slug}`;

  return (
    <li
      className={`
        group relative flex items-center gap-4 px-5 py-4
        transition-colors hover:bg-muted/40
        ${!et.isActive ? "opacity-60" : ""}
      `}
    >
      {/* ── Left color accent bar ─────────────────────── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-sm transition-opacity"
        style={{
          backgroundColor: et.color,
          opacity: et.isActive ? 1 : 0.5,
        }}
      />

      {/* ── Main content ──────────────────────────────── */}
      <div className="flex-1 min-w-0 pl-1">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <button
            className="text-sm font-semibold text-foreground hover:text-foreground/80 truncate text-left transition-colors"
            onClick={() => onEdit(et)}
          >
            {et.title}
          </button>
          {!et.isActive && (
            <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              Hidden
            </span>
          )}
        </div>

        {/* Slug + duration row */}
        <div className="flex items-center gap-2 mt-0.5">
          <a
            href={`/book${bookingUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {bookingUrl}
          </a>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {et.duration} mins
          </span>
        </div>
      </div>

      {/* ── Row actions ───────────────────────────────── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Edit button — visible on hover */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2.5 gap-1.5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onEdit(et)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>

        {/* Preview link — visible on hover */}
        <a
          href={`/book${bookingUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            title="Preview"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </a>

        {/* Toggle — always visible */}
        <Switch
          checked={et.isActive}
          onCheckedChange={() => onToggle(et)}
          className="data-[state=checked]:bg-green-500 scale-90"
        />

        {/* ⋯ menu — always visible */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-popover border-border text-sm"
          >
            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => onEdit(et)}
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => onDuplicate(et.id)}
            >
              <Files className="h-3.5 w-3.5 text-muted-foreground" />
              Duplicate
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => onCopyLink(et.slug)}
            >
              <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Copy link
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(
                  `<iframe src="${window.location.origin}/book/${et.slug}" />`
                );
                toast.success("Embed code copied");
              }}
            >
              <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
              Embed
            </DropdownMenuItem>

            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => onToggle(et)}
            >
              {et.isActive ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  Hide from profile
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  Show on profile
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={() => onDelete(et.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
