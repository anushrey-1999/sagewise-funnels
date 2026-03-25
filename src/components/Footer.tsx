import { Logo } from "./Logo";
import { Typography } from "./ui/typography";
import Link from "next/link";

const footerLinks = [
  { label: "Legal Overview", href: "https://sagewise.net/legal-overview/" },
  { label: "Privacy Policy", href: "https://sagewise.net/privacy-policy/" },
  {
    label: "Your Privacy Choices",
    href: "https://sagewise.net/your-privacy-choices/",
  },
  {
    label: "State Law Privacy Notice",
    href: "https://sagewise.net/state-law-privacy-notice/",
  },
  { label: "Security", href: "https://sagewise.net/security/" },
  { label: "Terms of Use", href: "https://sagewise.net/terms-of-use/" },
  {
    label: "Licenses & Disclosures",
    href: "https://sagewise.net/licenses-disclosures/",
  },
  {
    label: "Do Not Call & Consent to Contact",
    href: "https://sagewise.net/do-not-call-consent-to-contact/",
  },
  {
    label: "SMS Terms & Conditions",
    href: "https://sagewise.net/sms-terms-conditions/",
  },
  { label: "Unsubscribe", href: "https://sagewise.net/unsubscribe/" },
  {
    label: "Vulnerability Disclosure Program",
    href: "https://sagewise.net/vulnerability-disclosure-program/",
  },
  {
    label: "Accessibility Statement",
    href: "https://sagewise.net/accessibility-statement/",
  },
];

export function Footer() {
  return (
    <div className="bg-[#204c4b] flex flex-col gap-4 sm:gap-4 md:gap-4 p-6 sm:p-10 md:p-16 w-full">
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
              Independent service. Sagewise is an independent, advertising-supported comparison service. We are not affiliated with, endorsed by, or acting on behalf of HUD, FHA, VA, or any government agency. Content is for educational purposes only and is not legal, tax, or financial advice. Rates, fees, terms, and product availability are subject to change without notice and may vary by lender and borrower profile. </br></br>

              Sagewise is not a consumer reporting agency under the Fair Credit Reporting Act (FCRA) and does not furnish consumer reports. Lenders make credit decisions using their own criteria. </br></br>

              Consent to contact. By submitting your information, you agree that Sagewise and participating lenders and affiliates may contact you at the phone number and email you provide using live agents, autodialers, artificial/prerecorded voice, SMS/MMS, instant messaging, or email, even if your number is on a Do Not Call list.Consent is not required to obtain credit or services. Message & data rates may apply. Frequency varies. Reply STOP to opt out of SMS; HELP for help. Use the “unsubscribe” link in any email to opt out of marketing emails. We maintain internal Do Not Call lists and honor applicable laws. If you opt out, we may still send transactional/service messages.
              </div>
            `,
          }}
        />
      </div>

      <div className="h-px bg-primary-light w-full " />
      <div className="flex md:flex-col gap-6 md:gap-2">
        <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 text-xs text-general-primary-foreground underline">
          {footerLinks.slice(0, 7).map((link, index) => (
            <Link
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-4 text-xs text-general-primary-foreground underline">
          {footerLinks.slice(7).map((link, index) => (
            <Link
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80"
            >
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
        © Copyright 2026, Sagewise® • All Rights Reserved
      </Typography>
      <Typography
        variant="p"
        color="text-primary-light"
        className="text-[10px] md:text-xs  tracking-[0.5px] mt-1"
      >
        C3 Data LLC dba Massive and Co | 4376 Forestdale Drive #4 Park City, UT
        84098
      </Typography>
    </div>
  );
}
