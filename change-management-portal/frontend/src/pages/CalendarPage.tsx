import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import * as calendarApi from "../api/calendar";
import type { CalendarEvent } from "../types";
import { RISK_COLORS } from "../utils/constants";

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const rangeStart = startOfWeek(startOfMonth(month));
  const rangeEnd = endOfWeek(endOfMonth(month));
  const days = useMemo(() => eachDayOfInterval({ start: rangeStart, end: rangeEnd }), [rangeStart, rangeEnd]);

  useEffect(() => {
    calendarApi.getCalendarEvents(rangeStart, rangeEnd).then(setEvents);
  }, [rangeStart, rangeEnd]);

  function eventsForDay(day: Date) {
    return events.filter((e) => {
      const start = new Date(e.plannedStart);
      const end = new Date(e.plannedEnd);
      return day >= startOfDay(start) && day <= endOfDay(end);
    });
  }

  return (
    <AppShell title="Change Calendar">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">{format(month, "MMMM yyyy")}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            ← Previous
          </button>
          <button
            onClick={() => setMonth(new Date())}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Today
          </button>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-3 py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = eventsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={`min-h-28 border-b border-r border-slate-100 p-2 ${
                  isSameMonth(day, month) ? "" : "bg-slate-50 text-slate-300"
                } ${isSameDay(day, new Date()) ? "bg-brand-50" : ""}`}
              >
                <div className="mb-1 text-xs font-medium">{format(day, "d")}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((ev) => (
                    <Link
                      key={ev.id}
                      to={`/change-requests/${ev.id}`}
                      className={`block truncate rounded px-1.5 py-0.5 text-[11px] font-medium ${
                        ev.riskLevel ? RISK_COLORS[ev.riskLevel] : "bg-slate-100 text-slate-600"
                      }`}
                      title={ev.title}
                    >
                      {ev.reference}
                    </Link>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-400">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}
