import React from "react";
import Image from "next/image";
import AdsWallCards from "@/organisms/AdsWallCards";
import { Typography } from "@/components/ui/typography";
import { PartyPopper, Trophy, Zap } from "lucide-react";
import PageHeader from "@/organisms/PageHeader";

interface AdsWallTemplateProps {
  adsWallData: AdsWallData;
}
interface AdsWallData {
  title: string;
  subtitle: string;
}

const AdsWallTemplate = ({ adsWallData }: AdsWallTemplateProps) => {
  return (
    <div className="bg-white flex flex-col items-start min-h-screen w-full">
      {/* Header */}
      <PageHeader title={adsWallData.title} subtitle={adsWallData.subtitle} />

      {/* Cards */}
      <div className="flex flex-col items-center w-full px-6 sm:px-6 md:px-16 py-9 sm:py-8 md:py-12">
        <div className="w-full max-w-[970px] ">
          <Typography
            variant="h3"
            color="text-green-600"
            className="flex  text-xl lg:gap-2 lg:text-center gap-2 justify-center mb-5 lg:mb-10"
          >
            <PartyPopper strokeWidth={1} size={30} /> We found 5 carrier matches
            for you in your area!
          </Typography>

          <AdsWallCards
            cardBg="bg-general-secondary"
            logo="/ads-logo.png"
            isGradientBorder={true}
            isBadge={true}
            isSecondaryBtn={false}
            isGradientBox={true}
            badgeIcon={<Trophy size={14} />}
            badgeText="TOP PICK"
          />

          <Typography
            variant="h5"
            color="text-primary-main"
            className="mt-8 lg:mb-7 mb-6 text-center"
          >
            Here's a complete list of policies available:
          </Typography>

          <div className="flex flex-col gap-4">
            <AdsWallCards
              logo="/ads-logo.png"
              ratings={9.5}
              isBadge={true}
              badgeIcon={<Zap size={14} />}
              badgeText="FAST APPLICATION"
            />
            <AdsWallCards logo="/ads-logo.png" ratings={9.5} />
            <AdsWallCards logo="/ads-logo.png" ratings={9.5} />
            <AdsWallCards logo="/ads-logo.png" ratings={9.5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsWallTemplate;
