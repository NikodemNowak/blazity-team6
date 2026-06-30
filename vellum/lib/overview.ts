// Shared dashboard-overview data, used by the real dashboard and every
// layout variant so they all show the same numbers.

import { getActivity, listDocuments } from "./api";
import type { ActivityItem, DocumentSummary } from "./types";

export interface OverviewStats {
  documents: number;
  avgHealth: number;
  needsAttention: number;
  analyzed: number;
  openIssues: number;
}

export interface Overview {
  docs: DocumentSummary[];
  activity: ActivityItem[];
  stats: OverviewStats;
}

export async function getOverview(): Promise<Overview> {
  const [docs, activity] = await Promise.all([listDocuments(), getActivity()]);

  const scored = docs.filter((d) => d.health !== null);
  const avgHealth = Math.round(
    scored.reduce((sum, d) => sum + (d.health ?? 0), 0) / (scored.length || 1)
  );
  const needsAttention = docs.filter(
    (d) => d.status === "stale" || (d.health ?? 100) < 70
  ).length;

  return {
    docs,
    activity,
    stats: {
      documents: docs.length,
      avgHealth,
      needsAttention,
      analyzed: scored.length,
      openIssues: 7,
    },
  };
}
