import { ImageResponse } from "next/og";

export const alt = "DuoGG · Find your League of Legends duo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjQ4IDQ4IDIxOCAyMzQiPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJmbGFtZSIgeDE9IjAuMSIgeTE9IjEiIHgyPSIwLjkiIHkyPSIwIj4KICAgICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmY1YTFmIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2ZmYjIxZSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxtYXNrIGlkPSJob2xlIj4KICAgICAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjMxNSIgaGVpZ2h0PSIzMzIiIGZpbGw9IiNmZmYiLz4KICAgICAgPGNpcmNsZSBjeD0iMTU3IiBjeT0iMTc4IiByPSI3MiIgZmlsbD0iIzAwMCIvPgogICAgPC9tYXNrPgogIDwvZGVmcz4KICA8cGF0aCBmaWxsPSJ1cmwoI2ZsYW1lKSIgbWFzaz0idXJsKCNob2xlKSIgZD0iTTE1NyAyNzggQzk1IDI3OCA1MiAyMzIgNTIgMTc1IEM1MiAxNDAgNjggMTE1IDg0IDk4IEM4OCAxMDYgOTQgMTEwIDEwMCAxMDggQzEwNCA5MCAxMTggNjggMTMwIDU4IEMxMzQgNzIgMTQyIDgyIDE1MCA4NiBDMTY1IDc4IDE5MCA2NiAyMDggNTIgQzIxMiA3MiAyMTggODQgMjI4IDk4IEMyNTAgMTIwIDI2MiAxNDggMjYyIDE3OCBDMjYyIDIzNSAyMTggMjc4IDE1NyAyNzggWiIvPgogIDxwYXRoIGZpbGw9IiNmNGY2ZmYiIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTEyNCAxMzggSDE1OCBDMTg0IDEzOCAyMDIgMTU1IDIwMiAxNzggQzIwMiAyMDEgMTg0IDIxOCAxNTggMjE4IEgxMjQgUTExNCAyMTggMTE0IDIwOCBWMTQ4IFExMTQgMTM4IDEyNCAxMzggWiBNMTM4IDE1OCBWMTk4IEgxNTYgQzE2OSAxOTggMTc4IDE5MCAxNzggMTc4IEMxNzggMTY2IDE2OSAxNTggMTU2IDE1OCBaIi8+Cjwvc3ZnPgo=";

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
          background: "radial-gradient(circle at 80% 20%, #2a1d5c 0%, #070a13 60%)",
          color: "#f4f6ff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <img src={LOGO} width={110} height={118} alt="" />
          <div style={{ display: "flex", fontSize: 72, fontWeight: 900, letterSpacing: "-2px" }}>
            DUO<span style={{ color: "#ffc21a" }}>GG</span>
          </div>
        </div>
        <div style={{ marginTop: 48, fontSize: 64, fontWeight: 900, lineHeight: 1.05, display: "flex", flexDirection: "column" }}>
          <span>Find your duo.</span>
          <span style={{ color: "#ffb21e" }}>Climb together.</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 30, color: "#aab0c8" }}>
          League of Legends duo finder · rank, role &amp; region filters
        </div>
      </div>
    ),
    size,
  );
}
