import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Dr. Sunday Okafor";
/** Match hero photo aspect (~4:5) so the full figure fills the frame — no side bars. */
export const size = {
  width: 1200,
  height: 1500,
};
export const contentType = "image/png";

export default async function Image() {
  const bytes = await readFile(
    join(process.cwd(), "public/images/hero-picture.jpeg"),
  );
  const src = `data:image/jpeg;base64,${Buffer.from(bytes).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#050d1a",
        }}
      >
        {/* Tiny ~3% zoom, cover fills edges (no black sides) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={1236}
          height={1545}
          style={{
            position: "absolute",
            width: "103%",
            height: "103%",
            left: "-1.5%",
            top: "-1.5%",
            objectFit: "cover",
            objectPosition: "center 18%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(105deg, rgba(5,13,26,0.92) 0%, rgba(5,13,26,0.72) 45%, rgba(5,13,26,0.35) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(to top, rgba(5,13,26,0.95) 0%, rgba(5,13,26,0.35) 42%, transparent 72%)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
