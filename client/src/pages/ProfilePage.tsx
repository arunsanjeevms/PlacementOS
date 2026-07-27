import { useForm } from "react-hook-form";
import { User as UserIcon, BadgeCheck, Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/shared/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile } from "@/hooks/useUser";
import { initials } from "@/lib/utils";
import { format } from "date-fns";

interface FormValues {
  name: string;
  targetRole: string;
  college: string;
  branch: string;
  gradYear: string;
  avatarUrl: string;
  bio: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const update = useUpdateProfile();

  const { register, handleSubmit } = useForm<FormValues>({
    values: {
      name: user?.name ?? "",
      targetRole: user?.targetRole ?? "",
      college: user?.college ?? "",
      branch: user?.branch ?? "",
      gradYear: user?.gradYear ? String(user.gradYear) : "",
      avatarUrl: user?.avatarUrl ?? "",
      bio: user?.bio ?? "",
    },
  });

  const onSubmit = handleSubmit((v) => {
    update.mutate({
      name: v.name.trim(),
      targetRole: v.targetRole || undefined,
      college: v.college || undefined,
      branch: v.branch || undefined,
      gradYear: v.gradYear ? Number(v.gradYear) : undefined,
      avatarUrl: v.avatarUrl || "",
      bio: v.bio || undefined,
    });
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage how you show up in PlacementOS." icon={<UserIcon className="h-5 w-5" />} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} />
              <AvatarFallback className="text-2xl">{user ? initials(user.name) : "?"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold">{user?.name}</p>
              <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </p>
            </div>
            {user?.isEmailVerified ? (
              <Badge variant="success">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified
              </Badge>
            ) : (
              <Badge variant="warning">Email not verified</Badge>
            )}
            {user?.createdAt && <p className="text-xs text-muted-foreground">Joined {format(new Date(user.createdAt), "MMMM yyyy")}</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Edit profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" {...register("name", { required: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="targetRole">Target role</Label>
                  <Input id="targetRole" placeholder="e.g. SDE-1" {...register("targetRole")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="college">College</Label>
                  <Input id="college" {...register("college")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="branch">Branch</Label>
                  <Input id="branch" placeholder="CSE" {...register("branch")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gradYear">Graduation year</Label>
                  <Input id="gradYear" type="number" placeholder="2026" {...register("gradYear")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="avatarUrl">Avatar URL</Label>
                  <Input id="avatarUrl" placeholder="https://…" {...register("avatarUrl")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={3} placeholder="A line about your goals…" {...register("bio")} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="gradient" disabled={update.isPending}>
                  {update.isPending ? <Spinner /> : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
