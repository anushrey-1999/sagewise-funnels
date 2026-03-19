"use client";

import { Logo } from "./Logo";
import { Phone } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { getFunnelConfig } from "@/lib/funnel-loader";
import { getAdwallConfig } from "@/lib/adwall-loader";
import { getDemoAdwallConfig } from "@/lib/demo-adwall-loader";
import AdvertiserDisclosure from "@/components/AdvertiserDisclosure";

function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  // If user passed "+1..." keep it; else strip to digits and add "+" when it's clearly a country code format.
  if (digits.startsWith("+")) return `tel:${digits}`;
  const onlyDigits = phone.replace(/[^\d]/g, "");
  if (onlyDigits.length === 11 && onlyDigits.startsWith("1")) return `tel:+${onlyDigits}`;
  return `tel:${onlyDigits}`;
}

export function Navbar() {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();

  // Determine which config applies for the current route and read optional navbar data.
  const funnelIdFromQuery = searchParams.get("funnel");
  let navbar: { tagline?: string; phone?: string } | undefined;

  if (pathname.startsWith("/adwall/")) {
    const parts = pathname.split("/").filter(Boolean);
    const isDemoAdwall = parts[1] === "demo";
    const routeFunnel = isDemoAdwall ? parts[2] : parts[1];
    const adwallType = isDemoAdwall ? parts[3] : parts[2];

    if (routeFunnel && adwallType) {
      const adwallConfig = isDemoAdwall
        ? getDemoAdwallConfig(routeFunnel, adwallType)
        : getAdwallConfig(routeFunnel, adwallType);
      // Prefer adwall-specific navbar settings; fallback to the funnel's navbar settings
      navbar =
        adwallConfig?.navbar ||
        (adwallConfig?.funnelId ? getFunnelConfig(adwallConfig.funnelId)?.navbar : undefined);
    }
  } else if (pathname === "/form" || pathname.startsWith("/form/")) {
    navbar = getFunnelConfig(funnelIdFromQuery)?.navbar;
  }

  return (
    <div className="bg-[#204c4b] grid grid-cols-1 sm:grid-cols-3 items-center px-6 sm:px-6 py-3 sm:py-4 md:p-6 w-full relative gap-1 sm:gap-0">
      {/* <Button
        variant="ghost"
        size="icon"
        className="bg-white/10 border border-white/10 hover:bg-white/20 h-10 w-10 shrink-0 absolute left-6 sm:absolute sm:left-6 lg:relative lg:left-0 z-10"
      >
        <Menu className="h-4 w-4 text-white" />
      </Button> */}
      <div className="shrink-0 flex justify-center sm:justify-start items-center sm:justify-self-start">
        <Logo color="white" href="https://sagewise.net/" />
      </div>
      <div className="justify-self-center text-center">
        <AdvertiserDisclosure
          placement="bottom"
          align="center"
          triggerClassName="text-[11px] sm:text-[11px] text-white/90 hover:text-white"
          popoverBodyClassName="text-xs"
        />
      </div>

      <div className="flex flex-col items-center sm:items-end text-center sm:text-right gap-0.5 sm:justify-self-end">
        {navbar?.tagline && (
          <div className="hidden sm:block text-xs sm:text-sm opacity-90 leading-tight text-white">
            {navbar.tagline}
          </div>
        )}
        {navbar?.phone && (
          <a
            href={toTelHref(navbar.phone)}
            className="flex items-center gap-2 font-semibold text-sm sm:text-base hover:underline underline-offset-4 text-white"
            aria-label={`Call ${navbar.phone}`}
          >
            <Phone className="h-4 w-4 sm:h-4 sm:w-4 text-white" />
            <span>{navbar.phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}

