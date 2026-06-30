import { AppShell } from "@/components/app-shell";
import { PageHead, StatusBadge } from "@/components/ui";
import { listDocuments } from "@/lib/api";

export default async function DocumentsPage() {
  const docs = await listDocuments();

  return (
    <AppShell title="Documents">
      <PageHead
        title="Documents"
        desc="Everything in the workspace. Health comes from the last analysis; status reflects the editorial state."
      />

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Kind</th>
              <th>Owner</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Health</th>
              <th style={{ textAlign: "right" }}>Words</th>
              <th style={{ textAlign: "right" }}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td className="cell-title">{d.title}</td>
                <td className="muted" style={{ textTransform: "capitalize" }}>
                  {d.kind}
                </td>
                <td className="muted">{d.owner}</td>
                <td>
                  <StatusBadge status={d.status} />
                </td>
                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {d.health ?? "—"}
                </td>
                <td
                  className="muted"
                  style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}
                >
                  {d.words.toLocaleString()}
                </td>
                <td className="faint" style={{ textAlign: "right" }}>
                  {d.updatedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
