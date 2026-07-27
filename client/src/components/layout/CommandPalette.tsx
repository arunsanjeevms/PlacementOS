import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { Moon, Sun, LogOut, Search } from "lucide-react";
import { NAV_GROUPS } from "@/constants/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { toggleTheme, resolvedTheme } = useTheme();
  const { logout } = useAuth();

  // Reset scroll on open handled by cmdk automatically.
  useEffect(() => {
    if (!open) return;
  }, [open]);

  const run = (fn: () => void) => {
    onOpenChange(false);
    // Defer so the dialog close animation doesn't clash with navigation.
    setTimeout(fn, 10);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-xl gap-0 overflow-hidden p-0">
        <Command
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground"
          loop
        >
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              placeholder="Search pages and actions…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {NAV_GROUPS.map((group) => (
              <Command.Group key={group.heading} heading={group.heading}>
                {group.items.map((item) => (
                  <Command.Item
                    key={item.to}
                    value={`${group.heading} ${item.label}`}
                    onSelect={() => run(() => navigate(item.to))}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent"
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}

            <Command.Group heading="Actions">
              <Command.Item
                value="toggle theme dark light"
                onSelect={() => run(toggleTheme)}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-accent"
              >
                {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                Toggle theme
              </Command.Item>
              <Command.Item
                value="logout sign out"
                onSelect={() => run(() => void logout())}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-destructive aria-selected:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
