import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Palette, Timer, Mail, Database, Shield, Sun, Moon, Monitor, Download, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PasswordInput } from "@/components/shared/PasswordInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Spinner } from "@/components/shared/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { ACCENTS, type Theme } from "@/contexts/theme-context";
import { useUpdatePreferences, useChangePassword } from "@/hooks/useUser";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { getApiErrorMessage } from "@/services/api";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme, accent, setAccent } = useTheme();
  const updatePrefs = useUpdatePreferences();
  const changePassword = useChangePassword();
  const navigate = useNavigate();

  const prefs = user?.preferences;
  const [goalHours, setGoalHours] = useState(prefs?.dailyGoalHours ?? 4);
  const [goalTasks, setGoalTasks] = useState(prefs?.dailyGoalTasks ?? 5);
  const [pomo, setPomo] = useState(prefs?.pomodoro ?? { focus: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4, autoStartBreaks: false, autoStartPomodoros: false, sound: true });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveStudy = () => updatePrefs.mutate({ dailyGoalHours: goalHours, dailyGoalTasks: goalTasks, pomodoro: pomo }, { onSuccess: () => toast.success("Study settings saved") });

  const toggleEmail = (key: keyof NonNullable<typeof prefs>["email"], value: boolean) => {
    updatePrefs.mutate({ email: { [key]: value } });
  };

  const exportBackup = async () => {
    const data = await userService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `placementos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const doChangePassword = () => {
    if (newPassword.length < 8) return toast.error("New password must be at least 8 characters");
    changePassword.mutate({ currentPassword, newPassword }, { onSuccess: () => { setCurrentPassword(""); setNewPassword(""); } });
  };

  const logoutEverywhere = async () => {
    try {
      await authService.logoutAll();
      toast.success("Signed out of all devices");
      navigate("/login");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const deleteAccount = async () => {
    try {
      await userService.deleteAccount();
      await logout();
      navigate("/register");
      toast.success("Account deleted");
    } catch (e) {
      toast.error(getApiErrorMessage(e));
    }
  };

  const THEMES: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Personalize PlacementOS to fit how you work." icon={<SettingsIcon className="h-5 w-5" />} />

      <Tabs defaultValue="appearance">
        <TabsList className="flex-wrap">
          <TabsTrigger value="appearance"><Palette className="h-4 w-4" /> Appearance</TabsTrigger>
          <TabsTrigger value="study"><Timer className="h-4 w-4" /> Study</TabsTrigger>
          <TabsTrigger value="email"><Mail className="h-4 w-4" /> Email</TabsTrigger>
          <TabsTrigger value="data"><Database className="h-4 w-4" /> Data</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        {/* Appearance */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn("flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors", theme === t.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-accent")}
                  >
                    <t.icon className="h-4 w-4" /> {t.label}
                  </button>
                ))}
              </div>
              <div>
                <Label className="mb-2 block">Accent color</Label>
                <div className="flex flex-wrap gap-2.5">
                  {ACCENTS.map((a) => (
                    <button
                      key={a.value}
                      onClick={() => { setAccent(a.value); updatePrefs.mutate({ accent: a.value }); }}
                      className={cn("h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-110", accent === a.value ? "ring-foreground" : "ring-transparent")}
                      style={{ backgroundColor: `hsl(${a.hsl})` }}
                      title={a.label}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study */}
        <TabsContent value="study">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily goals & Pomodoro defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Daily study goal (hours)</Label>
                  <Input type="number" min={0} max={24} value={goalHours} onChange={(e) => setGoalHours(Number(e.target.value))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Daily task goal</Label>
                  <Input type="number" min={0} max={100} value={goalTasks} onChange={(e) => setGoalTasks(Number(e.target.value))} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                {([["focus", "Focus"], ["shortBreak", "Short break"], ["longBreak", "Long break"], ["longBreakInterval", "Long every"]] as const).map(([key, label]) => (
                  <div key={key} className="space-y-1.5">
                    <Label>{label}</Label>
                    <Input type="number" min={1} value={pomo[key]} onChange={(e) => setPomo({ ...pomo, [key]: Number(e.target.value) })} />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {([["autoStartBreaks", "Auto-start breaks"], ["autoStartPomodoros", "Auto-start focus"], ["sound", "Completion sound"]] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between text-sm">
                    {label}
                    <Switch checked={pomo[key]} onCheckedChange={(v) => setPomo({ ...pomo, [key]: v })} />
                  </label>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="gradient" onClick={saveStudy} disabled={updatePrefs.isPending}>
                  {updatePrefs.isPending ? <Spinner /> : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {([["morningDigest", "Morning digest", "Today's tasks, goal & streak each morning"], ["nightSummary", "Night summary", "What you accomplished + tomorrow's plan"], ["missedStudy", "Missed-study reminder", "A nudge if you haven't studied by evening"], ["achievements", "Achievement alerts", "Get notified when you unlock a milestone"]] as const).map(([key, label, desc]) => (
                <label key={key} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={prefs?.email[key] ?? true} onCheckedChange={(v) => toggleEmail(key, v)} />
                </label>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Backup & export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium">Export all data</p>
                  <p className="text-xs text-muted-foreground">Download a full JSON backup of everything in your account.</p>
                </div>
                <Button variant="outline" onClick={exportBackup}>
                  <Download className="h-4 w-4" /> Export
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Resources can be imported individually from the Resources page.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Current password</Label>
                  <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>New password</Label>
                  <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={logoutEverywhere}>
                  <LogOut className="h-4 w-4" /> Sign out everywhere
                </Button>
                <Button variant="gradient" onClick={doChangePassword} disabled={changePassword.isPending || !currentPassword || !newPassword}>
                  {changePassword.isPending ? <Spinner /> : "Update password"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger zone</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data. This cannot be undone.</p>
              </div>
              <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete your account?"
        description="All your tasks, notes, sessions and everything else will be permanently erased."
        confirmLabel="Delete forever"
        destructive
        onConfirm={deleteAccount}
      />
    </div>
  );
}
