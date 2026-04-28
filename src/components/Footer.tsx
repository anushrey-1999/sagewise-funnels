import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Licenses & Disclosures", href: "https://sagewise.net/licenses-disclosures/" },
  { label: "Privacy Policy", href: "https://sagewise.net/privacy-policy/" },
  { label: "Terms of Use", href: "https://sagewise.net/terms-of-use/" },
  { label: "Unsubscribe", href: "https://sagewise.net/unsubscribe/" },
];

export function Footer() {
  return (
    <div className="w-full bg-sg-funnel-header py-4 px-4">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-white/60">
        <span className="font-medium text-white/80">Sagewise&reg;</span>
        {FOOTER_LINKS.map((link) => (
          <>
            <span aria-hidden>|</span>
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </>
        ))}
      </div>
    </div>
  );
}
