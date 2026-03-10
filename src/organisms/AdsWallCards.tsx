import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Lock, MoveUpRight, Phone, Rocket, Trophy, Type } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import React from "react";

function sanitizeCardHtml(html: string): string {
  // Funnel/adwall JSON is controlled content; this is defensive, not a full HTML sanitizer.
  // Keep deterministic transforms to avoid any hydration mismatch surprises.
  let out = html;

  // Remove script/style blocks entirely
  out = out.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "");

  // Strip event handlers everywhere
  out = out.replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Neutralize javascript: URLs in href/src attrs
  out = out.replace(
    /\b(href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (_m, attr, v1, v2, v3) => {
      const val = String(v1 || v2 || v3 || "").trim();
      if (val.toLowerCase().startsWith("javascript:")) return `${attr}=""`;
      // Rebuild using double quotes for consistency
      return `${attr}="${val}"`;
    }
  );

  return out;
}

function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  const onlyDigits = phone.replace(/[^\d]/g, "");
  if (onlyDigits.length === 11 && onlyDigits.startsWith("1")) return `tel:+${onlyDigits}`;
  return `tel:${onlyDigits}`;
}

interface AdsWallCardsProps {
  ratings?: number;
  cardBg?: string;
  isGradientBorder?: boolean;
  isBadge?: boolean;
  isSecondaryBtn?: boolean;
  isGradientBox?: boolean;
  isDifferentBorder?: boolean; // Golden border for special cards
  badgeIcon?: React.ReactNode; // Accepts HTML/JSX content
  badgeText?: React.ReactNode; // Accepts HTML/JSX content
  heading: string;
  description: string;
  features: string[];
  buttonLink: string;
  buttonText: string;
  ratingsNumber: string;
  ratingsCount: number;
  logo: string;
  creditCardImage: string;
  logoWidth: string;
  logoHeight: string;
  logoText?: string;
  logoSubtext?: string;
  advertiserName: string;
  affiliateId?: string | null;
  transactionId?: string | null;
  phoneNumber?: string;
  /** Optional extra query params for CTA link (e.g. sub3 for cc-finbuzz) */
  extraTrackingParams?: Record<string, string>;
  ctaMinWidthPx?: number;
  /** Optional bottom callout box content rendered as HTML. */
  bottomBoxHtml?: string;
}

