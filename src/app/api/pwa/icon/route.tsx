import { ImageResponse } from "next/og";
import { PWA_SURFACE_COLOR } from "@/app/pwa-metadata";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const size = Number(searchParams.get("size") ?? "512");
  const safeSize = Number.isFinite(size) && size > 0 ? Math.round(size) : 512;
  const iconSrc = `${origin}/icon.png`;
  const cornerRadius = Math.round(safeSize * 0.22);
  const padding = Math.round(safeSize * 0.12);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: PWA_SURFACE_COLOR,
      }}
    >
      <img
        alt="Hinear"
        height={safeSize - padding * 2}
        src={iconSrc}
        width={safeSize - padding * 2}
        style={{
          borderRadius: `${cornerRadius}px`,
        }}
      />
    </div>,
    {
      width: safeSize,
      height: safeSize,
    }
  );
}
