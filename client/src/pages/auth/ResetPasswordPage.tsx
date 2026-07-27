import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { Spinner } from "@/components/shared/LoadingScreen";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/services/api";

const schema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ password }) => {
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      toast.success("Password updated — you can sign in now");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  });

  if (!token) {
    return (
      <AuthShell>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Invalid link</h2>
          <p className="mt-2 text-sm text-muted-foreground">This reset link is missing or malformed.</p>
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link to="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Set a new password</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">Choose a strong password you haven't used before.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <PasswordInput id="password" autoComplete="new-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <PasswordInput id="confirm" autoComplete="new-password" {...register("confirm")} />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
        </div>
        <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isSubmitting || done}>
          {isSubmitting ? <Spinner /> : "Reset password"}
        </Button>
      </form>
    </AuthShell>
  );
}
