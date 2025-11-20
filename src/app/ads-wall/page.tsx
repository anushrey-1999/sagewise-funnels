"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Star, Phone, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import AdsWallTemplate from "@/templates/AdsWallTemplate";

export interface Ad {
  id: string;
  title: string;
  description: string;
  image?: string;
  link: string;
  provider: string;
  rating?: number;
  badges?: Array<{ text: string; variant?: "filled" | "outline" }>;
  features?: string[];
  phone?: string;
  amBestRating?: {
    grade: string;
    label: string;
    date?: string;
  };
  isTopPick?: boolean;
  badgeLabel?: string; // e.g., "FAST APPLICATION"
}

interface AdsWallData {
  title: string;
  subtitle: string;
  ads: Ad[];
}

function AdsWallContent() {
  const searchParams = useSearchParams();
  const [adsWallData, setAdsWallData] = useState<AdsWallData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get ads from URL params (passed from form submission)
    const adsData = searchParams.get("ads");
    if (adsData) {
      try {
        const parsedAds = JSON.parse(decodeURIComponent(adsData));
        setAdsWallData({
          title: "Final Expense Insurance Quote Calculator",
          subtitle: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          ads: parsedAds,
        });
      } catch (error) {
        console.error("Error parsing ads data:", error);
      }
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-176px)]">
        <p className="text-lg text-muted-foreground">Loading your personalized offers...</p>
      </div>
    );
  }

  if (!adsWallData || adsWallData.ads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-176px)] px-4">
        <h1 className="text-2xl font-semibold mb-4">No offers available</h1>
        <p className="text-muted-foreground mb-6">We couldn't find any matching offers at this time.</p>
      </div>
    );
  }

  const topPickAd = adsWallData.ads.find((ad) => ad.isTopPick) || adsWallData.ads[0];
  const otherAds = adsWallData.ads.filter((ad) => ad.id !== topPickAd.id);

  return (
    <div className="bg-[#f5f5f5] flex flex-col items-start min-h-screen w-full">
      {/* Hero Section */}
      {/* <div className="bg-[#001918] flex min-h-[200px] sm:min-h-[240px] md:h-[274px] items-center justify-center overflow-hidden relative rounded-bl-[24px] rounded-br-[24px] w-full py-8 sm:py-10 md:py-0">
        <div className="absolute left-[-207px] opacity-5 size-[673px] top-[-145px] hidden sm:block">
          <Image
            src="http://localhost:3845/assets/f563537bda6761ac6cc688238b23334006192fd8.svg"
            alt="Sagewise Logo Background"
            width={673}
            height={673}
            className="w-full h-full"
          />
        </div>
        <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 items-center px-4 sm:px-8 md:px-16 z-10 w-full">
          <h1 className="font-semibold leading-none sm:leading-[1.1] md:leading-[1.2] text-[30px] sm:text-[36px] md:text-[48px] text-white text-center tracking-[-0.3px] sm:tracking-[-0.36px] md:tracking-[-0.48px]">
            {adsWallData.title || "Final Expense Insurance Quote Calculator"}
          </h1>
          <p className="font-medium sm:font-semibold leading-[1.5] sm:leading-[1.3] md:leading-[1.2] text-[16px] sm:text-[18px] md:text-[20px] text-white text-center tracking-[0.08px] sm:tracking-[-0.2px] md:tracking-[-0.4px] max-w-[509px]">
            {adsWallData.subtitle || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
          </p>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="flex flex-col gap-6 sm:gap-8 md:gap-9 items-center px-4 sm:px-6 md:px-16 py-6 sm:py-8 md:py-9 w-full">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-[12px] items-center justify-center w-full max-w-[716px]">
          <div className="size-[28px] sm:size-[30px] shrink-0">
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <path
                d="M15 2L17.5 10L25 12.5L17.5 15L15 23L12.5 15L5 12.5L12.5 10L15 2Z"
                stroke="#16a34a"
                strokeWidth="1.5"
                fill="#16a34a"
                fillOpacity="0.1"
              />
              <path
                d="M15 8L16.5 13L21 14.5L16.5 16L15 21L13.5 16L9 14.5L13.5 13L15 8Z"
                stroke="#16a34a"
                strokeWidth="1"
                fill="#16a34a"
              />
            </svg>
          </div>
          <p className="font-semibold leading-[1.2] text-[20px] sm:text-[24px] text-[#16a34a] text-center">
            We found <span className="text-[#16a34a]">{adsWallData.ads.length}</span> carrier matches for you in your area!
          </p>
        </div>

        {/* TOP PICK Card */}
        <div className="flex flex-col items-start w-full max-w-[970px]">
          <div className="relative w-full">
            <Badge
              className="absolute top-0 left-0 z-10 bg-[#001918] text-white border-0 rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[8px] rounded-br-[8px] px-4 py-2 gap-1.5"
            >
              <Trophy className="size-3" />
              <span className="text-base font-normal">TOP PICK</span>
            </Badge>
            <AdCard ad={topPickAd} isTopPick />
          </div>
        </div>

        {/* List Heading */}
        <p className="font-semibold leading-[1.2] text-[18px] sm:text-[20px] text-[#204c4b] text-center w-full max-w-[970px]">
          Here's a complete list of policies available:
        </p>

        {/* Ad Cards List */}
        <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-[970px]">
          {otherAds.map((ad) => (
            <div key={ad.id} className="relative w-full">
              {ad.badgeLabel && (
                <Badge
                  className="absolute top-0 left-0 z-10 bg-[#001918] text-white border-0 rounded-tl-[12px] rounded-tr-[12px] rounded-bl-[8px] rounded-br-[8px] px-4 py-2 gap-1.5 mb-[-18px]"
                >
                  <Zap className="size-3" />
                  <span className="text-base font-normal">{ad.badgeLabel}</span>
                </Badge>
              )}
              <AdCard ad={ad} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AdCardProps {
  ad: Ad;
  isTopPick?: boolean;
}

function AdCard({ ad, isTopPick = false }: AdCardProps) {
  return (
    <Card
      className={cn(
        "border border-[#204c4b] bg-[#f5f5f5] flex flex-col gap-6 p-4 sm:p-6 rounded-[12px] w-full",
        isTopPick && "mt-[54px] sm:mt-[54px]"
      )}
    >
      {/* Desktop Layout: 3 Columns */}
      <div className="hidden md:flex flex-row gap-6 items-start">
        {/* Left Column: Logo, Rating, Badges */}
        <div className="flex flex-col gap-6 w-[235px] shrink-0">
          {ad.image && (
            <div className="relative h-[147px] w-[235px] rounded-[8px] overflow-hidden bg-white">
              <Image
                src={ad.image}
                alt={ad.title || ad.provider}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          
          {/* For TOP PICK: Only badges, no rating */}
          {isTopPick && ad.badges && ad.badges.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {ad.badges.map((badge, idx) => (
                <Badge
                  key={idx}
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-[8px] h-6",
                    badge.variant === "filled"
                      ? "bg-[#15803d] text-white border-0"
                      : "bg-transparent text-[#15803d] border border-[#15803d]"
                  )}
                >
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}

          {/* For List Cards: Rating with stars, then badges */}
          {!isTopPick && (
            <div className="flex flex-col gap-2">
              {ad.rating !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold leading-[1.2] text-[20px] text-[#204c4b] tracking-[-0.4px]">
                    {ad.rating}
                  </span>
                  <div className="flex gap-1 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="size-6 fill-[#f59e0b] text-[#f59e0b]"
                      />
                    ))}
                  </div>
                </div>
              )}
              {ad.badges && ad.badges.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {ad.badges.map((badge, idx) => (
                    <Badge
                      key={idx}
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-[8px] h-6",
                        badge.variant === "filled"
                          ? "bg-[#15803d] text-white border-0"
                          : "bg-transparent text-[#15803d] border border-[#15803d]"
                      )}
                    >
                      {badge.text}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Middle Column: Company Name, Description, Features */}
        <div className="flex flex-col gap-6 flex-1 min-w-0">
          <h3 className="font-semibold leading-[1.2] text-[24px] text-[#204c4b] tracking-[-0.48px]">
            {ad.title || ad.provider}
          </h3>
          
          {ad.description && (
            <div className="text-sm font-normal leading-[1.5] text-black">
              <p className="mb-3">{ad.description}</p>
              {ad.features && ad.features.length > 0 && (
                <ul className="list-disc ml-5 space-y-1">
                  {ad.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right Column: A.M. Best Rating (TOP PICK only) or Buttons */}
        <div className="flex flex-col gap-3 w-[220px] shrink-0">
          {isTopPick && ad.amBestRating ? (
            <>
              <div className="border border-[#e5e5e5] rounded-[8px] p-3 flex items-center gap-2 bg-white">
                <div className="flex flex-col items-center justify-center flex-1 bg-[#204c4b] rounded-[6px] py-2 px-3">
                  <p className="font-semibold leading-[1.2] text-[24px] text-white tracking-[-0.48px]">
                    {ad.amBestRating.grade}
                  </p>
                  <p className="font-normal leading-[1.5] text-sm text-white">
                    {ad.amBestRating.label}
                  </p>
                </div>
                <p className="text-xs font-medium text-black leading-[1.5]">
                  A.M. Best Rating
                  {ad.amBestRating.date && (
                    <>
                      <br />
                      (as of {ad.amBestRating.date})
                    </>
                  )}
                </p>
              </div>
              <Button
                asChild
                className="bg-[#fcd34d] hover:bg-[#fcd34d]/90 text-[#171717] h-[43px] w-full font-medium"
              >
                <a href={ad.link} target="_blank" rel="noopener noreferrer">
                  Get Quote
                </a>
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="bg-[#fcd34d] hover:bg-[#fcd34d]/90 text-[#171717] h-[43px] w-full font-medium"
              >
                <a href={ad.link} target="_blank" rel="noopener noreferrer">
                  Get Quote
                </a>
              </Button>
              {ad.phone && (
                <Button
                  variant="outline"
                  className="border border-[#d4d4d4] bg-white hover:bg-gray-50 text-[#171717] h-[43px] w-full font-medium"
                  asChild
                >
                  <a href={`tel:${ad.phone.replace(/\s/g, "")}`}>
                    <Phone className="size-4 mr-2" />
                    {ad.phone}
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col gap-6">
        {/* Logo and Title */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-[12px] items-start">
          {ad.image && (
            <div className="relative h-[52px] sm:h-[147px] w-[122px] sm:w-[235px] rounded-[8px] overflow-hidden bg-white shrink-0">
              <Image
                src={ad.image}
                alt={ad.title || ad.provider}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="font-semibold leading-[1.2] text-[24px] text-[#204c4b] tracking-[-0.48px]">
              {ad.title || ad.provider}
            </h3>
            
            {/* Rating and Badges */}
            <div className="flex flex-col gap-2">
              {!isTopPick && ad.rating !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold leading-[1.2] text-[20px] text-[#204c4b] tracking-[-0.4px]">
                    {ad.rating}
                  </span>
                  <div className="flex gap-1 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="size-3 fill-[#f59e0b] text-[#f59e0b]"
                      />
                    ))}
                  </div>
                </div>
              )}
              {ad.badges && ad.badges.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {ad.badges.map((badge, idx) => (
                    <Badge
                      key={idx}
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-[8px] h-6",
                        badge.variant === "filled"
                          ? "bg-[#15803d] text-white border-0"
                          : "bg-transparent text-[#15803d] border border-[#15803d]"
                      )}
                    >
                      {badge.text}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {ad.description && (
          <div className="text-xs sm:text-sm font-normal leading-[1.5] text-black">
            <p className="mb-3">{ad.description}</p>
            {ad.features && ad.features.length > 0 && (
              <ul className="list-disc ml-4 sm:ml-5 space-y-1">
                {ad.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* A.M. Best Rating (TOP PICK only) */}
        {isTopPick && ad.amBestRating && (
          <div className="border border-[#e5e5e5] rounded-[8px] p-3 flex items-center gap-2 bg-white">
            <div className="flex flex-col items-center justify-center flex-1 bg-[#204c4b] rounded-[6px] py-2 px-3">
              <p className="font-semibold leading-[1.2] text-[24px] text-white tracking-[-0.48px]">
                {ad.amBestRating.grade}
              </p>
              <p className="font-normal leading-[1.5] text-sm text-white">
                {ad.amBestRating.label}
              </p>
            </div>
            <p className="text-xs font-medium text-black leading-[1.5]">
              A.M. Best Rating
              {ad.amBestRating.date && (
                <>
                  <br />
                  (as of {ad.amBestRating.date})
                </>
              )}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 bg-white rounded-[8px] p-3">
          <Button
            asChild
            className="bg-[#fcd34d] hover:bg-[#fcd34d]/90 text-[#171717] h-[35px] w-full font-medium"
          >
            <a href={ad.link} target="_blank" rel="noopener noreferrer">
              Get Quote
            </a>
          </Button>
          {ad.phone && (
            <Button
              variant="outline"
              className="border border-[#d4d4d4] bg-white hover:bg-gray-50 text-[#171717] h-[35px] w-full font-medium"
              asChild
            >
              <a href={`tel:${ad.phone.replace(/\s/g, "")}`}>
                <Phone className="size-3.5 mr-2" />
                {ad.phone}
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function AdsWallPageContent() {
  const searchParams = useSearchParams();
  const [adsWallData, setAdsWallData] = useState<AdsWallData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get ads from URL params (passed from form submission)
    const adsData = searchParams.get("ads");
    if (adsData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(adsData));
        // Extract title and subtitle from the parsed data
        const adsWallData: AdsWallData = {
          title: parsedData.title || "Final Expense Insurance Quote Calculator",
          subtitle: parsedData.subtitle || "Compare quotes from top providers",
          ads: parsedData.ads || [],
        };
        setAdsWallData(adsWallData);
      } catch (error) {
        console.error("Error parsing ads data:", error);
        // Set default values if parsing fails
        setAdsWallData({
          title: "Final Expense Insurance Quote Calculator",
          subtitle: "Compare quotes from top providers",
          ads: [],
        });
      }
    } else {
      // Set default values if no ads data
      setAdsWallData({
        title: "Final Expense Insurance Quote Calculator",
        subtitle: "Compare quotes from top providers",
        ads: [],
      });
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-176px)]">
        <p className="text-lg text-muted-foreground">Loading your personalized offers...</p>
      </div>
    );
  }

  if (!adsWallData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-176px)] px-4">
        <h1 className="text-2xl font-semibold mb-4">No offers available</h1>
        <p className="text-muted-foreground mb-6">We couldn't find any matching offers at this time.</p>
      </div>
    );
  }

  return <AdsWallTemplate adsWallData={adsWallData} />;
}

export default function AdsWallPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[calc(100vh-176px)]">
          <p className="text-lg text-muted-foreground">Loading your personalized offers...</p>
        </div>
      }
    >
      <AdsWallPageContent />
    </Suspense>
  );
}
