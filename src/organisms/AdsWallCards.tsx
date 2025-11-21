import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Phone, Trophy, Type } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import React from "react";

interface AdsWallCardsProps {
  ratings?: number;
  cardBg?: string;
  isGradientBorder?: boolean;
  logo: string;
  isBadge?: boolean;
  isSecondaryBtn?: boolean;
  isGradientBox?: boolean;
  badgeIcon?: React.ReactNode; // Accepts HTML/JSX content
  badgeText?: React.ReactNode; // Accepts HTML/JSX content
}

const AdsWallCards = ({
  ratings,
  cardBg = "bg-white",
  isGradientBorder,
  logo = "/ads-logo.png",
  isBadge = false,
  isSecondaryBtn = true,
  isGradientBox = false,
  badgeIcon,
  badgeText,
}: AdsWallCardsProps) => {
  // Card content (shared between gradient and non-gradient borders)
  const cardContent = (
    <>
      <div className="flex flex-col">
        <div className="flex gap-3 items-center mb-2 lg:mb-3">
          <div className="bg-white w-30.5 h-13  lg:w-[14.688rem] lg:h-[9.188rem] relative overflow-hidden rounded-lg">
            <Image src={logo} alt="logo" layout="fill" />
          </div>
          <Typography
            variant="h3"
            color="text-primary-main"
            className="lg:hidden"
          >
            eCoverage
          </Typography>
        </div>
        <div className="flex flex-row lg:flex-col justify-between gap-1 lg:gap-0">
          {ratings && (
            <div className="flex gap-2 lg:px-5.5 px-0 mb-0 lg:mb-2">
              <Typography
                variant="h3"
                color="text-primary-main"
                className="text-xl"
              >
                9.5
              </Typography>
              <div className="flex gap-1 justify-center items-center ">
                <Image
                  src={"/star.svg"}
                  alt="star"
                  width={100}
                  height={100}
                  className="w-3 h-3 lg:w-6 lg:h-6 "
                />
                <Image
                  src={"/star.svg"}
                  alt="star"
                  width={100}
                  height={100}
                  className="w-3 h-3 lg:w-6 lg:h-6"
                />
                <Image
                  src={"/star.svg"}
                  alt="star"
                  width={100}
                  height={100}
                  className="w-3 h-3 lg:w-6 lg:h-6"
                />
                <Image
                  src={"/star.svg"}
                  alt="star"
                  width={100}
                  height={100}
                  className="w-3 h-3 lg:w-6 lg:h-6"
                />
                <Image
                  src={"/star.svg"}
                  alt="star"
                  width={100}
                  height={100}
                  className="w-3 h-3 lg:w-6 lg:h-6"
                />
              </div>
            </div>
          )}
          <div className="flex gap-1.5">
            <Badge
              variant="default"
              bgColor="bg-green-700"
              borderRadius="rounded-[8px]"
            >
              Excellent
            </Badge>
            <Badge
              variant="outline"
              textColor="text-green-700"
              borderColor="border-green-700"
              borderRadius="rounded-[8px]"
            >
              51,237+ families covered
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:text-center h-fit">
        <Typography variant="h2" color="text-primary-main mb-6 hidden lg:block">
          eCoverage
        </Typography>
        <Typography variant="p" className="text-xs">
          Thoughtfully designed policies for over 100 years:
        </Typography>
        <Typography variant="ul" className="mt-3" color="text-xs">
          <ul className="list-disc text-left list-outside lg:ml-6 text-xs">
            <li>Unique RAPIDecision® Final Expense products</li>
            <li>Coverage up-to $2 million, terms up-to 30 years</li>
            <li>Fast and easy online application</li>
            <li>Multiple options with no medical exam required</li>
          </ul>
        </Typography>
      </div>

      <div className="bg-white rounded-md p-3 flex flex-col gap-3 h-fit min-w-[220px]">
        {isGradientBox && (
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
        )}
        <Button variant="secondary" size="lg" className="w-full">
          Get Quote
        </Button>
        {isSecondaryBtn && (
          <Button variant="outline" size="lg" icon={Phone} className="w-full">
            1-833-906-2737
          </Button>
        )}
      </div>
    </>
  );

  return (
    <div className="relative w-full">
      {isBadge && (
        <div className="relative top-4 text-xs lg:text-base left-0  bg-black flex items-center gap-1.5 uppercase rounded-tl-xl rounded-tr-xl rounded-bl-lg rounded-br-lg w-fit pt-2 px-4 pb-5 text-white">
          {badgeIcon}
          {badgeText}
        </div>
      )}
      {isGradientBorder ? (
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
      )}
    </div>
  );
};

export default AdsWallCards;
