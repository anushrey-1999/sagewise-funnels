import { NextResponse } from "next/server";
import { getFunnelConfig } from "@/lib/funnel-loader";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ funnelId: string }> }
) {
  try {
    const { funnelId } = await params;
    const config = getFunnelConfig(funnelId);

    if (!config) {
      return NextResponse.json(
        { error: "Funnel config not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(config);
  } catch {
    return NextResponse.json(
      { error: "Failed to load funnel config" },
      { status: 500 }
    );
  }
}
