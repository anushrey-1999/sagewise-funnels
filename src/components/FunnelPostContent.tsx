"use client";

import { useState } from "react";
import type { FormConfig } from "@/types/form";
import {
  ArrowRight,
  BadgeDollarSign,
  Camera,
  Car,
  ChevronDown,
  Clock,
  DollarSign,
  FileText,
  Lightbulb,
  PhoneCall,
  ShieldCheck,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

type PostContent = NonNullable<FormConfig["postContent"]>;

const ICONS: Record<string, LucideIcon> = {
  ArrowRight,
  BadgeDollarSign,
  Camera,
  Car,
  Clock,
  DollarSign,
  FileText,
  Lightbulb,
  PhoneCall,
  ShieldCheck,
  Target,
  Trophy,
  Zap,
};

function sanitizeHtml(html: string): string {
  // IMPORTANT: This must be deterministic across SSR and client to avoid hydration mismatches.
  // Keep a very small allowlist of tags and rebuild allowed attributes.
  // NOTE: Funnel JSON is controlled content; this is defensive, not a full HTML sanitizer.
  let out = html;

  // Remove script/style blocks entirely
  out = out.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");

  // Remove tags that aren't in the allowlist (keep their text content)
  out = out.replace(
    /<\/?(?!strong\b|em\b|a\b|br\b|sup\b)[a-z0-9:-]+(?:\s[^>]*)?>/gi,
    ""
  );

  // Strip event handlers and style attrs everywhere
  out = out.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  out = out.replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Normalize allowed tags' attributes: allow only a small set.
  out = out.replace(/<\s*a\b([^>]*)>/gi, (_m, attrs) => {
    const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const targetMatch = attrs.match(/\btarget\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const relMatch = attrs.match(/\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const scrollTopMatch = attrs.match(/\bdata-scroll-top\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);

    const getVal = (match: RegExpMatchArray | null) =>
      (match?.[1] || match?.[2] || match?.[3] || "").trim();

    const href = getVal(hrefMatch);
    const safeHref = href && !href.toLowerCase().startsWith("javascript:") ? href : "";
    const target = getVal(targetMatch);
    const rel = getVal(relMatch) || "noopener noreferrer";
    const dataScrollTop = getVal(scrollTopMatch);

    const parts: string[] = [];
    if (safeHref) parts.push(`href="${safeHref}"`);
    if (target) parts.push(`target="${target}"`);
    if (rel) parts.push(`rel="${rel}"`);
    if (dataScrollTop) parts.push(`data-scroll-top="${dataScrollTop}"`);

    return `<a${parts.length ? " " + parts.join(" ") : ""}>`;
  });

  out = out.replace(/<\s*strong\b([^>]*)>/gi, (_m, attrs) => {
    const accentMatch = attrs.match(/\bdata-accent\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const getVal = (match: RegExpMatchArray | null) =>
      (match?.[1] || match?.[2] || match?.[3] || "").trim();
    const dataAccent = getVal(accentMatch);
    return dataAccent ? `<strong data-accent="${dataAccent}">` : "<strong>";
  });

  // Ensure <br> is well-formed
  out = out.replace(/<\s*br\s*>/gi, "<br />");
  return out;
}

function Html({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className}
      onClick={(e) => {
        const target = e.target as HTMLElement | null;
        const anchor = target?.closest?.("a[data-scroll-top='true']") as HTMLAnchorElement | null;
        if (!anchor) return;
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}

function Icon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const Ico = ICONS[name];
  if (!Ico) return null;
  return <Ico className={className} aria-hidden />;
}

function ArrowBullet({ className }: { className?: string }) {
  return <ArrowRight className={className} aria-hidden />;
}

export function FunnelPostContent({ postContent }: { postContent?: PostContent }) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  if (!postContent) return null;

  const { details, faqs, bottomLine } = postContent;
  const hasAny = Boolean(details?.blocks?.length || faqs?.items?.length || bottomLine);
  if (!hasAny) return null;

  const renderDetailBlock = (block: NonNullable<PostContent["details"]>["blocks"][number], key: number) => {
    switch (block.type) {
      case "h2":
        return (
          <h2 key={key} className="text-[30px] leading-[150%] font-semibold text-general-foreground mb-4">
            {block.text}
          </h2>
        );
      case "h3":
        return (
          <h3 key={key} className="text-[16px] sm:text-[24px] font-semibold text-general-foreground mb-4">
            {block.text}
          </h3>
        );
      case "pHtml":
        return (
          <Html
            key={key}
            html={block.html}
            className="text-[14px] sm:text-base text-general-foreground leading-[150%] [&_strong[data-accent='true']]:text-[#204C4B] [&_strong[data-accent='true']]:font-semibold"
          />
        );
      case "iconList":
        return (
          <div key={key} className="space-y-3">
            {block.items.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Icon name={item.icon} className="h-5 w-5 text-[#8FA5A5] mt-0.5 shrink-0" />
                <Html
                  html={item.textHtml}
                  className="text-[14px] sm:text-base text-general-foreground leading-[150%]"
                />
              </div>
            ))}
          </div>
        );
      case "bulletsHtml":
        return (
          <div key={key} className="space-y-2">
            {block.itemsHtml.map((it, i) => (
              <div key={i} className="flex gap-2 items-start">
                <ArrowBullet className="h-4 w-4 mt-1 shrink-0 text-[#8FA5A5]" />
                <div className="text-[14px] sm:text-base text-general-foreground leading-[150%]">
                  <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(it) }} />
                </div>
              </div>
            ))}
          </div>
        );
      case "definitionListHtml":
        return (
          <div key={key} className="space-y-2">
            {block.items.map((it, i) => (
              <div key={i} className="flex gap-2 items-start">
                <ArrowBullet className="h-4 w-4 mt-1 shrink-0 text-[#8FA5A5]" />
                <div className="text-[14px] sm:text-base text-general-foreground leading-[150%]">
                  <span className="font-semibold">{it.term}:</span>{" "}
                  <span
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(it.html) }}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      case "numberedHtml":
        return (
          <ol key={key} className="space-y-2 pl-5 list-decimal">
            {block.itemsHtml.map((it, i) => (
              <li key={i} className="text-[14px] sm:text-base text-general-foreground leading-[150%]">
                <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(it) }} />
              </li>
            ))}
          </ol>
        );
      case "steps":
        return (
          <div key={key} className="space-y-3">
            {block.items.map((it, i) => (
              <div key={i} className="flex gap-3 items-start">
                <Icon name={it.icon} className="h-5 w-5 text-[#8FA5A5] mt-0.5 shrink-0" />
                <Html
                  html={it.textHtml}
                  className="text-[14px] sm:text-[15px] text-general-foreground leading-relaxed"
                />
              </div>
            ))}
          </div>
        );
      case "calloutHtml":
        return (
          <div
            key={key}
            className="flex gap-3 items-start rounded-lg bg-[#f5f5f5] px-4 py-3"
          >
            <Icon name={block.icon} className="h-5 w-5 text-[#8FA5A5] mt-0.5 shrink-0" />
            <Html
              html={block.html}
              className="text-[14px] sm:text-[15px] text-general-muted-foreground leading-relaxed"
            />
          </div>
        );
      case "textRow":
        return (
          <div key={key} className="flex gap-2 items-start text-[14px] sm:text-base text-general-foreground leading-[150%]">
            <Icon name={block.icon} className="h-4 w-4 mt-1 shrink-0 text-[#8FA5A5]" />
            <span>
              {block.text}{" "}
              {block.linkText && block.href ? (
                <a
                  href={block.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {block.linkText}
                </a>
              ) : (
                <span className="font-semibold">{block.linkText || ""}</span>
              )}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[890px] mx-auto px-6 md:px-0 pt-6 pb-10 space-y-10">
      {details?.blocks?.length ? (
        <section>
          {(() => {
            type DetailBlock = NonNullable<PostContent["details"]>["blocks"][number];
            type Group = { heading?: DetailBlock; blocks: DetailBlock[] };

            const groups: Group[] = [];
            let current: Group | null = null;

            for (const b of details.blocks) {
              const isHeading = b.type === "h2" || b.type === "h3";
              if (isHeading) {
                if (current) groups.push(current);
                current = { heading: b, blocks: [] };
              } else {
                if (!current) current = { blocks: [] };
                current.blocks.push(b);
              }
            }
            if (current) groups.push(current);

            return (
              <div className="space-y-9">
                {groups.map((g, groupIdx) => (
                  <div key={groupIdx}>
                    {g.heading ? renderDetailBlock(g.heading, -1) : null}
                    {g.blocks.length ? (
                      <div className="space-y-4">
                        {g.blocks.map((b, i) => renderDetailBlock(b, i))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            );
          })()}
        </section>
      ) : null}

      {faqs?.items?.length ? (
        <section className="space-y-4">
          <h3 className="text-[24px] font-semibold text-black">
            {faqs.heading}
          </h3>

          <div className="w-full">
            {faqs.items.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="border-b border-[#e5e5e5]">
                  <button
                    type="button"
                    className="w-full text-left cursor-pointer py-4 flex items-center justify-between gap-4"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex((prev) => (prev === idx ? null : idx))}
                  >
                    <span className="text-[14px] sm:text-base font-medium text-black">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#8FA5A5] transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>

                  {isOpen ? (
                    <div
                      className="pb-4 pt-0 space-y-3 cursor-pointer"
                      onClick={() => setOpenFaqIndex(null)}
                      role="region"
                      aria-label={`Answer: ${item.q}`}
                    >
                      {item.aBlocks.map((b, i) => {
                        switch (b.type) {
                          case "p":
                            return (
                              <p key={i} className="text-[14px] sm:text-base text-general-foreground leading-relaxed">
                                {b.text}
                              </p>
                            );
                          case "bullets":
                            return (
                              <div key={i} className="space-y-2">
                                {b.items.map((it, j) => (
                                  <div key={j} className="flex gap-2 items-start">
                                    <ArrowBullet className="h-4 w-4 mt-1 shrink-0 text-[#8FA5A5]" />
                                    <div className="text-[14px] sm:text-base text-general-foreground leading-relaxed">
                                      {it}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          case "split":
                            return (
                              <div key={i} className="space-y-2 text-[14px] sm:text-base text-foreground leading-relaxed">
                                <div>{b.left}</div>
                                <div>{b.right}</div>
                              </div>
                            );
                          default:
                            return null;
                        }
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {bottomLine ? (
        <section className="space-y-3">
          <h3 className="text-[24px] font-semibold text-general-foreground">
            {bottomLine.heading}
          </h3>
          <Html
            html={bottomLine.bodyHtml}
            className="text-[14px] sm:text-base text-general-foreground leading-relaxed [&_a[data-scroll-top='true']]:no-underline [&_a[data-scroll-top='true']]:cursor-pointer [&_strong[data-accent='true']]:text-[#204C4B] [&_strong[data-accent='true']]:font-semibold"
          />
        </section>
      ) : null}
    </div>
  );
}

