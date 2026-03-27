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
  Eye,
  EyeOff,
  Files,
  Shield,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { EventType, EVENT_COLORS, DURATION_OPTIONS, BUFFER_OPTIONS } from "@/lib/types";
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
import { CustomQuestion } from "@/lib/types";

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareSlug, setShareSlug] = useState("");
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

    // Check for duplicate slugs
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
    toast.success(et.isActive ? "Event type disabled" : "Event type enabled");
  };

  const handleDuplicate = (id: string) => {
    duplicateEventType(id);
    refresh();
    toast.success("Event type duplicated");
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`);
    toast.success("Booking link copied to clipboard");
  };

  const openShare = (slug: string) => {
    setShareSlug(slug);
    setShareDialogOpen(true);
  };

  const addQuestion = () => {
    setForm({
      ...form,
      customQuestions: [
        ...form.customQuestions,
        {
          id: crypto.randomUUID(),
          label: "",
          type: "text",
          required: false,
        },
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

  const activeTypes = eventTypes.filter((e) => e.isActive);
  const inactiveTypes = eventTypes.filter((e) => !e.isActive);

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

      {/* Active Event Types */}
      <div className="cal-card overflow-hidden divide-y divide-border">
        {eventTypes.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              No event types yet
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first event type to start accepting bookings.
            </p>
            <Button onClick={openCreate} variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Create event type
            </Button>
          </div>
        )}
        {activeTypes.map((et) => (
          <EventTypeRow
            key={et.id}
            et={et}
            onEdit={openEdit}
            onToggle={handleToggle}
            onDelete={confirmDelete}
            onDuplicate={handleDuplicate}
            onCopyLink={copyLink}
            onShare={openShare}
            profile={profile}
          />
        ))}
      </div>

      {/* Inactive Event Types */}
      {inactiveTypes.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-muted-foreground mt-8 mb-3 flex items-center gap-2">
            <EyeOff className="h-3.5 w-3.5" />
            Disabled ({inactiveTypes.length})
          </h2>
          <div className="cal-card overflow-hidden divide-y divide-border">
            {inactiveTypes.map((et) => (
              <EventTypeRow
                key={et.id}
                et={et}
                onEdit={openEdit}
                onToggle={handleToggle}
                onDelete={confirmDelete}
                onDuplicate={handleDuplicate}
                onCopyLink={copyLink}
                onShare={openShare}
                profile={profile}
              />
            ))}
          </div>
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Event Type" : "New Event Type"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details for this event type."
                : "Create a new event type for people to book."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-2">
            <TabsList className="grid grid-cols-3 w-full">
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
                />
              </div>
              <div>
                <Label>URL Slug *</Label>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    /book/
                  </span>
                  <Input
                    placeholder="quick-chat"
                    value={form.slug}
                    onChange={(e) =>
                      setForm({ ...form, slug: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="A brief description of this event..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Duration</Label>
                  <Select
                    value={String(form.duration)}
                    onValueChange={(v) =>
                      setForm({ ...form, duration: Number(v) })
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
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {EVENT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`h-6 w-6 rounded-full border-2 transition-all ${
                          form.color === c
                            ? "border-foreground scale-110 ring-2 ring-foreground/20"
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
                  <Label>Buffer before (min)</Label>
                  <Select
                    value={String(form.bufferBefore)}
                    onValueChange={(v) =>
                      setForm({ ...form, bufferBefore: Number(v) })
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
                <div>
                  <Label>Buffer after (min)</Label>
                  <Select
                    value={String(form.bufferAfter)}
                    onValueChange={(v) =>
                      setForm({ ...form, bufferAfter: Number(v) })
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
              <div>
                <Label>Minimum notice (hours)</Label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  How far in advance must bookings be made?
                </p>
                <Input
                  type="number"
                  min={0}
                  max={720}
                  value={form.minNotice}
                  onChange={(e) =>
                    setForm({ ...form, minNotice: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Future booking limit (days)</Label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  How far in the future can someone book?
                </p>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={form.maxFutureDays}
                  onChange={(e) =>
                    setForm({ ...form, maxFutureDays: Number(e.target.value) })
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4 pt-3">
              <p className="text-sm text-muted-foreground">
                Add custom questions to collect information from the person
                booking.
              </p>
              {form.customQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="border border-border rounded-md p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Input
                      placeholder="Question label"
                      value={q.label}
                      onChange={(e) =>
                        updateQuestion(idx, { label: e.target.value })
                      }
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
                      onValueChange={(v) =>
                        updateQuestion(idx, {
                          type: v as "text" | "textarea" | "select",
                        })
                      }
                    >
                      <SelectTrigger className="w-32">
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
                    <div>
                      <Label className="text-xs">
                        Options (comma separated)
                      </Label>
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
                      />
                    </div>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addQuestion}
                className="gap-1.5"
              >
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
              {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event type?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this event type. Anyone with the
              booking link will no longer be able to book.
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

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share your booking link</DialogTitle>
            <DialogDescription>
              Share this link with anyone you'd like to book a meeting with.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={`${window.location.origin}/book/${shareSlug}`}
                className="text-sm"
              />
              <Button size="sm" onClick={() => copyLink(shareSlug)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                <a
                  href={`mailto:?subject=Book a meeting with ${profile.name}&body=Book a meeting with me: ${window.location.origin}/book/${shareSlug}`}
                >
                  Share via Email
                </a>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                <Link to={`/book/${shareSlug}`} target="_blank">
                  Open Preview
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function EventTypeRow({
  et,
  onEdit,
  onToggle,
  onDelete,
  onDuplicate,
  onCopyLink,
  onShare,
  profile,
}: {
  et: EventType;
  onEdit: (et: EventType) => void;
  onToggle: (et: EventType) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopyLink: (slug: string) => void;
  onShare: (slug: string) => void;
  profile: { username: string };
}) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 hover:bg-cal-subtle transition-colors group ${
        !et.isActive ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div
          className="w-1 h-12 rounded-full flex-shrink-0"
          style={{ backgroundColor: et.color }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {et.title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">
            {et.description || "No description"}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {et.duration}m
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              /{et.slug}
            </span>
            {(et.bufferBefore > 0 || et.bufferAfter > 0) && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {et.bufferBefore > 0 && `${et.bufferBefore}m before`}
                {et.bufferBefore > 0 && et.bufferAfter > 0 && " · "}
                {et.bufferAfter > 0 && `${et.bufferAfter}m after`}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:flex gap-1.5 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onCopyLink(et.slug)}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
        <Switch checked={et.isActive} onCheckedChange={() => onToggle(et)} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
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
            <DropdownMenuItem onClick={() => onShare(et.slug)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
            <Link to={`/book/${et.slug}`} target="_blank">
              <DropdownMenuItem>
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
            </Link>
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
