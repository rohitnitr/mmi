import type { PeerFeedback } from "@/lib/peer-feedback";

// "What people say about my skills". Renders nothing until a real evaluation exists.
// Inline styles + currentColor so it works with any page theme.

const card: React.CSSProperties = {
  border: "1px solid rgba(128,128,128,.28)",
  borderRadius: 14,
  padding: 20,
  marginTop: 24,
};
const muted: React.CSSProperties = { opacity: 0.65, fontSize: 13 };

function Bar({ value }: { value: number }) {
  return (
    <div
      aria-hidden
      style={{ height: 8, borderRadius: 99, background: "rgba(128,128,128,.22)", overflow: "hidden", flex: 1 }}
    >
      <div style={{ width: (value / 5) * 100 + "%", height: "100%", background: "#16a34a", borderRadius: 99 }} />
    </div>
  );
}

export default function PeerFeedbackSection({ data }: { data: PeerFeedback }) {
  if (!data || data.evaluationCount === 0) return null;

  const { evaluationCount, peerCount, dimensions, skills, comments } = data;

  return (
    <section style={card} aria-labelledby="peer-feedback-title">
      <h2 id="peer-feedback-title" style={{ margin: 0, fontSize: 20 }}>
        What people say about my skills
      </h2>
      <p style={{ ...muted, margin: "4px 0 16px" }}>
        Based on {evaluationCount} mock-interview evaluation{evaluationCount === 1 ? "" : "s"} from {peerCount} peer
        {peerCount === 1 ? "" : "s"}. Ratings are out of 5.
      </p>

      {skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Skills rated by peers</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {skills.map((s) => (
              <div key={s.skill}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                  <strong>{s.skill}</strong>
                  <span>
                    {s.avg.toFixed(1)} / 5{" "}
                    <span style={muted}>
                      · {s.ratings} rating{s.ratings === 1 ? "" : "s"}
                    </span>
                  </span>
                </div>
                <Bar value={s.avg} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: comments.length ? 20 : 0 }}>
        <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>Interview performance</h3>
        <div style={{ display: "grid", gap: 8 }}>
          {dimensions.map((d) => (
            <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
              <span style={{ width: 130 }}>{d.label}</span>
              <Bar value={d.avg} />
              <span style={{ width: 36, textAlign: "right" }}>{d.avg.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {comments.length > 0 && (
        <div>
          <h3 style={{ fontSize: 15, margin: "0 0 10px" }}>What went well</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {comments.map((c, i) => (
              <blockquote
                key={i}
                style={{
                  margin: 0,
                  padding: "8px 14px",
                  borderLeft: "3px solid #16a34a",
                  background: "rgba(128,128,128,.08)",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                {c.text}
                <div style={{ ...muted, marginTop: 4 }}>
                  A peer · {new Date(c.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
