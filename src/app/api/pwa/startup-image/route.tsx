import { ImageResponse } from "next/og";
import { PWA_PRIMARY_COLOR, PWA_SURFACE_COLOR } from "@/app/pwa-metadata";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const width = Number(searchParams.get("width") ?? "1179");
  const height = Number(searchParams.get("height") ?? "2556");
  const safeWidth =
    Number.isFinite(width) && width > 0 ? Math.round(width) : 1179;
  const safeHeight =
    Number.isFinite(height) && height > 0 ? Math.round(height) : 2556;
  const iconSize = Math.max(
    220,
    Math.round(Math.min(safeWidth, safeHeight) * 0.26)
  );
  const cardSize = Math.round(iconSize * 1.1);
  const iconSrc = `${origin}/icon.png`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(180deg, ${PWA_PRIMARY_COLOR} 0%, ${PWA_SURFACE_COLOR} 38%, ${PWA_SURFACE_COLOR} 100%)`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0",
          display: "flex",
          background:
            "radial-gradient(circle at top, rgba(255,255,255,0.18), rgba(255,255,255,0) 40%)",
        }}
      />
      <div
        style={{
          width: `${cardSize}px`,
          height: `${cardSize}px`,
          borderRadius: `${Math.round(cardSize * 0.22)}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(17, 19, 24, 0.86)",
          boxShadow: "0 40px 120px rgba(0, 0, 0, 0.28)",
        }}
      >
        <img alt="Hinear" height={iconSize} src={iconSrc} width={iconSize} />
      </div>
    </div>,
    {
      width: safeWidth,
      height: safeHeight,
    }
  );
}
