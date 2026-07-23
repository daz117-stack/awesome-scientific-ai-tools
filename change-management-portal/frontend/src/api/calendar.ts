import { apiClient } from "./client";
import type { CalendarEvent } from "../types";

export async function getCalendarEvents(from: Date, to: Date) {
  const { data } = await apiClient.get<CalendarEvent[]>("/calendar", {
    params: { from: from.toISOString(), to: to.toISOString() },
  });
  return data;
}
