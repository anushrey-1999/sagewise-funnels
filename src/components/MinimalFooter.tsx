"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Licenses & Disclosures", href: "https://sagewise.net/licenses-disclosures/" },
  { label: "Privacy Policy", href: "https://sagewise.net/privacy-policy/" },
  { label: "Terms of Use", href: "https://sagewise.net/terms-of-use/" },
  { label: "Unsubscribe", href: "https://sagewise.net/unsubscribe/" },
];

const MinimalFooter = () => {
  return (
    <div className="w-full bg-white border-t border-general-border py-4 px-4">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-gray-500">
        <span className="font-medium text-gray-700">Sagewise&reg;</span>
        {FOOTER_LINKS.map((link) => (
          <>
            <span aria-hidden>|</span>
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-800 transition-colors"
            >
              {link.label}
            </Link>
          </>
        ))}
      </div>
    </div>
  );
};

export default MinimalFooter;
