"use client";

import { Logo } from "./Logo";
import { Phone } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AdvertiserDisclosure from "@/components/AdvertiserDisclosure";

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
  const funnelIdFromQuery = searchParams.get("funnel");
  const preview = searchParams.get("preview");
  const [navbar, setNavbar] = useState<NavbarConfig>(null);

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

