import AdsWallCards from "@/organisms/AdsWallCards";
import { Typography } from "@/components/ui/typography";
import { PartyPopper, Rocket, Trophy, Zap } from "lucide-react";
import PageHeader from "@/organisms/PageHeader";
import PlainPageHeader from "@/organisms/PlainPageHeader";

interface AdsWallTemplateProps {
  adsWallData: AdsWallData;
}
interface AdsWallData {
  title: string;
  subtitle: string;
}

const AdsWallTemplate = ({ adsWallData }: AdsWallTemplateProps) => {
  const cardData = [
    {
      heading: "Chime Card<sup>&trade;</sup>",
      description:
        "Help build credit with your own money. No credit check, no annaul fee, and no interest.",
      features: [
        "No credit check to apply",
        "No annual fees or intrest",
        "Earn 1.5% cash back on rotating categories with direct deposit",
        "No minimum security deposit required",
      ],
      buttonLink: "https://lkd7vx3a.com/?E=BoniqlAkcXgZGXxI%2fhpBCsz6l05hPQ0P&s1=",
      buttonText: "Apply Now",
      ratingsNumber: "8.2",
      ratingsCount: 5,
      logo: "/logos/chime-logo.avif",
      logoWidth: "120px",
      logoHeight: "40px",
      creditCardImage: "/credit-cards/chime-credit-card.avif",
      badgeText: "NO CREDIT CHECK",
      badgeIcon: <Rocket size={14} className="w-3 h-3 lg:w-3.5 lg:h-3.5" />,
      advertiserName: "Chime",
    },
    {
      heading: "Indigo Platinum Mastercard",
      description:
        "Unsecured credit card for rebuilding credit with no security deposit required.",
      features: [
        "No security deposit required",
        "Reports to all three credit bureaus",
        "Pre-qualification available",
        "Quick online applicatio process",
      ],
      buttonLink: "https://rdtrk.net/?E=fhouR7k3k0Rgem%2b5T6869sz6l05hPQ0P&s1=",
      buttonText: "Check Pre-Approval",
      ratingsNumber: "6.5",
      ratingsCount: 5,
      logo: "/logos/indigo-logo.avif",
      logoWidth: "100px",
      logoHeight: "35px",
      creditCardImage: "/credit-cards/indigo-credit-card.avif",
      badgeText: "UNSECURED CARD",
      badgeIcon: <Rocket size={14} className="w-3 h-3 lg:w-3.5 lg:h-3.5" />,
      advertiserName: "Indigo",
    },
    {
      heading: "Milestone Mastercard",
      description:
        "Build credit history with an unsecured card designed for limited credit profiles.",
      features: [
        "No security deposit required",
        "Activity reported to major bureaus",
        "Quick approval decision",
        "Accepted where Mastercard is used",
      ],
      buttonLink: "https://rdtrk.net/?E=fhouR7k3k0Qq1zozXKPcVcz6l05hPQ0P&s1=",
      buttonText: "Apply Now",
      ratingsNumber: "6.8",
      ratingsCount: 5,
      logo: "/logos/milestone-logo.avif",
      logoWidth: "120px",
      logoHeight: "28px",
      creditCardImage: "/credit-cards/milestone-credit-card.avif",
      badgeText: "NO CREDIT CHECK",
      badgeIcon: <Rocket size={14} className="w-3 h-3 lg:w-3.5 lg:h-3.5" />,
      advertiserName: "Milestone",
    },
    {
      heading: "Chime Card<sup>&reg;</sup> Checking Account",
      description:
        "Get up to $350 with a new Chime Checking Account. Limited time offer.<sup>*</sup>",
      features: [
        "<strong>New Account Bonus:</strong> up to $350",
        "<strong>Monthly Fee:</strong> $0",
        "<strong>Overdraft Fee:</strong> $0 with fee-free overdraft up to $200",
        "Get paid up to 2 days early with direct deposit",
      ],
      buttonLink: "https://lkd7vx3a.com/?E=BoniqlAkcXgZGXxI%2fhpBCsz6l05hPQ0P&s1=",
      buttonText: "Open Account",
      ratingsNumber: "9.5",
      ratingsCount: 5,
      logo: "/logos/chime-logo.avif",
      logoWidth: "120px",
      logoHeight: "40px",
      creditCardImage: "/credit-cards/chime-credit-card.avif",
      badgeText: "$350 BONUS OFFER",
      badgeIcon: <Rocket size={14} className="w-3 h-3 lg:w-3.5 lg:h-3.5" />,
      advertiserName: "Chime",
    },
    {
      heading: "SoFi Unlimited 2% Credit Card",
      description:
        "Earn 2% unlimted cash back on all eligible purchases with no annual fee",
      features: [
        "Earn 2% cash back on all purchases",
        "$0 annual fee and no foreign transaction fees",
        "$200 welcome bonus after $2,000 spend",
        "Cell phone protection up to $1,000",
      ],
      buttonLink: "https://rdtrk151.com/?E=mAOiPn8VlA4xno2yw2LWo8z6l05hPQ0P&s1=",
      buttonText: "View Offer",
      ratingsNumber: "9.0",
      ratingsCount: 5,
      logo: "/logos/chime-logo.avif",
      logoWidth: "120px",
      logoHeight: "40px",
      creditCardImage: "/credit-cards/sofi-credit-card.avif",
      badgeText: "2% CASH BACK",
      badgeIcon: <Rocket size={14} className="w-3 h-3 lg:w-3.5 lg:h-3.5" />,
      advertiserName: "SoFi",
    },
  ];

  return (
    <div className="bg-white flex flex-col items-start min-h-screen w-full">
      {/* Header */}
      <PlainPageHeader title={'Best credit cards of December 2025'} subtitle={'Updated December 05, 2025'} />

      {/* Cards */}
      <div className="flex flex-col items-center w-full px-6 sm:px-6 md:px-16 pb-6 sm:pb-8 md:pb-12">
        <div className="w-full max-w-[970px] ">
          <div className="flex flex-col gap-4">
            {cardData.map((item, index) => (
              <AdsWallCards key={index} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsWallTemplate;
