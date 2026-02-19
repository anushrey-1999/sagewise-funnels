"use client";

import { Logo } from "./Logo";
import { Phone } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const hide = pathname.startsWith("/admin");

  const funnelIdFromQuery = searchParams.get("funnel");
  const preview = searchParams.get("preview");
  const [navbar, setNavbar] = useState<{ tagline?: string; phone?: string } | null>(null);

  useEffect(() => {
    if (hide) return;
    const controller = new AbortController();
    const url = new URL("/api/navbar", window.location.origin);
    url.searchParams.set("pathname", pathname);
    if (funnelIdFromQuery) url.searchParams.set("funnel", funnelIdFromQuery);
    if (preview === "1") url.searchParams.set("preview", "1");

    fetch(url.toString(), { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.navbar) setNavbar(data.navbar);
        else setNavbar(null);
      })
      .catch(() => {
        // Non-blocking; keep navbar hidden if it fails.
        setNavbar(null);
      });

    return () => controller.abort();
  }, [pathname, funnelIdFromQuery, preview, hide]);

  if (hide) return null;
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
        <Logo color="white" href="https://sagewise.net/" />
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

