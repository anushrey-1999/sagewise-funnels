"use client";

import { Logo } from "./Logo";
import { Phone } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { getFunnelConfig } from "@/lib/funnel-loader";
import { getAdwallConfig } from "@/lib/adwall-loader";

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
    const parts = pathname.split("/").filter(Boolean); // ["adwall", "{funnel}", "{type}", ...]
    const routeFunnel = parts[1];
    const adwallType = parts[2];
    if (routeFunnel && adwallType) {
      const adwallConfig = getAdwallConfig(routeFunnel, adwallType);
      // Prefer adwall-specific navbar settings; fallback to the funnel's navbar settings
      navbar =
        adwallConfig?.navbar ||
        (adwallConfig?.funnelId ? getFunnelConfig(adwallConfig.funnelId)?.navbar : undefined);
    }
  } else if (pathname === "/form" || pathname.startsWith("/form/")) {
    navbar = getFunnelConfig(funnelIdFromQuery)?.navbar;
  }

  return (
    <div className="bg-[#204c4b] flex items-center justify-between px-6 sm:px-6 py-3 sm:py-4 md:p-6 w-full relative">
      {/* <Button
        variant="ghost"
        size="icon"
        className="bg-white/10 border border-white/10 hover:bg-white/20 h-10 w-10 shrink-0 absolute left-6 sm:absolute sm:left-6 lg:relative lg:left-0 z-10"
      >
        <Menu className="h-4 w-4 text-white" />
      </Button> */}
      <div className="shrink-0 flex justify-center lg:justify-start items-center">
        <Logo color="white" />
      </div>
      {(navbar?.tagline || navbar?.phone) && (
        <div className="flex flex-col items-end text-white text-right gap-0.5">
          {navbar?.tagline && (
            <div className="hidden sm:block text-xs sm:text-sm opacity-90 leading-tight">
              {navbar.tagline}
            </div>
          )}
          {navbar?.phone && (
            <a
              href={toTelHref(navbar.phone)}
              className="flex items-center gap-2 font-semibold text-sm sm:text-base hover:underline underline-offset-4"
              aria-label={`Call ${navbar.phone}`}
            >
              <Phone className="h-4 w-4 sm:h-4 sm:w-4 text-white" />
              <span>{navbar.phone}</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

