import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/shared/LoadingScreen";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/services/api";

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard StrictMode double-invoke
    ran.current = true;
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }
    authService
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(getApiErrorMessage(err, "Verification failed"));
      });
  }, [token]);

  return (
    <AuthShell>
      <div className="text-center">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary/12 text-primary">
              <Spinner className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Verifying your email…</h2>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-success/12 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Email verified!</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your account is fully set up.</p>
            <Button asChild variant="gradient" className="mt-6 w-full">
              <Link to="/app">Go to dashboard</Link>
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-destructive/12 text-destructive">
              <XCircle className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Verification failed</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button asChild variant="outline" className="mt-6 w-full">
              <Link to="/app">Continue anyway</Link>
            </Button>
          </>
        )}
      </div>
    </AuthShell>
  );
}
