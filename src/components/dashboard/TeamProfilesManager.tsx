"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  X,
  Users,
  ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createTeamProfile,
  updateTeamProfile,
  deleteTeamProfile,
  toggleTeamProfilePublished,
  type TeamProfileInput,
} from "@/app/dashboard/team/actions";

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const PLACEHOLDER_IMAGE = "/assets/img/team/teamThumb3_1.jpg";

type TeamProfileRow = {
  id: string;
  name: string;
  role: string;
  image: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  sortOrder: number;
  published: boolean;
};

type FormState = TeamProfileInput & { id?: string };

const emptyForm: FormState = {
  name: "",
  role: "",
  image: null,
  facebookUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  sortOrder: 0,
  published: true,
};

export function TeamProfilesManager({
  initialProfiles,
}: {
  initialProfiles: TeamProfileRow[];
}) {
  const router = useRouter();
  const [profiles, setProfiles] = React.useState(initialProfiles);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const isEdit = Boolean(form.id);

  React.useEffect(() => {
    setProfiles(initialProfiles);
  }, [initialProfiles]);

  const openNew = () => {
    setForm({
      ...emptyForm,
      sortOrder: profiles.length,
    });
    setDialogOpen(true);
  };

  const openEdit = (profile: TeamProfileRow) => {
    setForm({
      id: profile.id,
      name: profile.name,
      role: profile.role,
      image: profile.image,
      facebookUrl: profile.facebookUrl ?? "",
      linkedinUrl: profile.linkedinUrl ?? "",
      instagramUrl: profile.instagramUrl ?? "",
      sortOrder: profile.sortOrder,
      published: profile.published,
    });
    setDialogOpen(true);
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("Image must be under 2MB");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload: TeamProfileInput = {
      name: form.name,
      role: form.role,
      image: form.image,
      facebookUrl: form.facebookUrl,
      linkedinUrl: form.linkedinUrl,
      instagramUrl: form.instagramUrl,
      sortOrder: form.sortOrder,
      published: form.published,
    };

    try {
      if (isEdit && form.id) {
        await updateTeamProfile(form.id, payload);
        toast.success("Team member updated");
      } else {
        await createTeamProfile(payload);
        toast.success("Team member added");
      }
      setDialogOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this team member from the website?")) return;
    setDeletingId(id);
    try {
      await deleteTeamProfile(id);
      toast.success("Team member removed");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublished = async (id: string, published: boolean) => {
    try {
      await toggleTeamProfilePublished(id, published);
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, published } : p))
      );
      toast.success(published ? "Published on website" : "Hidden from website");
      router.refresh();
    } catch {
      toast.error("Could not update visibility");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Website team</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Add pharmacists and specialists for the public Team page — photo, role, and social links.
            The CEO message on that page stays fixed and is not edited here.
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 shrink-0">
          <Plus size={16} /> Add team member
        </Button>
      </div>

      {profiles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium">No team members yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Add your first profile to show on the Team page.
            </p>
            <Button onClick={openNew} className="gap-2">
              <Plus size={16} /> Add team member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <Card key={profile.id} className="overflow-hidden">
              <div className="aspect-square bg-muted relative">
                <img
                  src={profile.image || PLACEHOLDER_IMAGE}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
                {!profile.published && (
                  <Badge variant="secondary" className="absolute top-3 left-3">
                    Hidden
                  </Badge>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{profile.name}</CardTitle>
                <CardDescription>{profile.role}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(profile)}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleTogglePublished(profile.id, !profile.published)}
                >
                  {profile.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  {profile.published ? "Hide" : "Publish"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:text-destructive"
                  disabled={deletingId === profile.id}
                  onClick={() => handleDelete(profile.id)}
                >
                  {deletingId === profile.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit team member" : "Add team member"}</DialogTitle>
            <DialogDescription>
              This appears in the &quot;Our Pharmacists&quot; section on the Team page.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="team-name">Full name *</Label>
                <Input
                  id="team-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Amara Boateng"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-role">Role *</Label>
                <Input
                  id="team-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Lead Pharmacist"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-sort">Display order</Label>
              <Input
                id="team-sort"
                type="number"
                min={0}
                value={form.sortOrder ?? 0}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
            </div>

            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-start gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {form.image ? (
                    <img src={form.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageIcon size={28} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Input type="file" accept="image/*" onChange={handleImageFile} />
                  {form.image && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="justify-start px-0 h-auto text-muted-foreground"
                      onClick={() => setForm({ ...form, image: null })}
                    >
                      <X size={14} className="mr-1" /> Remove photo
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">JPG or PNG, max 2MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-facebook">Facebook URL</Label>
              <Input
                id="team-facebook"
                value={form.facebookUrl ?? ""}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-linkedin">LinkedIn URL</Label>
              <Input
                id="team-linkedin"
                value={form.linkedinUrl ?? ""}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-instagram">Instagram URL</Label>
              <Input
                id="team-instagram"
                value={form.instagramUrl ?? ""}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.published ?? true}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded border-input"
              />
              Show on public Team page
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? "Save changes" : "Add member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
