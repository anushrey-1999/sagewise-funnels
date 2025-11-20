import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Facebook, Linkedin, Twitter, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <div className="bg-[#204c4b] flex flex-col gap-4 sm:gap-4 md:gap-4 p-8 sm:p-10 md:p-16 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
        <Logo color="white" />
        <div className="flex gap-3">
          {[Facebook, Linkedin, Twitter, Instagram, Youtube].map((Icon, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className="bg-white/10 border border-white/10 hover:bg-white/20 h-10 w-10"
            >
              <Icon className="h-4 w-4 text-white" />
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-px bg-[#4d706f] w-full" />
      
      <div className="text-white text-[10px] sm:text-[11px] md:text-xs leading-[1.3] sm:leading-[1.4] md:leading-4.5 space-y-3">
        <p>
          Independent service. Sagewise is an independent, advertising-supported comparison service. We are not affiliated with, endorsed by, or acting on behalf of HUD, FHA, VA, or any government agency. Content is for educational purposes only and is not legal, tax, or financial advice. Rates, fees, terms, and product availability are subject to change without notice and may vary by lender and borrower profile.
        </p>
        <p>
          Sagewise is not a consumer reporting agency under the Fair Credit Reporting Act (FCRA) and does not furnish consumer reports. Lenders make credit decisions using their own criteria.
        </p>
        <p>
          Consent to contact. By submitting your information, you agree that Sagewise and participating lenders and affiliates may contact you at the phone number and email you provide using live agents, autodialers, artificial/prerecorded voice, SMS/MMS, instant messaging, or email, even if your number is on a Do Not Call list. Consent is not required to obtain credit or services. Message & data rates may apply. Frequency varies. Reply STOP to opt out of SMS; HELP for help. Use the "unsubscribe" link in any email to opt out of marketing emails. We maintain internal Do Not Call lists and honor applicable laws. If you opt out, we may still send transactional/service messages.
        </p>
      </div>
      
      <div className="h-px bg-[#4d706f] w-full" />
      
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3 md:gap-4 text-xs text-white underline">
        <a href="#" className="hover:text-white/80">Legal Overview</a>
        <a href="#" className="hover:text-white/80">Privacy Policy</a>
        <a href="#" className="hover:text-white/80">Your Privacy Choices</a>
        <a href="#" className="hover:text-white/80">State Law Privacy Notice</a>
        <a href="#" className="hover:text-white/80">Security</a>
        <a href="#" className="hover:text-white/80">Terms of Use</a>
        <a href="#" className="hover:text-white/80">Licenses & Disclosures</a>
        <a href="#" className="hover:text-white/80">Do Not Call & Consent to Contact</a>
        <a href="#" className="hover:text-white/80">SMS Terms & Conditions</a>
        <a href="#" className="hover:text-white/80">Unsubscribe</a>
        <a href="#" className="hover:text-white/80">Vulnerability Disclosure Program</a>
        <a href="#" className="hover:text-white/80">Accessibility Statement</a>
      </div>
      
      <p className="text-[10px] sm:text-[11px] md:text-xs text-[#4d706f] leading-[1.3] sm:leading-[1.4] md:leading-normal">
        © Copyright 2025, Sagewise® • All Rights Reserved • 4376 Forestdale Drive #4, Park City, UT 84098 US
      </p>
    </div>
  );
}

