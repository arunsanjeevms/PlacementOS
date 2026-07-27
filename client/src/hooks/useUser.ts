import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService, type PreferencesInput, type ProfileInput } from "@/services/user.service";
import { getApiErrorMessage } from "@/services/api";
import { useAuth } from "./useAuth";

export function useUpdateProfile() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (input: ProfileInput) => userService.updateProfile(input),
    onSuccess: (user) => {
      setUser(user);
      toast.success("Profile updated");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useUpdatePreferences() {
  const { setUser } = useAuth();
  return useMutation({
    mutationFn: (input: PreferencesInput) => userService.updatePreferences(input),
    onSuccess: (user) => setUser(user),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      userService.changePassword(currentPassword, newPassword),
    onSuccess: (msg) => toast.success(msg),
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
}
