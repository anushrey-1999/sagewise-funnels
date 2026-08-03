"use client";

import { Fragment } from "react";
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { Logo } from "@/components/Logo";

const FOOTER_LINKS = [
  { label: "Licenses & Disclosures", href: "https://sagewise.net/licenses-disclosures/" },
  { label: "Privacy Policy", href: "https://sagewise.net/privacy-policy/" },
  { label: "Terms of Use", href: "https://sagewise.net/terms-of-use/" },
  { label: "Unsubscribe", href: "https://sagewise.net/unsubscribe/" },
];

const SOCIAL_LINKS = [
  { label: "YouTube", href: "https://www.youtube.com/@SagewiseSocials", Icon: Youtube },
  { label: "Instagram", href: "https://www.instagram.com/sagewise_official/", Icon: Instagram },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Sagewise/61584041683677/",
    Icon: Facebook,
  },
];

const MinimalFooter = () => {
  return (
    <footer className="w-full bg-white border-t border-general-border" data-footer-scope="global">
      <div className="max-w-[var(--container-max)] mx-auto py-4">
        {/* Keep disclosures padding unchanged on mobile */}
        <div className="px-4 sm:px-0">
          <div id="minimal-footer-slot" className="w-full empty:hidden mb-4 sm:mb-4" />
        </div>

        {/* Reduce only footer content padding on mobile */}
        <div className="px-1 sm:px-0">
          <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center">
          {/* Desktop logo column */}
          <div className="hidden sm:flex items-center justify-start flex-wrap gap-x-4 gap-y-2">
            <Logo
              href="https://sagewise.net/"
              color="primary"
              width={129}
              height={28}
              className="shrink-0"
            />
          </div>

          {/* Links: mobile has leaf mark inline; desktop stays centered column */}
          <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[10px] sm:text-[12px] text-primary-dark">
            <Logo
              href="https://sagewise.net/"
              type="logomark"
              width={14}
              height={22}
              className="shrink-0 sm:hidden"
            />
            {FOOTER_LINKS.map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 ? <span aria-hidden className="text-aw-divider">|</span> : null}
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                >
                  {link.label}
                </Link>
              </Fragment>
            ))}
          </nav>

          <div className="flex items-center justify-center sm:justify-end gap-2">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="h-9 w-9 rounded-full bg-aw-canvas flex items-center justify-center text-aw-muted hover:text-aw-ink-deep hover:bg-aw-divider transition-colors focus-visible:ring-0 focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring-neutral)]"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MinimalFooter;
