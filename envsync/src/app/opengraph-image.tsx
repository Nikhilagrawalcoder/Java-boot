import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "EnvSync — Configuration intelligence for SaaS teams";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0c",
          backgroundImage:
            "radial-gradient(circle at 25% 15%, rgba(99,102,241,0.35), transparent 55%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.18), transparent 45%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              background: "#4f46e5",
              color: "white",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            E
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "white" }}>EnvSync</div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 58,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.15,
            maxWidth: 920,
          }}
        >
          Your SaaS works. Until one environment variable doesn't.
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 26, color: "#a1a1aa", maxWidth: 800 }}>
          Discover, compare, and validate your configuration across environments — before
          deployment.
        </div>
      </div>
    ),
    { ...size }
  );
}
