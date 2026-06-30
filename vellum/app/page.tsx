import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/icons";
import { Badge, Meter, PageHead, StatusBadge } from "@/components/ui";
import { getActivity, listDocuments } from "@/lib/api";

const ACTIVITY_TONE = {
  generate: "info",
  analyze: "low",
  review: "med",
  drift: "high",
} as const;

export default async function DashboardPage() {
  const [docs, activity] = await Promise.all([listDocuments(), getActivity()]);

  const scored = docs.filter((d) => d.health !== null);
  const avgHealth = Math.round(
    scored.reduce((sum, d) => sum + (d.health ?? 0), 0) / (scored.length || 1)
  );
  const needsReview = docs.filter(
    (d) => d.status === "stale" || (d.health ?? 100) < 70
  ).length;

  const actions = [
    { href: "/generate", label: "Generate a doc", icon: Icon.Generate, desc: "Draft from code or notes" },
    { href: "/analyze", label: "Analyze a doc", icon: Icon.Analyze, desc: "Score structure & coverage" },
    { href: "/review", label: "Review a doc", icon: Icon.Review, desc: "Find issues & fixes" },
  ];

  return (
    <AppShell title="Dashboard">
      <PageHead
        title="Documentation workspace"
        desc="Draft, measure, and review your docs with an LLM in the loop. Everything here runs on mock data."
      />

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <div className="card stat">
          <div className="stat-label">Documents</div>
          <div className="stat-value">{docs.length}</div>
          <div className="stat-delta faint">across the workspace</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Average health</div>
          <div className="stat-value">{avgHealth}</div>
          <div className="stat-delta faint">{scored.length} analyzed</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Needs attention</div>
          <div className="stat-value">{needsReview}</div>
          <div className="stat-delta faint">stale or low health</div>
        </div>
        <div className="card stat">
          <div className="stat-label">Open issues</div>
          <div className="stat-value">7</div>
          <div className="stat-delta faint">1 high · 3 medium</div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        {actions.map((a) => {
          const I = a.icon;
          return (
            <Link key={a.href} href={a.href} className="card card-pad">
              <div className="row-between">
                <I />
                <Icon.Arrow style={{ color: "var(--text-faint)" }} />
              </div>
              <div style={{ marginTop: 12, fontWeight: 600 }}>{a.label}</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                {a.desc}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-head">
            <span className="card-title">Documents needing attention</span>
            <Link href="/documents" className="tag-link" style={{ fontSize: 12.5 }}>
              View all
            </Link>
          </div>
          <div>
            {docs
              .filter((d) => d.status === "stale" || (d.health ?? 100) < 80)
              .slice(0, 4)
              .map((d) => (
                <div
                  key={d.id}
                  className="card-pad"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div className="row-between">
                    <span className="cell-title">{d.title}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="row" style={{ marginTop: 8, gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <Meter value={d.health ?? 0} />
                    </div>
                    <span className="faint" style={{ fontSize: 12, width: 28 }}>
                      {d.health ?? "—"}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span className="card-title">Recent activity</span>
          </div>
          <div>
            {activity.map((a) => (
              <div
                key={a.id}
                className="card-pad"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div className="row-between">
                  <span className="cell-title">{a.title}</span>
                  <Badge tone={ACTIVITY_TONE[a.kind]}>{a.kind}</Badge>
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                  {a.meta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
