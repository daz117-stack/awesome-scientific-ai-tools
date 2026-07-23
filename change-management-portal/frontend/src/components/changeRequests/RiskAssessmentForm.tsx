import { FormEvent, useState } from "react";
import { computeRiskPreview } from "../../utils/risk";
import { RiskBadge } from "../common/RiskBadge";

interface Props {
  onSubmit: (input: {
    impact: number;
    probability: number;
    urgency: number;
    affectedUsers: number;
    downtimeMinutes: number;
    notes?: string;
  }) => Promise<void>;
}

function ScaleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
        <span>{label}</span>
        <span className="text-slate-400">{value} / 5</span>
      </span>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
      />
    </label>
  );
}

export function RiskAssessmentForm({ onSubmit }: Props) {
  const [impact, setImpact] = useState(3);
  const [probability, setProbability] = useState(3);
  const [urgency, setUrgency] = useState(2);
  const [affectedUsers, setAffectedUsers] = useState(0);
  const [downtimeMinutes, setDowntimeMinutes] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const preview = computeRiskPreview(impact, probability, urgency);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ impact, probability, urgency, affectedUsers, downtimeMinutes, notes: notes || undefined });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ScaleField label="Impact if it goes wrong" value={impact} onChange={setImpact} />
      <ScaleField label="Probability of failure" value={probability} onChange={setProbability} />
      <ScaleField label="Urgency" value={urgency} onChange={setUrgency} />
      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Affected users (est.)</span>
          <input
            type="number"
            min={0}
            value={affectedUsers}
            onChange={(e) => setAffectedUsers(Number(e.target.value))}
            className="input"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Est. downtime (minutes)</span>
          <input
            type="number"
            min={0}
            value={downtimeMinutes}
            onChange={(e) => setDowntimeMinutes(Number(e.target.value))}
            className="input"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Assessor notes</span>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-16" />
      </label>

      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
        <span className="text-sm text-slate-600">
          Calculated score: <span className="font-semibold text-slate-900">{preview.score}</span>
        </span>
        <RiskBadge level={preview.level} />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit risk assessment"}
      </button>
    </form>
  );
}
