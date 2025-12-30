"use client";

import AdsWallCards from "@/organisms/AdsWallCards";
import PlainPageHeader from "@/organisms/PlainPageHeader";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const AdsWallTwoTemplate = () => {
  const searchParams = useSearchParams();

  // Extract and clean the IDs from URL parameters
  const affiliateId = useMemo(() => {
    const id = searchParams.get("s1");
    return id?.replace(/^["']|["']$/g, "") || null;
  }, [searchParams]);

  const transactionId = useMemo(() => {
    const id = searchParams.get("s2");
    return id?.replace(/^["']|["']$/g, "") || null;
  }, [searchParams]);

  const cardData = [
    {
      heading: "Upgrade Cash Rewards Visa®",
      description:
        "Charge like a credit card, pay off like a loan with 1.5% cash back.",
      features: [
        "Earn unlimited 1.5% cash back on all purchases when you pay",
        "No security deposit, annual fee, or hidden account costs",
        "Fixed monthly payments make budgeting simple and predictable",
        "Check for an unsecured line with no credit score impact",
      ],
      buttonLink:
        "#",
      buttonText: "Apply Now",
      ratingsNumber: "8.9",
      ratingsCount: 5,
      logo: "/logos/chime-logo.avif",
      logoWidth: "120px",
      logoHeight: "40px",
      creditCardImage: "/credit-cards/upgrade-credit-card.avif",
      badgeText: "UNSECURED CARD",
      badgeIcon: "no-card",
      advertiserName: "Upgrade",
    },
    {
      heading: "Mission Lane Silver Line Visa®",
      description:
        "A premier unsecured card designed for those rebuilding their credit.",
      features: [
        "Automatic reviews for credit limit increases in as little as 7 months",
        "See if you're pre-approved instantly with no score impact",
        "Reports to all three major bureaus to help grow your score",
        "$0 - $39 annual fee based on your specific credit profile",
      ],
      buttonLink: "#",
      buttonText: "Check Pre-Approval",
      ratingsNumber: "8.4",
      ratingsCount: 5,
      logo: "/logos/indigo-logo.avif",
      logoWidth: "100px",
      logoHeight: "35px",
      creditCardImage: "/credit-cards/mission-lane-credit-card.avif",
      badgeText: "NO SECURITY DEPOSIT",
      badgeIcon: "card",
      advertiserName: "Mission Lane",
    },
    {
      heading: "Capital One Platinum Credit Card",
      description:
        "The reliable, no annual fee choice for establishing your credit history.",
      features: [
        "$0 annual fee and no hidden foreign transaction fees",
        "Be considered for a higher credit limit in as little as 6 months",
        "Includes free credit monitoring tools through CreditWise",
        "Accepted at millions of locations worldwide via Mastercard",
      ],
      buttonLink: "#",
      buttonText: "Apply Now",
      ratingsNumber: "7.8",
      ratingsCount: 5,
      logo: "/logos/milestone-logo.avif",
      logoWidth: "120px",
      logoHeight: "28px",
      creditCardImage: "/credit-cards/capital-one-credit-card.avif",
      badgeText: "NO ANNUAL FEE",
      badgeIcon: "card-up",
      advertiserName: "Capital One",
    },
  ];

  return (
    <div className="bg-white flex flex-col items-start min-h-screen w-full ">
      {/* Header */}
      <PlainPageHeader
        title={"Best credit cards of December 2025"}
        headingFont="text-3xl text-center lg:text-[48px] font-bold text-primary-main"
        subtitle="High credit card interest can strain a fixed income. Compare 0% intro APR and balance transfer credit cards that may help reduce interest, consolidate debt, and manage monthly expenses."
        updatedAt={"Updated December 30, 2025"}
      />

      {/* Cards */}
      <div className="flex flex-col items-center w-full px-6 sm:px-6 md:px-16 pb-6 sm:pb-8 md:pb-12">
        <div className="w-full max-w-[970px] ">
          <div className="flex flex-col gap-4">
            {cardData?.map((item, index) => (
              <AdsWallCards
                key={index}
                {...item}
                affiliateId={affiliateId}
                transactionId={transactionId}
              />
            ))}
          </div>
        </div>
      </div>

      {/* <div className="text-general-muted-foreground text-xs leading-relaxed space-y-4 max-w-[970px] mx-auto mb-10 px-6 lg:px-0">
        <h3 className="text-base font-semibold mb-4">Full Disclaimers</h3>
        <div
          className="space-y-4"
          dangerouslySetInnerHTML={{
            __html: `
              <div>
                <strong>Chime<sup>&reg;</sup> Checking Account</strong>
                <ul class="list-disc list-outside pl-5 mt-2 space-y-1">
                  <li>Terms apply. Limited time only, must open the new account and complete qualifying activities to earn 3 individual rewards, up to a max of $350.00. See <a href="https://www.chime.com/policies/newmemberofferv3" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">https://www.chime.com/policies/newmemberofferv3</a> for details.</li>
                  <li><strong>Chime is recommended by more of its users in the 2024 Qualtrics® NPS study when compared to top national banks and select fintechs. THE #1 MOST LOVED BANKING APP is a Registered Trademark of Chime Financial, Inc.</strong></li>
                  <li>Early access to direct deposit funds depends on the timing of the submission of the payment file from the payer. We generally make these funds available on the day the payment file is received, which may be up to 2 days earlier than the scheduled payment date.</li>
                  <li>SpotMe<sup>&reg;</sup> eligibility requires $200 or more in qualifying direct deposits to your Chime Checking Account each month. Qualifying members will be allowed to overdraw their account up to $20 in total, but may be eligible for a higher combined limit of up to $200 or more. Although there are no overdraft fees, there may be out-of-network or third-party fees associated with ATM transactions. See SpotMe Terms and Conditions for details.</li>
                </ul>
              </div>
              
              <div>
                <strong>Chime Card<sup>&trade;</sup></strong>
                <ul class="list-disc list-outside pl-5 mt-2 space-y-1">
                 <li>No minimum balance required. Must have $0.01 in savings to earn interest.</li>
                 <li>Out-of-network ATM withdrawal and over-the-counter advance fees may apply except at MoneyPass ATMs in a 7-Eleven, or any Allpoint or Visa Plus Alliance ATM.</li>
                 <li>The secured Chime Card<sup>&trade;</sup> is issued by The Bancorp Bank, N.A. or Stride Bank, N.A., Members FDIC, pursuant to a license from Visa U.S.A. Inc. and may be used everywhere Visa credit cards are accepted. Please see the back of your card for its issuing bank. Chime is a financial technology company, not a bank. Banking services provided by The Bancorp Bank, N.A. or Stride Bank, N.A., Members FDIC. Chime® Checking Account required to apply.</li>
                </ul>
              </div>
              
              <div>
                <strong>Indigo Mastercard<sup>&reg;</sup> & Milestone Mastercard<sup>&reg;</sup></strong>
                <ul class="list-disc list-outside pl-5 mt-2 space-y-1">
                  <li> The Indigo/Milestone Mastercard reports your payment and account history to the three major credit bureaus and can help you build your credit history. Credit bureaus reflect a variety of factors in your credit history, such as payment patterns, utilization, derogatory marks, account age, total number of accounts, and inquiries. Not all factors are equally weighted. Responsible use and a consistent history of good standing and on-time payments are often key components of good credit and what lenders look at to determine whom they approve for credit.</li>
                </ul>
              </div>
              
              <div>
                <strong>SoFi Unlimited 2% Credit Card</strong>
                <ul class="list-disc list-outside pl-5 mt-2 space-y-1">
                 <li><strong>Earn a $200 statement credit welcome bonus after you spend $2,000 in purchases in the first 3 months of account opening.</strong></li>
                 <li><strong>Cell Phone Insurance Protection, Mastercard ID Theft Protection™, Lyft and Other Partner Rewards have additional terms and conditions, which can all be accessed through the World Elite Mastercard<sup>&reg;</sup> Benefits portal.</strong></li>
                 <li>Earn 2 points per $1 spent. Redeem at 1 cent per point value when deposited into SoFi Checking and Savings, invested, or applied to eligible SoFi loans. Redeem at 0.5 cent per point for statement credit.</li>
                 <li>Chime<sup>&reg;</sup> is a financial technology company, not a bank. Banking services provided by The Bancorp Bank, N.A. or Stride Bank, N.A., Members FDIC.</li>
                 <li>This is an advertisement. You are receiving this message because you opted in to receive information about financial products. Review terms and conditions carefully before applying.</li>
                </ul>
              </div>

              <div>
                <strong>How we make money</strong>
                <p class="mt-2">
                  <a href="https://sagewise.net" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Sagewise.net</a> is an independent, advertising-supported publisher and comparison service. Our websites may earn compensation when a customer clicks on a link, when an application is approved, or when an account is opened. Therefore, this compensation may impact what products appear and how, where, and in what order they appear within listing categories, except where prohibited by law for our mortgage, home equity and other home lending products. Other factors, such as our proprietary website rules and whether a product is offered in your area or at your self-selected credit score range, can also impact how and where products appear on this site. While we strive to provide a wide range of offers, Sagewise does not include information about every financial or credit product or service.
                </p>
              </div>
            `,
          }}
        />
      </div> */}
    </div>
  );
};

export default AdsWallTwoTemplate;
