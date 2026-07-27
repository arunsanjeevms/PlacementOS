import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagInput } from "@/components/shared/TagInput";
import { Spinner } from "@/components/shared/LoadingScreen";
import { useCreateResource, useUpdateResource } from "@/hooks/useResources";
import { RESOURCE_TYPES, RESOURCE_TYPE_META, DIFFICULTIES } from "@/constants/resources";
import { TASK_CATEGORIES } from "@/constants/tasks";
import type { Resource, ResourceInput } from "@/types/resource";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  resource?: Resource | null;
}

interface FormValues {
  title: string;
  url: string;
  description: string;
  type: string;
  category: string;
  difficulty: string;
  folder: string;
  tags: string[];
  notes: string;
}

function toForm(r?: Resource | null): FormValues {
  return {
    title: r?.title ?? "",
    url: r?.url ?? "",
    description: r?.description ?? "",
    type: r?.type ?? "website",
    category: r?.category ?? "",
    difficulty: r?.difficulty ?? "",
    folder: r?.folder ?? "",
    tags: r?.tags ?? [],
    notes: r?.notes ?? "",
  };
}

export function ResourceDialog({ open, onOpenChange, resource }: Props) {
  const create = useCreateResource();
  const update = useUpdateResource();
  const isEdit = !!resource;
  const { register, handleSubmit, control, reset, formState } = useForm<FormValues>({ defaultValues: toForm(resource) });

  useEffect(() => {
    if (open) reset(toForm(resource));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resource]);

  const onSubmit = handleSubmit(async (v) => {
    const payload: ResourceInput = {
      title: v.title.trim(),
      url: v.url.trim(),
      description: v.description || undefined,
      type: v.type as ResourceInput["type"],
      category: v.category || undefined,
      difficulty: (v.difficulty || undefined) as ResourceInput["difficulty"],
      folder: v.folder || undefined,
      tags: v.tags,
      notes: v.notes || undefined,
    };
    if (isEdit) await update.mutateAsync({ id: resource._id, input: payload });
    else await create.mutateAsync(payload);
    onOpenChange(false);
  });

  const saving = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit resource" : "Save a resource"}</DialogTitle>
          <DialogDescription>Bookmark any useful placement-prep resource.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="url">URL</Label>
            <Input id="url" autoFocus placeholder="https://…" {...register("url", { required: true })} />
            {formState.errors.url && <p className="text-xs text-destructive">A valid URL is required</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Resource title" {...register("title", { required: true })} />
            {formState.errors.title && <p className="text-xs text-destructive">Title is required</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {RESOURCE_TYPE_META[t].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d} value={d} className="capitalize">
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Subject / Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {TASK_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="folder">Folder</Label>
              <Input id="folder" placeholder="e.g. DSA Sheets" {...register("folder")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Tags</Label>
            <Controller control={control} name="tags" render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner /> : isEdit ? "Save changes" : "Save resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
