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

export function Navbar({ scope = "global" }: { scope?: "global" | "modal" }) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const funnelIdFromQuery = searchParams.get("funnel");
  const preview = searchParams.get("preview");
  const [navbar, setNavbar] = useState<NavbarConfig>(null);
  const isAdwallRoute = pathname.startsWith("/adwall/");
  const isFormRoute = pathname === "/form" || pathname.startsWith("/form/");

  useEffect(() => {
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
  }, [funnelIdFromQuery, isAdwallRoute, pathname, preview]);

  useEffect(() => {
    if (preview !== "1") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "sagewise-preview-refresh" || !event.newValue) return;
      window.location.reload();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [preview]);

  return (
    <div className="w-full" data-navbar-scope={scope}>
      {isAdwallRoute && (
        <div className="w-full bg-aw-canvas border-b border-aw-divider">
          <div className="max-w-[var(--container-max)] mx-auto px-5 py-2 sm:px-6 sm:py-2.5">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] sm:text-xs text-aw-muted text-center">
              <span>
                The listings featured on this site are from companies from which this site receives compensation.
              </span>
              <AdvertiserDisclosure
                placement="bottom"
                align="right"
                triggerClassName="text-primary-main font-semibold underline underline-offset-2 hover:opacity-80 whitespace-nowrap"
                popoverBodyClassName="text-xs"
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-sg-primary w-full">
        <div className="max-w-[var(--container-max)] mx-auto flex items-center justify-between px-6 py-3 sm:py-4 w-full relative gap-4">
          {/* <Button
          variant="ghost"
          size="icon"
          className="bg-white/10 border border-white/10 hover:bg-white/20 h-10 w-10 shrink-0 absolute left-6 sm:absolute sm:left-6 lg:relative lg:left-0 z-10"
        >
          <Menu className="h-4 w-4 text-white" />
        </Button> */}
          <div className="shrink-0 flex justify-center sm:justify-start items-center">
            <Logo
              color="white"
              href="https://sagewise.net/"
              width={169}
              height={35}
              imgClassName="h-[29px] w-[140px] sm:h-[35px] sm:w-[169px]"
            />
          </div>

          <div className="ml-auto flex items-center justify-end gap-4 sm:gap-6">
            {scope === "modal" ? (
              <AdvertiserDisclosure
                placement="bottom"
                align="right"
                triggerClassName="text-white/90 font-medium text-sm hover:text-white whitespace-nowrap"
                popoverBodyClassName="text-xs"
              />
            ) : (navbar?.tagline || navbar?.phone) ? (
              <div className="flex flex-col items-end text-right gap-0.5">
                {navbar?.tagline && (
                  <div className="hidden sm:block text-xs sm:text-sm opacity-90 leading-tight text-white">
                    {navbar.tagline}
                  </div>
                )}
                {navbar?.phone && (
                  <a
                    href={toTelHref(navbar.phone)}
                    className="flex items-center gap-2 font-semibold text-sm sm:text-base hover:underline underline-offset-4 text-white whitespace-nowrap"
                    aria-label={`Call ${navbar.phone}`}
                  >
                    <Phone className="h-4 w-4 sm:h-4 sm:w-4 text-white" />
                    <span>{navbar.phone}</span>
                  </a>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

