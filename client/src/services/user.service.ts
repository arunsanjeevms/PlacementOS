import { api, type ApiEnvelope } from "./api";
import type { User, UserPreferences } from "@/types";

export interface ProfileInput {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  college?: string;
  branch?: string;
  gradYear?: number;
  targetRole?: string;
}

export type PreferencesInput = Partial<
  Omit<UserPreferences, "pomodoro" | "email"> & {
    pomodoro: Partial<UserPreferences["pomodoro"]>;
    email: Partial<UserPreferences["email"]>;
  }
>;

export const userService = {
  async updateProfile(input: ProfileInput): Promise<User> {
    const { data } = await api.patch<ApiEnvelope<{ user: User }>>("/users/me", input);
    return data.data.user;
  },
  async updatePreferences(input: PreferencesInput): Promise<User> {
    const { data } = await api.patch<ApiEnvelope<{ user: User }>>("/users/me/preferences", input);
    return data.data.user;
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const { data } = await api.post<ApiEnvelope<null>>("/users/me/change-password", { currentPassword, newPassword });
    return data.message;
  },
  async exportData(): Promise<unknown> {
    const { data } = await api.get<ApiEnvelope<unknown>>("/users/me/export");
    return data.data;
  },
  async deleteAccount(): Promise<void> {
    await api.delete("/users/me");
  },
};
