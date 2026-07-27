import { Hammer } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";

/**
 * Temporary scaffold for modules that are wired into routing but ship in a later
 * build step. Replaced by the real module page as each one lands.
 */
export function ModulePlaceholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={<Hammer className="h-6 w-6" />}
        title="Shipping in an upcoming build"
        description="This module is being built next. Everything around it is fully functional."
      />
    </div>
  );
}
