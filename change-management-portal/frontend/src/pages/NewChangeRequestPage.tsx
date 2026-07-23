import { FormEvent, ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { Card } from "../components/common/Card";
import * as changeRequestsApi from "../api/changeRequests";
import type { ChangeType } from "../types";

export default function NewChangeRequestPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [justification, setJustification] = useState("");
  const [type, setType] = useState<ChangeType>("NORMAL");
  const [systemsAffected, setSystemsAffected] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  const [implementationPlan, setImplementationPlan] = useState("");
  const [testPlan, setTestPlan] = useState("");
  const [backoutPlan, setBackoutPlan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent, submitNow: boolean) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await changeRequestsApi.createChangeRequest({
        title,
        description,
        justification,
        type,
        systemsAffected: systemsAffected
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        plannedStart: plannedStart ? new Date(plannedStart).toISOString() : undefined,
        plannedEnd: plannedEnd ? new Date(plannedEnd).toISOString() : undefined,
        implementationPlan: implementationPlan || undefined,
        testPlan: testPlan || undefined,
        backoutPlan: backoutPlan || undefined,
      });
      if (submitNow) {
        await changeRequestsApi.submitChangeRequest(created.id);
      }
      navigate(`/change-requests/${created.id}`);
    } catch {
      setError("Could not create change request. Check the required fields and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="New Change Request">
      <div className="mx-auto max-w-3xl">
        <Card>
          <form className="space-y-5">
            <Field label="Title">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g. Upgrade core banking database cluster"
              />
            </Field>

            <Field label="Description">
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input min-h-24"
                placeholder="What is changing and how will it be implemented?"
              />
            </Field>

            <Field label="Business justification">
              <textarea
                required
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="input min-h-20"
                placeholder="Why is this change needed?"
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Change type">
                <select value={type} onChange={(e) => setType(e.target.value as ChangeType)} className="input">
                  <option value="STANDARD">Standard (pre-approved, low risk)</option>
                  <option value="NORMAL">Normal (requires CAB review)</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </Field>
              <Field label="Systems affected (comma-separated)">
                <input
                  value={systemsAffected}
                  onChange={(e) => setSystemsAffected(e.target.value)}
                  className="input"
                  placeholder="core-ledger-db, payments-api"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Planned start">
                <input
                  type="datetime-local"
                  value={plannedStart}
                  onChange={(e) => setPlannedStart(e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Planned end">
                <input
                  type="datetime-local"
                  value={plannedEnd}
                  onChange={(e) => setPlannedEnd(e.target.value)}
                  className="input"
                />
              </Field>
            </div>

            <Field label="Implementation plan">
              <textarea
                value={implementationPlan}
                onChange={(e) => setImplementationPlan(e.target.value)}
                className="input min-h-16"
              />
            </Field>
            <Field label="Test plan">
              <textarea value={testPlan} onChange={(e) => setTestPlan(e.target.value)} className="input min-h-16" />
            </Field>
            <Field label="Backout / rollback plan">
              <textarea
                value={backoutPlan}
                onChange={(e) => setBackoutPlan(e.target.value)}
                className="input min-h-16"
              />
            </Field>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={submitting}
                onClick={(e) => handleSubmit(e, false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Save as draft
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={(e) => handleSubmit(e, true)}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                Save &amp; submit for triage
              </button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
