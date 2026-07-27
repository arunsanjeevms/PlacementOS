import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/shared/LoadingScreen";
import { useCreateCompany, useUpdateCompany } from "@/hooks/useCompanies";
import { COMPANY_STATUSES, COMPANY_STATUS_META, POPULAR_COMPANIES, type CompanyStatus } from "@/constants/companies";
import type { Company, CompanyInput } from "@/types/company";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  company?: Company | null;
}

interface FormValues {
  name: string;
  role: string;
  ctc: string;
  location: string;
  eligibility: string;
  status: CompanyStatus;
  interviewDate: string;
  deadline: string;
  oaPattern: string;
  applied: boolean;
  resumeSent: boolean;
}

function toForm(c?: Company | null): FormValues {
  return {
    name: c?.name ?? "",
    role: c?.role ?? "",
    ctc: c?.ctc ?? "",
    location: c?.location ?? "",
    eligibility: c?.eligibility ?? "",
    status: c?.status ?? "wishlist",
    interviewDate: c?.interviewDate ? c.interviewDate.slice(0, 10) : "",
    deadline: c?.deadline ? c.deadline.slice(0, 10) : "",
    oaPattern: c?.oaPattern ?? "",
    applied: c?.applied ?? false,
    resumeSent: c?.resumeSent ?? false,
  };
}

export function CompanyDialog({ open, onOpenChange, company }: Props) {
  const create = useCreateCompany();
  const update = useUpdateCompany();
  const isEdit = !!company;
  const { register, handleSubmit, control, reset, setValue, formState } = useForm<FormValues>({ defaultValues: toForm(company) });

  useEffect(() => {
    if (open) reset(toForm(company));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, company]);

  const onSubmit = handleSubmit(async (v) => {
    const payload: CompanyInput = {
      name: v.name.trim(),
      role: v.role || undefined,
      ctc: v.ctc || undefined,
      location: v.location || undefined,
      eligibility: v.eligibility || undefined,
      status: v.status,
      oaPattern: v.oaPattern || undefined,
      applied: v.applied,
      resumeSent: v.resumeSent,
      interviewDate: v.interviewDate ? new Date(v.interviewDate).toISOString() : null,
      deadline: v.deadline ? new Date(v.deadline).toISOString() : null,
    };
    if (isEdit) await update.mutateAsync({ id: company._id, input: payload });
    else await create.mutateAsync(payload);
    onOpenChange(false);
  });

  const saving = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit company" : "Track a company"}</DialogTitle>
          <DialogDescription>Keep tabs on every company you're targeting.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Company name</Label>
            <Input id="name" autoFocus list="popular-companies" placeholder="e.g. Amazon" {...register("name", { required: true })} />
            <datalist id="popular-companies">
              {POPULAR_COMPANIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {!isEdit && (
              <div className="flex flex-wrap gap-1 pt-1">
                {POPULAR_COMPANIES.slice(0, 6).map((c) => (
                  <button key={c} type="button" onClick={() => setValue("name", c)} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent">
                    {c}
                  </button>
                ))}
              </div>
            )}
            {formState.errors.name && <p className="text-xs text-destructive">Name is required</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" placeholder="SDE Intern" {...register("role")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ctc">CTC / Stipend</Label>
              <Input id="ctc" placeholder="₹12 LPA" {...register("ctc")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Bengaluru" {...register("location")} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {COMPANY_STATUS_META[s].label}
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
              <Label htmlFor="interviewDate">Interview date</Label>
              <Input id="interviewDate" type="date" {...register("interviewDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Apply by</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="eligibility">Eligibility</Label>
            <Input id="eligibility" placeholder="e.g. CGPA ≥ 7, no backlogs" {...register("eligibility")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oaPattern">OA pattern</Label>
            <Textarea id="oaPattern" rows={2} placeholder="e.g. 2 DSA + 20 MCQs, 90 min" {...register("oaPattern")} />
          </div>
          <div className="flex items-center gap-6">
            <Controller control={control} name="resumeSent" render={({ field }) => (
              <label className="flex items-center gap-2 text-sm"><Switch checked={field.value} onCheckedChange={field.onChange} /> Resume sent</label>
            )} />
            <Controller control={control} name="applied" render={({ field }) => (
              <label className="flex items-center gap-2 text-sm"><Switch checked={field.value} onCheckedChange={field.onChange} /> Applied</label>
            )} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={saving}>
              {saving ? <Spinner /> : isEdit ? "Save changes" : "Add company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
