import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAdminUserFromRequest } from "@/lib/admin/session";
import { getPublishedAdwallConfig, getPublishedFunnelConfig } from "@/lib/published-config";

const querySchema = z.object({
  pathname: z.string().min(1),
  funnel: z.string().optional(),
  preview: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = querySchema.parse({
      pathname: url.searchParams.get("pathname") || "",
      funnel: url.searchParams.get("funnel") || undefined,
      preview: url.searchParams.get("preview") || undefined,
    });

    const wantsPreview = q.preview === "1";
    const adminUser = wantsPreview ? await getAdminUserFromRequest(req) : null;
    const useDraft = wantsPreview && !!adminUser;

    if (q.pathname.startsWith("/adwall/")) {
      const parts = q.pathname.split("/").filter(Boolean);
      const routePrefix = parts[1];
      const adwallType = parts[2];
      if (!routePrefix || !adwallType) return NextResponse.json({ navbar: null }, { status: 200 });

      const adwall = await getPublishedAdwallConfig(routePrefix, adwallType, { useDraft });
      if (!adwall) return NextResponse.json({ navbar: null }, { status: 200 });

      const navbar =
        adwall.navbar ||
        (adwall.funnelId ? (await getPublishedFunnelConfig(adwall.funnelId, { useDraft }))?.navbar : null);
      return NextResponse.json({ navbar: navbar || null }, { status: 200 });
    }

    if (q.pathname === "/form" || q.pathname.startsWith("/form/")) {
      const funnel = await getPublishedFunnelConfig(q.funnel || null, { useDraft });
      return NextResponse.json({ navbar: funnel?.navbar || null }, { status: 200 });
    }

    return NextResponse.json({ navbar: null }, { status: 200 });
  } catch {
    return NextResponse.json({ navbar: null }, { status: 200 });
  }
}

