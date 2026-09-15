import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Dr. Sunday Okafor";
export const size = {
  width: 1200,
  height: 630,
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
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: "#050d1a",
        }}
      >
        {/* Full photo visible (no crop) — slight 3% scale only */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={1200}
          height={630}
          style={{
            width: "101.5%",
            height: "101.5%",
            objectFit: "contain",
            objectPosition: "center center",
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
