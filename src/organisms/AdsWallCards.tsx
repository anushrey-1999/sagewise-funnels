import { Button } from "@/components/ui/button";
import { MoveRight, Phone } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import React from "react";

function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  const onlyDigits = phone.replace(/[^\d]/g, "");
  if (onlyDigits.length === 11 && onlyDigits.startsWith("1")) return `tel:+${onlyDigits}`;
  return `tel:${onlyDigits}`;
}

function ScoreStar({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-[14px] w-[14px]", filled ? "text-[#F59E0B]" : "text-[#F59E0B]/45")}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.75l2.85 5.78 6.38.93-4.61 4.49 1.09 6.35L12 17.3l-5.71 3 1.09-6.35-4.61-4.49 6.38-.93L12 2.75z" />
    </svg>
  );
}

interface AdsWallCardsProps {
  ratings?: number;
  cardBg?: string;
  isGradientBorder?: boolean;
  isBadge?: boolean;
  isSecondaryBtn?: boolean;
  isGradientBox?: boolean;
  badgeIcon?: React.ReactNode;
  badgeText?: React.ReactNode;
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
  extraTrackingParams?: Record<string, string>;
  ctaMinWidthPx?: number;
  trustpilotReviews?: string;
  minCreditScore?: string;
  maxLoanAmount?: string;
  aprRange?: string;
  bottomBoxHtml?: string;
}

const AdsWallCards = ({
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
  affiliateId,
  transactionId,
  phoneNumber,
  extraTrackingParams,
  trustpilotReviews,
  bottomBoxHtml,
}: AdsWallCardsProps) => {
  const affiliateParamName = "sub4";
  const transactionParamName = "sub5";
  const mobileLogoWidthPx = 100;
  const desktopLogoWidthPx = 140;

  const displayReviews = trustpilotReviews?.trim() || null;
  const fullStars = Math.max(0, Math.min(5, Number.isFinite(ratingsCount) ? ratingsCount : 5));
  const parsedLogoWidth = Number.parseFloat(logoWidth);
  const parsedLogoHeight = Number.parseFloat(logoHeight);
  const getScaledLogoHeight = (targetWidth: number) =>
    Number.isFinite(parsedLogoWidth) && parsedLogoWidth > 0 && Number.isFinite(parsedLogoHeight) && parsedLogoHeight > 0
      ? Math.round(targetWidth * (parsedLogoHeight / parsedLogoWidth))
      : 48;
  const mobileLogoHeightPx = getScaledLogoHeight(mobileLogoWidthPx);
  const desktopLogoHeightPx = getScaledLogoHeight(desktopLogoWidthPx);

  const hasBadgeText =
    typeof badgeText === "string" ? badgeText.trim().length > 0 : Boolean(badgeText);

  const handleButtonClick = () => {
    try {
      const url = new URL(buttonLink);
      if (affiliateId) url.searchParams.set(affiliateParamName, affiliateId);
      if (transactionId) url.searchParams.set(transactionParamName, transactionId);
      if (extraTrackingParams) {
        Object.entries(extraTrackingParams).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }
      window.open(url.toString(), "_blank");
    } catch {
      const separator = buttonLink.includes("?") ? "&" : "?";
      const params: string[] = [];
      if (affiliateId) params.push(`${affiliateParamName}=${encodeURIComponent(affiliateId)}`);
      if (transactionId) params.push(`${transactionParamName}=${encodeURIComponent(transactionId)}`);
      if (extraTrackingParams) {
        Object.entries(extraTrackingParams).forEach(([key, value]) => {
          params.push(`${key}=${encodeURIComponent(value)}`);
        });
      }
      const finalUrl = params.length > 0 ? `${buttonLink}${separator}${params.join("&")}` : buttonLink;
      window.open(finalUrl, "_blank");
    }
  };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "border-[1.5px] lg:border-2 relative rounded-xl w-full flex flex-col overflow-hidden bg-white gap-2 lg:gap-3 border-gray-200 transition-shadow duration-200 hover:shadow-md"
        )}
      >
        {/* ── Badge (top-left on all breakpoints) ── */}
        <div className="flex items-center self-start">
          {hasBadgeText ? (
            <div
              className={cn(
                "text-[10px] font-bold px-[10px] py-[4px] bg-primary-main flex items-center gap-1.5 uppercase text-white whitespace-nowrap tracking-wide rounded-br-xl"
              )}
            >
              {(badgeIcon ?? "card") ? (
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 relative shrink-0">
                  <Image src={`/icons/${badgeIcon ?? "card"}.svg`} alt="" fill className="object-contain" />
                </div>
              ) : null}
              {badgeText}
            </div>
          ) : null}
        </div>

        {/* ── Mobile logo (below badge, own row) ── */}
        <div className="lg:hidden px-[14px] pt-2 pb-2">
          {logo ? (
            <div className="flex flex-col items-start">
              <div
                className="relative overflow-hidden rounded-lg"
                style={{ width: mobileLogoWidthPx, height: mobileLogoHeightPx }}
              >
                <Image src={logo} alt={heading} fill className="object-contain" />
              </div>
              {logoText && (
                <p className="text-[10px] text-general-muted-foreground mt-1">{logoText}</p>
              )}
            </div>
          ) : creditCardImage ? (
            <div className="w-[180px] h-[120px] relative overflow-hidden rounded-lg">
              <Image src={creditCardImage} alt={heading} fill className="object-cover" />
            </div>
          ) : null}
        </div>

        {/* ── Main Content ── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 px-[14px] py-[12px]">

          {/* Desktop-only Logo */}
          <div className="hidden lg:flex shrink-0 self-center flex-col items-center justify-center gap-1">
            {logo ? (
              <div className="flex flex-col items-center">
                <div
                  className="relative overflow-hidden rounded-lg flex items-center justify-center"
                  style={{ width: desktopLogoWidthPx, height: desktopLogoHeightPx }}
                >
                  <Image src={logo} alt={heading} fill className="object-contain" />
                </div>
                {logoText && (
                  <p className="text-[10px] text-general-muted-foreground text-center mt-1">{logoText}</p>
                )}
                {logoSubtext && (
                  <p className="text-[10px] text-general-muted-foreground text-center mt-0.5">{logoSubtext}</p>
                )}
              </div>
            ) : creditCardImage ? (
              <div className="w-[200px] h-[130px] relative overflow-hidden rounded-lg">
                <Image src={creditCardImage} alt={heading} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-[200px] h-[69px] rounded-lg bg-white border border-general-border flex items-center justify-center text-xs text-general-muted-foreground">
                Add a logo
              </div>
            )}
          </div>

          {/* Description + Features */}
          <div className="flex flex-col gap-2 lg:gap-3 flex-1 min-w-0">
            <div className="text-xs lg:text-base text-black">
              {description ? (
                <p
                  className="mb-1 text-[15px] lg:text-[16px] font-semibold leading-[1.4] text-black"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : null}
              <ul className="list-disc ml-5 flex flex-col gap-0.5">
                {features.slice(0, 3).map((feature, index) => (
                  <li
                    key={index}
                    className={index >= 2 ? "hidden lg:list-item" : undefined}
                    dangerouslySetInnerHTML={{ __html: feature }}
                  />
                ))}
              </ul>
            </div>

            {/* Stats box hidden for now per updated adwall UI.
            {(minCreditScore || maxLoanAmount || aprRange) && (
              <div
                data-stats-equalize="true"
                className="grid grid-cols-3 gap-2 lg:gap-3 w-full bg-[#f5f5f5] rounded-lg p-2.5 lg:p-3 text-center"
                style={statsMinWidthPx ? { minWidth: statsMinWidthPx } : undefined}
              >
                {minCreditScore && (
                  <div className="flex flex-col gap-0.5 items-center">
                    <p className="text-[8px] lg:text-[10px] font-medium text-general-muted-foreground tracking-wide leading-[1.3]">Min Credit Score</p>
                    <p className="text-sm lg:text-lg font-semibold text-primary-main leading-[1.2] tracking-tight">{minCreditScore}</p>
                  </div>
                )}
                {maxLoanAmount && (
                  <div className="flex flex-col gap-0.5 items-center">
                    <p className="text-[8px] lg:text-[10px] font-medium text-general-muted-foreground tracking-wide leading-[1.3]">Max Loan Amount</p>
                    <p className="text-sm lg:text-lg font-semibold text-primary-main leading-[1.2] tracking-tight">{maxLoanAmount}</p>
                  </div>
                )}
                {aprRange && (
                  <div className="flex flex-col gap-0.5 items-center">
                    <p className="text-[8px] lg:text-[10px] font-medium text-general-muted-foreground tracking-wide leading-[1.3]">APR Range</p>
                    <p className="text-sm lg:text-lg font-semibold text-primary-main leading-[1.2] tracking-tight">{aprRange}</p>
                  </div>
                )}
              </div>
            )} */}
          </div>

          {/* Rating + CTA Column */}
          <div className="flex flex-col gap-2 lg:gap-3 self-center items-center lg:items-stretch justify-center shrink-0 w-full lg:w-auto lg:min-w-[200px]">

            {/* Rating */}
            <div className="flex w-full flex-col items-start justify-center gap-1.5 border-t border-[#E5E7EB] pt-[10px] text-left lg:w-auto lg:items-center lg:border-t-0 lg:pt-0 lg:text-center">
              <div className="flex items-end justify-start gap-1 lg:justify-center">
                <p className="text-[28px] lg:text-[36px] font-semibold leading-none tracking-tight text-[#204C4B]">
                  {ratingsNumber}
                </p>
                <span className="mb-1 text-[13px] font-medium leading-none text-[#94A3B8]">/10</span>
              </div>
              <p className="text-[11px] font-semibold leading-none text-[#9CA3AF]">Sagewise Score</p>
              <div className="flex items-center justify-start gap-0.5 lg:justify-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <ScoreStar key={i} filled={i < fullStars} />
                ))}
              </div>
              {displayReviews && (
                <p className="text-[11px] font-medium leading-none text-[#6B7280] whitespace-nowrap flex items-center justify-start lg:justify-center">
                  <span>{displayReviews} reviews by</span>
                  <Image
                    src="/trustpilot-logo.svg"
                    alt="Trustpilot"
                    width={66}
                    height={14}
                    className="h-[18px] w-auto lg:h-4.5"
                  />
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2 w-full pt-2 lg:pt-0">
              <Button
                variant="secondary"
                className="h-[41px] w-full rounded-lg px-3 py-0 text-[15px] font-bold text-white"
                onClick={handleButtonClick}
                icon={MoveRight}
                iconClass="w-4 h-4"
              >
                {buttonText}
              </Button>
              {phoneNumber && (
                <a
                  href={toTelHref(phoneNumber)}
                  className="flex items-center justify-center gap-2 h-[41px] w-full rounded-lg border border-[#d4d4d4] bg-white px-3 py-0 text-[15px] font-medium text-black shadow-sm transition-colors hover:bg-gray-50"
                  aria-label={`Call ${phoneNumber}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{phoneNumber}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Desktop-only: disclaimer inside card */}
        {bottomBoxHtml && (
          <div className="hidden lg:block border-t border-general-border bg-white px-[14px] py-[12px]">
            <div
              className="text-[10px] text-[#9CA3AF] leading-relaxed [&_a]:text-primary-main [&_a]:underline [&_a]:underline-offset-2"
              dangerouslySetInnerHTML={{ __html: bottomBoxHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsWallCards;
