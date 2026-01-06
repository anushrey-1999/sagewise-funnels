"use client";

import AdsWallCards from "@/organisms/AdsWallCards";
import PlainPageHeader from "@/organisms/PlainPageHeader";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const AdsWallThreeTemplate = () => {
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
      heading: "Citi&reg; Double Cash Card",
      description:
        "Earn 2% cash back on every purchase—1% when you buy and 1% as you pay.",
      features: [
        "Earn unlimited 1.5% - 2% cash back on all eligible purchases",
        "No categories to track and no caps on the amount you can earn",
        "0% intro APR on balance transfers for 18 months",
        "$0 annual fee gives you a premium rewards rate for free",
      ],
      buttonLink:
        "#",
      buttonText: "Apply Now",
      ratingsNumber: "9.5",
      ratingsCount: 5,
      logo: "/logos/chime-logo.avif",
      logoWidth: "120px",
      logoHeight: "40px",
      creditCardImage: "/credit-cards/citibank-double-cash-credit-card.avif",
      badgeText: "UNLIMITED CASH BACK",
      badgeIcon: "no-card",
      advertiserName: "Chime",
    },
    {
      heading: "Wells Fargo Active Cash&reg;",
      description:
        "A simple, unlimited 2% cash rewards card with no categories to track.",
      features: [
        "Earn a $200 cash rewards bonus after you spend $500 in 3 months",
        "Unlimited 2% cash rewards on every purchase, everywhere",
        "Up to $600 of cell phone protection against damage or theft",
        "0% intro APR on purchases and balance transfers for 12 months",
      ],
      buttonLink: "#",
      buttonText: "Check Pre-Approval",
      ratingsNumber: "9.3",
      ratingsCount: 5,
      logo: "/logos/indigo-logo.avif",
      logoWidth: "100px",
      logoHeight: "35px",
      creditCardImage: "/credit-cards/active-cash-credit-card.avif",
      badgeText: "TOP RATED: 2% BACK",
      badgeIcon: "card",
      advertiserName: "Active",
    },
    {
      heading: "Blue Cash Everyday&reg; (Amex)",
      description:
        "Earn 3% cash back on daily essentials like groceries and online shopping.",
      features: [
        "3% cash back at U.S. supermarkets and U.S. online retail stores",
        "Earn a $200 statement credit after spending $2,000 in 6 months",
        "Up to $154 in annual credits for Disney Bundle and Home Chef",
        "Check if you are approved with no impact to your credit score",
      ],
      buttonLink: "#",
      buttonText: "Apply Now",
      ratingsNumber: "9.1",
      ratingsCount: 5,
      logo: "/logos/milestone-logo.avif",
      logoWidth: "120px",
      logoHeight: "28px",
      creditCardImage: "/credit-cards/amex-credit-card.avif",
      badgeText: "APPLY WITH CONFIDENCE",
      badgeIcon: "card-up",
      advertiserName: "Amex",
    },
    {
      heading: "Citi Simplicity&reg; Card",
      description:
        "The ideal card for debt consolidation with no late fees and 0% interest.",
      features: [
        "0% intro APR on balance transfers for 21 months from opening",
        "Never pay a late fee or penalty APR, even if you miss a payment",
        "Simple account management with $0 annual fee",
        "Flexible payment due dates to help align with your paychecks",
      ],
      buttonLink: "#",
      buttonText: "Open Account",
      isDifferentBorder: false,
      ratingsNumber: "8.7",
      ratingsCount: 5,
      logo: "/logos/chime-logo.avif",
      logoWidth: "120px",
      logoHeight: "40px",
      creditCardImage: "/credit-cards/citi-simplicity-credit-card.avif",
      badgeText: "0% APR: 21 MONTHS",
      badgeIcon: "percentage",
      advertiserName: "Citi",
    },
  ];

  return (
    <div className="bg-white flex flex-col items-start min-h-screen w-full ">
      {/* Header */}
      <PlainPageHeader
        title={"Best credit cards of January 2026"}
        headingFont="text-3xl text-center lg:text-[48px] font-bold text-primary-main"
        subtitle="High credit card interest can strain a fixed income. Compare 0% intro APR and balance transfer credit cards that may help reduce interest, consolidate debt, and manage monthly expenses."
        updatedAt={"Updated January 6, 2026"}
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

export default AdsWallThreeTemplate;
