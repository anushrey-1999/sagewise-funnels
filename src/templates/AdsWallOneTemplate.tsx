"use client";

import AdsWallCards from "@/organisms/AdsWallCards";
import PlainPageHeader from "@/organisms/PlainPageHeader";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const AdsWallOneTemplate = () => {
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
      heading: "Chime Card<sup>&trade;</sup>",
      description:
        "Help build credit with your own money. No credit check, no annual fee, and no interest.",
      features: [
        "No credit check to apply",
        "No annual fees or interest",
        "Earn 1.5% cash back on rotating categories with direct deposit",
        "No minimum security deposit required",
      ],
      buttonLink:
        "https://lkd7vx3a.com/?E=BoniqlAkcXgZGXxI%2fhpBCsz6l05hPQ0P&s1=",
      buttonText: "Apply Now",
      ratingsNumber: "8.2",
      ratingsCount: 5,
      logo: "/logos/chime-logo.avif",
      logoWidth: "120px",
      logoHeight: "40px",
      creditCardImage: "/credit-cards/chime-credit-card.avif",
      badgeText: "NO CREDIT CHECK",
      badgeIcon: "no-card",
      advertiserName: "Chime",
    },
    {
      heading: "Indigo Platinum Mastercard&reg;",
      description:
        "Unsecured credit card for rebuilding credit with no security deposit required.",
      features: [
        "No security deposit required",
        "Reports to all three credit bureaus",
        "Pre-qualification available",
        "Quick online application process",
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
      badgeIcon: "card",
      advertiserName: "Indigo",
    },
    {
      heading: "Milestone Mastercard&reg;",
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
      badgeIcon: "card-up",
      advertiserName: "Milestone",
    },
    {
      heading: "Aspire&reg; Cash Back Rewards Mastercard",
      description:
        "Earn Cash Back Rewards - 3% on Eligible Gas, Groceries, and Utilities, and 1% on All Other Eligible Purchases",
      features: [
        "Up to $1,000 Credit Limit Subject to Credit Approval",
        "No Security Deposit",
        "Prequalify Without Affecting your Credit Score",
      ],
      buttonLink: "#",
      buttonText: "See if you prequalify",
      isDifferentBorder: false,
      ratingsNumber: "9.2",
      ratingsCount: 5,
      logo: "/logos/chime-logo.avif",
      logoWidth: "120px",
      logoHeight: "40px",
      creditCardImage: "/credit-cards/aspire-credit-card.avif",
      badgeText: "No Security Deposit",
      badgeIcon: "percentage",
      advertiserName: "Aspire",
    },
    {
      heading: "Fortiva&reg; Cash Back Rewards Mastercard",
      description:
        "Earn Cash Back Rewards - 3% on Eligible Gas, Groceries, and Utilities, and 1% on All Other Eligible Purchases",
      features: [
        "Up to $1,000 Credit Limit Subject to Credit Approval",
        "No Security Deposit",
        "Prequalify Without Affecting your Credit Score",
      ],
      buttonLink: "#",
      buttonText: "See if you prequalify",
      isDifferentBorder: false,
      ratingsNumber: "9.2",
      ratingsCount: 5,
      logo: "/logos/chime-logo.avif",
      logoWidth: "120px",
      logoHeight: "40px",
      creditCardImage: "/credit-cards/fortiva-credit-card.avif",
      badgeText: "No Security Deposit",
      badgeIcon: "percentage",
      advertiserName: "Fortiva",
    },
    // {
    //   heading: "Chime&reg; Checking Account and Chime Visa Debit Card",
    //   description:
    //     "New Account Sign Up Bonus - Get up to $350 with a new Chime Checking Account",
    //   features: [
    //     "No monthly fees",
    //     "No overdraft fees",
    //     "No minimum balance requirement",
    //     "No foreign transaction fees",
    //   ],
    //   buttonLink: "https://rdtrk.net/?E=1egYypV%2bSugQJBKPOGc8fsz6l05hPQ0P&s1=",
    //   buttonText: "Open Account",
    //   isDifferentBorder: true,
    //   ratingsNumber: "9.5",
    //   ratingsCount: 5,
    //   logo: "/logos/chime-logo.avif",
    //   logoWidth: "120px",
    //   logoHeight: "40px",
    //   creditCardImage: "/credit-cards/chime-checking-debit-card.avif",
    //   badgeText: "$350 BONUS OFFER",
    //   badgeIcon: "percentage",
    //   advertiserName: "Chime",
    // },
    // {
    //   heading: "The Secured Self Visa&reg; Credit Card",
    //   description: "The Secured Card for Better Credit",
    //   features: [
    //     "&ast;$0 annual fee for the first year, $25 annual fee thereafter",
    //     "No hard credit check or credit score required",
    //     "Reports to all 3 major credit bureaus to build credit history",
    //   ],
    //   buttonLink: "https://ir.self.inc/c/2191982/689941/10159",
    //   buttonText: "Open Account",
    //   isDifferentBorder: false,
    //   ratingsNumber: "9.2",
    //   ratingsCount: 5,
    //   logo: "/logos/chime-logo.avif",
    //   logoWidth: "120px",
    //   logoHeight: "40px",
    //   creditCardImage: "/credit-cards/self-credit-card.avif",
    //   badgeText: "No Credit Check",
    //   badgeIcon: "percentage",
    //   advertiserName: "Self",
    // },
    // {
    //   heading: "Fortiva&reg; Cash Back Rewards Mastercard",
    //   description:
    //     "Earn Cash Back Rewards - 3% on Eligible Gas, Groceries,and Utilities, and 1% on All Other Eligible Purchases",
    //   features: [
    //     "&ast;$0 annual fee for the first year, $25 annual fee thereafter",
    //     "No hard credit check or credit score required",
    //     "Reports to all 3 major credit bureaus to build credit history",
    //   ],
    //   buttonLink: "https://ir.self.inc/c/2191982/689941/10159",
    //   buttonText: "Open Account",
    //   isDifferentBorder: false,
    //   ratingsNumber: "9.2",
    //   ratingsCount: 5,
    //   logo: "/logos/chime-logo.avif",
    //   logoWidth: "120px",
    //   logoHeight: "40px",
    //   creditCardImage: "/credit-cards/self-credit-card.avif",
    //   badgeText: "BONUS OFFER",
    //   badgeIcon: "percentage",
    //   advertiserName: "Self",
    // },
  ];

  return (
    <div className="bg-white flex flex-col items-start min-h-screen w-full ">
      {/* Header */}
      <PlainPageHeader
        title={"Best credit cards of January 2026"}
        headingFont="text-3xl text-center lg:text-[48px] font-bold text-primary-main"
        subtitle="High credit card interest can strain a fixed income. Compare 0% intro APR and balance transfer credit cards that may help reduce interest, consolidate debt, and manage monthly expenses."
        updatedAt={"Updated January 06, 2026"}
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

      <div className="text-general-muted-foreground text-xs leading-relaxed space-y-4 max-w-[970px] mx-auto mb-10 px-6 lg:px-0">
        <h3 className="text-base font-semibold mb-4">Full Disclaimers</h3>
        <div
          className="space-y-4"
          dangerouslySetInnerHTML={{
            __html: `
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
                <strong>Aspire<sup>&reg;</sup></strong>
                <p>
                Cash Back Rewards Disclosure: You will earn 3% cash back rewards when you use 
                your credit card for eligible gas and grocery purchases and utility bill payments.
                 You will earn 1% cash back rewards when you use your credit card for other eligible purchases of goods and services and bill payments. Rewards will be earned when the transaction posts to your account and will remain as long as the purchases and bill payments are not returned or credited. Purchases do NOT include fees or interest charges, balance transfers, cash advances, or purchases of other cash equivalents. Rewards are not earned for pending transactions. Review the Cash Back Rewards Program Terms for important information about the cash back rewards program.
                </p>
              </div>


               <div>
                <strong>Fortiva<sup>&reg;</sup></strong>
                <p>
                  Cash Back Rewards Disclosure: You will earn 3% cash back rewards when you use your credit card for eligible gas and grocery purchases and utility bill payments. You will earn 1% cash back rewards when you use your credit card for other eligible purchases of goods and services and bill payments. Rewards will be earned when the transaction posts to your account and will remain as long as the purchases and bill payments are not returned or credited. Purchases do NOT include fees or interest charges, balance transfers, cash advances, or purchases of other cash equivalents. Rewards are not earned for pending transactions. Review the Cash Back Rewards Program Terms for important information about the cash back rewards program.
                </p>
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
      </div>
    </div>
  );
};

export default AdsWallOneTemplate;
