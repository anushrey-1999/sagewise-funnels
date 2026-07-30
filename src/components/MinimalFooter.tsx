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
  { label: "YouTube", href: "https://www.youtube.com/", Icon: Youtube },
  { label: "Instagram", href: "https://www.instagram.com/", Icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/", Icon: Facebook },
];

const MinimalFooter = () => {
  return (
    <footer className="w-full bg-white border-t border-general-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-0 py-4">
        <div id="minimal-footer-slot" className="w-full empty:hidden mb-4" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo href="https://sagewise.net/" color="primary" width={129} height={28} className="shrink-0" />

          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[12px] text-aw-muted">
            {FOOTER_LINKS.map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 ? <span aria-hidden className="text-aw-divider">|</span> : null}
                <Link
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-aw-ink-deep transition-colors"
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
                className="h-9 w-9 rounded-full border border-general-border flex items-center justify-center text-aw-muted hover:text-aw-ink-deep hover:bg-[#FAFAF7] transition-colors"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MinimalFooter;
