import UsageDashboard from "@/components/usage-dashboard";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background gradient orbs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-160px",
            left: "-160px",
            width: "400px",
            height: "400px",
            background: "rgba(124, 58, 237, 0.12)",
            borderRadius: "50%",
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "33%",
            right: "-80px",
            width: "320px",
            height: "320px",
            background: "rgba(56, 189, 248, 0.08)",
            borderRadius: "50%",
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "33%",
            width: "280px",
            height: "280px",
            background: "rgba(52, 211, 153, 0.06)",
            borderRadius: "50%",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#fff",
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(90deg, #a78bfa, #38bdf8, #34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              OpenAI
            </span>{" "}
            Usage Dashboard
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(255,255,255,0.35)",
              marginTop: "4px",
            }}
          >
            Monitor your API spending, token consumption, and usage patterns
            across all models.
          </p>
        </div>

        <UsageDashboard />
      </div>
    </main>
  );
}
