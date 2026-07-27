import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div className="text-center">
        <Logo size={44} className="justify-center" />
        <p className="mt-10 text-7xl font-bold gradient-text">404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or was moved.</p>
        <Button asChild variant="gradient" className="mt-6">
          <Link to="/app">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