const AdsWallCards = ({
  ratings,
  cardBg = "bg-white",
  isGradientBorder,
  isBadge = false,
  isSecondaryBtn = true,
  isGradientBox = false,
  isDifferentBorder = false,
  badgeIcon,
  badgeText,
  heading,
  description,
  features,
  buttonLink,
  buttonText,
  ratingsNumber,
  creditCardImage,
  ratingsCount,
  logo,
  logoWidth,
  logoHeight,
  logoText,
  logoSubtext,
  advertiserName,
  affiliateId,
  transactionId,
  phoneNumber,
  extraTrackingParams,
  ctaMinWidthPx,
  bottomBoxHtml,
}: AdsWallCardsProps) => {
  const affiliateParamName = "sub4";
  const transactionParamName = "sub5";
  const hasBadgeText =
    typeof badgeText === "string" ? badgeText.trim().length > 0 : Boolean(badgeText);

  // Append tracking params to outbound offer link
  const handleButtonClick = () => {
    try {
      const url = new URL(buttonLink);
      
      if (affiliateId) {
        url.searchParams.set(affiliateParamName, affiliateId);
      }
      if (transactionId) {
        url.searchParams.set(transactionParamName, transactionId);
      }
      if (extraTrackingParams) {
        Object.entries(extraTrackingParams).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }
      
      window.open(url.toString(), "_blank");
    } catch {
      // If buttonLink is not a valid absolute URL, append params manually
      const separator = buttonLink.includes("?") ? "&" : "?";
      const params: string[] = [];
      
      if (affiliateId) {
        params.push(`${affiliateParamName}=${encodeURIComponent(affiliateId)}`);
      }
      if (transactionId) {
        params.push(`${transactionParamName}=${encodeURIComponent(transactionId)}`);
      }
      if (extraTrackingParams) {
        Object.entries(extraTrackingParams).forEach(([key, value]) => {
          params.push(`${key}=${encodeURIComponent(value)}`);
        });
      }
      
      const finalUrl = params.length > 0 
        ? `${buttonLink}${separator}${params.join("&")}`
        : buttonLink;
      
      window.open(finalUrl, "_blank");
    }
  };
  // Card content (shared between gradient and non-gradient borders)
  const cardContent = (
    <div className="relative flex flex-col w-full gap-4">
      <div className="h-8">
        {hasBadgeText ? (
          <div className="h-full text-xs font-medium px-2 bg-green-700 flex items-center gap-1.5 uppercase rounded-tl-xl rounded-br-xl w-fit text-white whitespace-nowrap">
            {badgeIcon ? (
              <div className="w-4 h-4 lg:w-4 lg:h-4 relative">
                <Image src={`/icons/${badgeIcon}.svg`} alt="badge-icon" layout="fill" />
              </div>
            ) : null}
            {badgeText}
          </div>
        ) : (
          <div className="h-full" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-col lg:flex-row justify-between w-full items-start px-4 pb-4 gap-6">
        {/* First Container */}
        <div className="flex flex-col items-center justify-center gap-3 shrink-0 self-stretch">
          {logo ? (
            <div className="flex flex-col items-center w-[110px]">
              <div
                className="relative overflow-hidden flex items-center justify-center"
                style={{ width: logoWidth, height: logoHeight }}
              >
                <Image
                  src={logo}
                  alt="logo"
                  layout="fill"
                  className="object-contain"
                />
              </div>
              {logoText && (
                <Typography
                  variant="p"
                  className="text-[10px] text-center mt-1 w-full"
                  color="text-general-muted-foreground"
                >
                  {logoText}
                </Typography>
              )}
              {logoSubtext && (
                <Typography
                  variant="p"
                  className="text-[10px] text-center mt-0.5 w-full"
                  color="text-general-muted-foreground"
                >
                  {logoSubtext}
                </Typography>
              )}
            </div>
          ) : (
            <div className="w-46 h-30 lg:w-30 lg:h-18 relative overflow-hidden rounded-sm">
              <Image src={creditCardImage} alt="credit-card" layout="fill" />
            </div>
          )}
        </div>

        {/* Second Container */}
        <div className="flex flex-col gap-2 flex-1 h-full">
          <Typography
            variant="h4"
            color="text-primary-main text-xl"
            dangerouslySetInnerHTML={{ __html: heading }}
          />
          <Typography
            variant="p"
            className="text-sm font-bold"
            dangerouslySetInnerHTML={{ __html: description }}
          />
          <Typography variant="ul" className="">
            <ul className="list-disc text-left lg:ml-0 text-sm flex flex-col gap-1">
              {features.map((feature, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: feature }} />
              ))}
            </ul>
          </Typography>
        </div>

        {/* Third Container */}
        <div className=" rounded-md flex justify-between items-center lg:justify-start lg:flex-col gap-3 lg:min-w-[200px] w-full lg:w-fit shrink-0">
          {/* {isGradientBox && (
          <div className="rounded-md overflow-hidden flex lg:flex-col w-full border border-general-border">
            <div className="bg-linear-to-r from-green-700 to-[#2C9D56] pb-1 lg:py-3.5 flex items-center justify-center flex-col w-1/2 lg:w-full rounded-md">
              <Typography variant="h3" color="text-white" className="text-2xl">
                AA++
              </Typography>
              <Typography variant="monospaced" color="text-white" className="text-sm lg:text-base">
                SUPERIOR
              </Typography>
            </div>
            <div className="rounded-br-lg rounded-bl-lg py-2.5 px-1 lg:pt-1 lg:pb-2 flex flex-col items-center justify-center w-1/2 lg:w-full">
              <Typography variant="p" size="text-xs" className="font-medium">
                A.M. Best Rating
              </Typography>
              <Typography variant="p" size="text-xs" className="font-medium">
                (as of 8/1/25)
              </Typography>
            </div>
          </div>
        )} */}

          <div className="flex gap-2 items-center lg:items-end justify-center shrink-0">
            <Typography
              variant="h3"
              color="text-black"
              className="text-xl lg:text-3xl leading-none"
            >
              {ratingsNumber}
            </Typography>
            <div className="flex flex-col gap-0.5">
              <div className="flex gap-1 justify-center items-center ">
                {Array.from({ length: ratingsCount || 5 }, (_, index) => (
                  <Image
                    key={index}
                    src={"/star.svg"}
                    alt="star"
                    width={100}
                    height={100}
                    className="w-3 h-3"
                  />
                ))}
              </div>
              <Typography variant="p" className="text-xs">
                User Ratings
              </Typography>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <Button
              variant="secondary"
              size="sm"
              className="lg:w-full font-semibold"
              onClick={handleButtonClick}
              icon={MoveUpRight}
              iconClass="w-3 h-3 lg:w-3.5 lg:h-3.5"
            >
              {buttonText}
            </Button>
            <Typography
              variant="p"
              className="text-[10px] text-center flex items-center gap-1"
              color="text-general-muted-foreground"
            >
              on {advertiserName} secure site <Lock className="w-3 h-3 lg:w-3 lg:h-3" />
            </Typography>
            {phoneNumber ? (
              <a
                href={toTelHref(phoneNumber)}
                className="mt-1 text-xs font-semibold hover:underline underline-offset-4 flex items-center gap-1 text-general-muted-foreground"
                aria-label={`Call ${phoneNumber}`}
              >
                <Phone className="w-3 h-3" />
                <span>{phoneNumber}</span>
              </a>
            ) : null}
          </div>
          {/* {isSecondaryBtn && (
            <Button variant="outline" size="lg" icon={Phone} className="w-full">
              1-833-906-2737
            </Button>
          )} */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full">
      {/* {isGradientBorder ? (
        <div className="p-[2px] rounded-xl bg-linear-to-r from-primary-main via-[#D3FCFB] to-[#357F7D] w-full">
          <div
            className={cn(
              "rounded-xl z-1 relative p-4 lg:p-6 w-full flex flex-col lg:flex-row justify-between gap-6 lg:gap-11",
              cardBg
            )}
          >
            {cardContent}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 z-1 relative border-general-border rounded-xl p-4 lg:p-6 w-full flex flex-col lg:flex-row justify-between gap-6 lg:gap-11",
            cardBg
          )}
        >
          {cardContent}
        </div>
      )} */}

      <div
        className={cn(
          "border-2 z-1 relative rounded-xl w-full flex flex-col ",
          isDifferentBorder 
            ? "border-[#ffd32a]" // Golden border using CTA primary color
            : "border-general-border", // Default border
          cardBg
        )}
      >
        {cardContent}
        {bottomBoxHtml ? (
          <div className="pb-5 pt-3 px-4">
            <div
              className="bg-[#F4F5F8] p-2.5 text-xs leading-relaxed text-general-muted-foreground [&_a]:text-primary-main [&_a]:underline [&_a]:underline-offset-2"
              dangerouslySetInnerHTML={{ __html: sanitizeCardHtml(bottomBoxHtml) }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdsWallCards;
