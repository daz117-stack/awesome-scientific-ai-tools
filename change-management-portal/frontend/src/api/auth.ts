import { apiClient } from "./client";
import type { CurrentUser } from "../types";

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<{ token: string; user: CurrentUser }>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get<CurrentUser>("/auth/me");
  return data;
}
