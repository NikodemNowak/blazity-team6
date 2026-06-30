"use client";
import { AppShell } from "@/components/app-shell";
import { PageHead } from "@/components/ui";
import RepoBar from "@/components/repo/RepoBar";
import RepoDrift from "@/components/repo/RepoDrift";

export default function DriftPage() {
  return (
    <AppShell title="Drift">
      <PageHead
        title="Docs vs. code drift"
        desc="Load a GitHub repo and find where its docs claim something the code contradicts — each flag cites the real contradicting code, so you verify the evidence rather than trust the model."
      />
      <div className="repo-chat">
        <RepoBar />
        <RepoDrift />
      </div>
    </AppShell>
  );
}
