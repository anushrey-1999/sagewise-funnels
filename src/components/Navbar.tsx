"use client";

import { Logo } from "./Logo";
import { Phone } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type NavbarConfig = {
  tagline?: string;
  phone?: string;
} | null;

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
  const [navbar, setNavbar] = useState<NavbarConfig>(null);

  const funnelIdFromQuery = searchParams.get("funnel");
  const preview = searchParams.get("preview");

  useEffect(() => {
    const isAdwallRoute = pathname.startsWith("/adwall/");
    const isFormRoute = pathname === "/form" || pathname.startsWith("/form/");

    if (!isAdwallRoute && !isFormRoute) {
      setNavbar(null);
      return;
    }

    const params = new URLSearchParams({ pathname });
    if (funnelIdFromQuery) params.set("funnel", funnelIdFromQuery);
    if (preview === "1") params.set("preview", "1");

    const controller = new AbortController();
    setNavbar(null);

    async function loadNavbar() {
      try {
        const response = await fetch(`/api/navbar?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load navbar");
        }

        const data = (await response.json()) as { navbar?: NavbarConfig };
        if (!controller.signal.aborted) {
          setNavbar(data.navbar ?? null);
        }
      } catch {
        if (!controller.signal.aborted) {
          setNavbar(null);
        }
      }
    }

    void loadNavbar();

    return () => controller.abort();
  }, [funnelIdFromQuery, pathname, preview]);

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

