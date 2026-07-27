import { api, setAccessToken, type ApiEnvelope } from "./api";
import type { AuthResponse, User } from "@/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}
export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>("/auth/register", payload);
    setAccessToken(data.data.accessToken);
    return data.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<ApiEnvelope<AuthResponse>>("/auth/login", payload);
    setAccessToken(data.data.accessToken);
    return data.data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<ApiEnvelope<{ user: User }>>("/auth/me");
    return data.data.user;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
    setAccessToken(null);
  },

  async logoutAll(): Promise<void> {
    await api.post("/auth/logout-all");
    setAccessToken(null);
  },

  async forgotPassword(email: string): Promise<string> {
    const { data } = await api.post<ApiEnvelope<null>>("/auth/forgot-password", { email });
    return data.message;
  },

  async resetPassword(token: string, password: string): Promise<string> {
    const { data } = await api.post<ApiEnvelope<null>>("/auth/reset-password", { token, password });
    return data.message;
  },

  async verifyEmail(token: string): Promise<string> {
    const { data } = await api.post<ApiEnvelope<null>>("/auth/verify-email", { token });
    return data.message;
  },

  async resendVerification(): Promise<string> {
    const { data } = await api.post<ApiEnvelope<null>>("/auth/resend-verification");
    return data.message;
  },
};
