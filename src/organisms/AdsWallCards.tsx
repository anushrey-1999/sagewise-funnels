import { Button } from "@/components/ui/button";
import { MoveUpRight, Phone } from "lucide-react";
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

interface AdsWallCardsProps {
  ratings?: number;
  cardBg?: string;
  isGradientBorder?: boolean;
  isBadge?: boolean;
  isSecondaryBtn?: boolean;
  isGradientBox?: boolean;
  isDifferentBorder?: boolean;
  badgeIcon?: React.ReactNode;
  badgeText?: React.ReactNode;
  cardNumber?: number;
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
  statsMinWidthPx?: number;
  trustpilotReviews?: string;
  minCreditScore?: string;
  maxLoanAmount?: string;
  aprRange?: string;
  bottomBoxHtml?: string;
}

const AdsWallCards = ({
  isDifferentBorder = false,
  badgeIcon,
  badgeText,
  cardNumber,
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
  statsMinWidthPx,
  trustpilotReviews,
  minCreditScore,
  maxLoanAmount,
  aprRange,
  bottomBoxHtml,
}: AdsWallCardsProps) => {
  const affiliateParamName = "sub4";
  const transactionParamName = "sub5";

  const displayReviews = trustpilotReviews?.trim() || null;

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
          "border-[1.5px] lg:border-2 relative rounded-xl w-full flex flex-col overflow-hidden bg-white gap-4 lg:gap-5",
          isDifferentBorder ? "border-[#ffd32a]" : "border-primary-main"
        )}
      >
        {/* ── Badges (top-right on mobile, top-left on desktop) ── */}
        <div className="flex items-center self-end lg:self-start">
          {cardNumber && (
            <div
              className={cn(
                "min-h-[28px] lg:min-h-[32px] text-[11px] lg:text-sm font-medium px-3 lg:px-4 py-1 bg-primary-main flex items-center uppercase text-white whitespace-nowrap tracking-wide",
                hasBadgeText ? "max-lg:rounded-bl-xl" : "max-lg:rounded-bl-xl lg:rounded-br-xl"
              )}
            >
              #{cardNumber}
            </div>
          )}
          {hasBadgeText && (
            <div
              className={cn(
                "min-h-[28px] lg:min-h-[32px] text-[11px] lg:text-sm font-medium px-3 lg:px-4 py-1 bg-primary-dark flex items-center gap-1.5 uppercase text-white whitespace-nowrap tracking-wide",
                "lg:rounded-br-xl"
              )}
            >
              {(badgeIcon ?? "card") ? (
                <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 relative shrink-0">
                  <Image src={`/icons/${badgeIcon ?? "card"}.svg`} alt="" fill className="object-contain" />
                </div>
              ) : null}
              {badgeText}
            </div>
          )}
        </div>

        {/* ── Mobile logo (below badge, own row) ── */}
        <div className="lg:hidden px-4">
          {logo ? (
            <div className="flex flex-col items-start">
              <div
                className="relative overflow-hidden rounded-lg"
                style={{ width: logoWidth || "180px", height: logoHeight || "84px" }}
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
        <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-8 px-4 pb-[20px] lg:px-6 lg:py-5 lg:pb-3 lg:pr-8">

          {/* Desktop-only Logo */}
          <div className="hidden lg:flex shrink-0 flex-col items-center gap-1">
            {logo ? (
              <div className="flex flex-col items-center">
                <div
                  className="relative overflow-hidden rounded-lg flex items-center justify-center"
                  style={{ width: logoWidth || "200px", height: logoHeight || "69px" }}
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

          {/* Heading + Description + Features */}
          <div className="flex flex-col gap-2 lg:gap-3 flex-1 min-w-0">
            <h3
              className="text-2xl lg:text-[30px] font-semibold text-primary-main leading-[1.2] tracking-tight"
              dangerouslySetInnerHTML={{ __html: heading }}
            />
            <div className="text-xs lg:text-base text-black">
              <p
                className="font-medium"
                dangerouslySetInnerHTML={{ __html: description }}
              />
              <ul className="list-disc ml-5 flex flex-col gap-0.5 mt-1">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className={index >= 2 ? "hidden lg:list-item" : undefined}
                    dangerouslySetInnerHTML={{ __html: feature }}
                  />
                ))}
              </ul>
            </div>

            {/* Stats Box (horizontal row below features) */}
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
            )}
          </div>

          {/* Rating + CTA Column */}
          <div className="flex flex-col gap-4 lg:gap-6 items-center lg:items-stretch shrink-0 w-full lg:w-auto lg:min-w-[200px]">

            {/* Rating */}
            <div className="flex gap-3 items-center justify-center lg:justify-start">
              <p
                className="text-5xl font-semibold leading-[1.2] tracking-tight bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(120deg, #204c4b 17%, #059669 87%)" }}
              >
                {ratingsNumber}
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex gap-0.5 items-center">
                  {Array.from({ length: ratingsCount || 5 }, (_, i) => (
                    <Image key={i} src="/star.svg" alt="star" width={22} height={22} className="w-[22px] h-[22px]" />
                  ))}
                </div>
                {displayReviews && (
                  <p className="text-xs font-medium text-general-muted-foreground whitespace-nowrap flex items-center">
                    {displayReviews} reviews by
                    <Image
                      src="/trustpilot-logo.svg"
                      alt="Trustpilot"
                      width={70}
                      height={18}
                      className="h-5 w-auto"
                    />
                  </p>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="secondary"
                size="lg"
                className="w-full font-medium text-lg rounded-lg"
                onClick={handleButtonClick}
                icon={MoveUpRight}
                iconClass="w-3.5 h-3.5"
              >
                {buttonText}
              </Button>
              {phoneNumber && (
                <a
                  href={toTelHref(phoneNumber)}
                  className="flex items-center justify-center gap-2 w-full min-h-[40px] px-6 py-2 rounded-lg border border-[#d4d4d4] bg-white shadow-sm text-lg font-medium text-black hover:bg-gray-50 transition-colors"
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
          <div className="hidden lg:block bg-[#f5f5f5] px-6 py-3">
            <div
              className="text-sm text-general-muted-foreground leading-relaxed [&_a]:text-primary-main [&_a]:underline [&_a]:underline-offset-2"
              dangerouslySetInnerHTML={{ __html: bottomBoxHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsWallCards;
