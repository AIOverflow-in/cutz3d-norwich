import { ImageResponse } from "next/og";

export const alt = "3D Cutz Norwich — precision barbering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 70, background: "#0c0d0c", color: "white", fontFamily: "Arial, sans-serif" }}><div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 900, fontSize: 48 }}><span style={{ display: "flex", padding: "5px 12px", background: "#72ec31", color: "#0c0d0c" }}>3D</span><span>CUTZ</span></div><div style={{ display: "flex", flexDirection: "column" }}><span style={{ color: "#72ec31", fontSize: 22, textTransform: "uppercase", letterSpacing: 5 }}>Norwich city centre barber</span><span style={{ marginTop: 18, maxWidth: 950, fontWeight: 900, fontSize: 96, lineHeight: .88, letterSpacing: -7, textTransform: "uppercase" }}>Look sharp.<br />Feel 3D.</span></div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 23, color: "#a8aca7" }}><span>Fades · Cuts · Beard grooming</span><span>19 Prince of Wales Road · NR1 1BD</span></div></div>, size);
}
