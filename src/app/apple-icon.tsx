import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home screen icon
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(circle at 50% 30%, #7c2d3e, #0d0a0e 75%)",
      }}>
        <div style={{ width: 64, height: 64, transform: "rotate(45deg)", border: "6px solid #e0c992", borderRadius: 6 }} />
      </div>
    ),
    size
  );
}
