import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { DocStatus, Severity } from "@/lib/types";

export function Badge({
  tone = "neutral",
  dot,
  children,
}: {
  tone?: "high" | "med" | "low" | "info" | "success" | "neutral";
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={cn("badge", `badge-${tone}`)}>
      {dot && <span className={cn("dot", `dot-${tone}`)} />}
      {children}
    </span>
  );
}

const SEVERITY_TONE: Record<Severity, "high" | "med" | "low" | "info"> = {
  high: "high",
  medium: "med",
  low: "low",
  info: "info",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge tone={SEVERITY_TONE[severity]} dot>
      {severity}
    </Badge>
  );
}

const STATUS_TONE: Record<DocStatus, "success" | "info" | "med" | "neutral"> = {
  published: "success",
  review: "info",
  draft: "neutral",
  stale: "med",
};

export function StatusBadge({ status }: { status: DocStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{status}</Badge>;
}

export function Meter({ value }: { value: number }) {
  return (
    <div className="meter">
      <div className="meter-fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function PageHead({
  title,
  desc,
}: {
  title: string;
  desc?: string;
}) {
  return (
    <div className="page-head">
      <h1 className="page-title">{title}</h1>
      {desc && <p className="page-desc">{desc}</p>}
    </div>
  );
}

export function Loading({ label = "Working…" }: { label?: string }) {
  return (
    <div className="loading-row">
      <span className="spinner" />
      {label}
    </div>
  );
}
