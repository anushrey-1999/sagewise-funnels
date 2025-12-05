import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Facebook, Linkedin, Twitter, Instagram, Youtube } from "lucide-react";
import { Typography } from "./ui/typography";
import Link from "next/link";

const footerLinks = [
  { label: "Legal Overview", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Your Privacy Choices", href: "#" },
  { label: "State Law Privacy Notice", href: "#" },
  { label: "Security", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Licenses & Disclosures", href: "#" },
  { label: "Do Not Call & Consent to Contact", href: "#" },
  { label: "SMS Terms & Conditions", href: "#" },
  { label: "Unsubscribe", href: "#" },
  { label: "Vulnerability Disclosure Program", href: "#" },
  { label: "Accessibility Statement", href: "#" },
];

export function Footer() {
  return (
    <div className="bg-[#204c4b] flex flex-col gap-4 sm:gap-4 md:gap-4 p-8 sm:p-10 md:p-16 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
        <Logo color="white" />
        {/* <div className="flex gap-3">
          {[Facebook, Linkedin, Twitter, Instagram, Youtube].map(
            (Icon, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className="bg-white/10 border border-general-border hover:bg-white/20 h-10 w-10"
              >
                <Icon className="h-4 w-4 text-white" />
              </Button>
            )
          )}
        </div> */}
      </div>

      {/* <div className="h-px bg-primary-light w-full hidden md:block" /> */}
{/* 
      <Typography
        variant="p"
        color="text-general-primary-foreground"
        className="text-[10px] lg:text-xs tracking-[0.5px]"
      >
        Independent service. Sagewise is an independent, advertising-supported
        comparison service. We are not affiliated with, endorsed by, or acting
        on behalf of HUD, FHA, VA, or any government agency. Content is for
        educational purposes only and is not legal, tax, or financial advice.
        Rates, fees, terms, and product availability are subject to change
        without notice and may vary by lender and borrower profile. <br />{" "}
        <br />
        Sagewise is not a consumer reporting agency under the Fair Credit
        Reporting Act (FCRA) and does not furnish consumer reports. Lenders make
        credit decisions using their own criteria. <br /> <br />
        Consent to contact. By submitting your information, you agree that
        Sagewise and participating lenders and affiliates may contact you at the
        phone number and email you provide using live agents, autodialers,
        artificial/prerecorded voice, SMS/MMS, instant messaging, or email, even
        if your number is on a Do Not Call list. Consent is not required to
        obtain credit or services. Message & data rates may apply. Frequency
        varies. Reply STOP to opt out of SMS; HELP for help. Use the
        "unsubscribe" link in any email to opt out of marketing emails. We
        maintain internal Do Not Call lists and honor applicable laws. If you
        opt out, we may still send transactional/service messages.
      </Typography> */}

      <div className="h-px bg-primary-light w-full " />

      <div className="text-white text-xs leading-relaxed space-y-4">
        {/* <h3 className="text-base font-semibold mb-4">Full Disclaimers</h3> */}
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
                  <a href="https://sagewise.com" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Sagewise.com</a> is an independent, advertising-supported publisher and comparison service. Our websites may earn compensation when a customer clicks on a link, when an application is approved, or when an account is opened. Therefore, this compensation may impact what products appear and how, where, and in what order they appear within listing categories, except where prohibited by law for our mortgage, home equity and other home lending products. Other factors, such as our proprietary website rules and whether a product is offered in your area or at your self-selected credit score range, can also impact how and where products appear on this site. While we strive to provide a wide range of offers, Bankrate does not include information about every financial or credit product or service.
                </p>
              </div>
            `,
          }}
        />
      </div>

      <div className="h-px bg-primary-light w-full " />
      <div className="flex md:flex-col gap-6 md:gap-2">
        <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 text-xs text-general-primary-foreground underline">
          {footerLinks.slice(0, 7).map((link, index) => (
            <Link key={index} href={link.href} className="hover:text-white/80">
              {link.label}
            </Link>
          ))}
        </div>


        <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 text-xs text-general-primary-foreground underline">
          {footerLinks.slice(7).map((link, index) => (
            <Link key={index} href={link.href} className="hover:text-white/80">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <Typography
        variant="p"
        color="text-primary-light"
        className="text-[10px] md:text-xs  tracking-[0.5px]"
      >
        © Copyright 2025, Sagewise® • All Rights Reserved • 4376 Forestdale
        Drive #4, Park City, UT 84098 US
      </Typography>
    </div>
  );
}
