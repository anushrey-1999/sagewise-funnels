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
