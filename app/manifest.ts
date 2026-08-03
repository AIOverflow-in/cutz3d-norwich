import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "3D Cutz Norwich", short_name: "3D Cutz", description: "Book and manage barber appointments at 3D Cutz Norwich.", start_url: "/", display: "standalone", background_color: "#f4f5f0", theme_color: "#72ec31", icons: [{ src: "/images/cutz3d-logo.webp", sizes: "664x192", type: "image/webp" }] };
}
