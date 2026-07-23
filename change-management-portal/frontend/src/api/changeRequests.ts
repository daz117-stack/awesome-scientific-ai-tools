import { apiClient } from "./client";
import type { ChangeRequest, ChangeStatus, ChangeType } from "../types";

export interface CreateChangeRequestInput {
  title: string;
  description: string;
  justification: string;
  type: ChangeType;
  systemsAffected: string[];
  plannedStart?: string;
  plannedEnd?: string;
  implementationPlan?: string;
  testPlan?: string;
  backoutPlan?: string;
}

export async function listChangeRequests(params?: { status?: ChangeStatus; mine?: boolean }) {
  const { data } = await apiClient.get<ChangeRequest[]>("/change-requests", { params });
  return data;
}

export async function getChangeRequest(id: string) {
  const { data } = await apiClient.get<ChangeRequest>(`/change-requests/${id}`);
  return data;
}

export async function createChangeRequest(input: CreateChangeRequestInput) {
  const { data } = await apiClient.post<ChangeRequest>("/change-requests", input);
  return data;
}

export async function updateChangeRequest(id: string, input: Partial<CreateChangeRequestInput>) {
  const { data } = await apiClient.patch<ChangeRequest>(`/change-requests/${id}`, input);
  return data;
}

export async function submitChangeRequest(id: string) {
  const { data } = await apiClient.post<ChangeRequest>(`/change-requests/${id}/submit`);
  return data;
}

export async function triageChangeRequest(id: string, changeManagerId?: string) {
  const { data } = await apiClient.post<ChangeRequest>(`/change-requests/${id}/triage`, { changeManagerId });
  return data;
}

export async function submitRiskAssessment(
  id: string,
  input: {
    impact: number;
    probability: number;
    urgency: number;
    affectedUsers: number;
    downtimeMinutes: number;
    notes?: string;
  }
) {
  const { data } = await apiClient.post<ChangeRequest>(`/change-requests/${id}/risk-assessment`, input);
  return data;
}

export async function scheduleChangeRequest(id: string, implementerId?: string) {
  const { data } = await apiClient.post<ChangeRequest>(`/change-requests/${id}/schedule`, { implementerId });
  return data;
}

export async function startImplementation(id: string) {
  const { data } = await apiClient.post<ChangeRequest>(`/change-requests/${id}/start`);
  return data;
}

export async function completeImplementation(id: string) {
  const { data } = await apiClient.post<ChangeRequest>(`/change-requests/${id}/complete`);
  return data;
}

export async function closeChangeRequest(id: string) {
  const { data } = await apiClient.post<ChangeRequest>(`/change-requests/${id}/close`);
  return data;
}

export async function cancelChangeRequest(id: string) {
  const { data } = await apiClient.post<ChangeRequest>(`/change-requests/${id}/cancel`);
  return data;
}

export async function addComment(id: string, body: string) {
  const { data } = await apiClient.post(`/change-requests/${id}/comments`, { body });
  return data;
}
