"use client";

import Link from 'next/link';
import React from 'react'
import { Typography } from './ui/typography';

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

const MinimalFooter = () => {
  return (
    <div className='bg-white p-6 border-t border-general-border flex flex-col items-center gap-4'>
        <div className="text-center">
        <Typography
        variant="p"
        color="text-primary-light"
        className="text-[10px] md:text-xs  tracking-[0.5px]"
      >
        © Copyright 2026, Sagewise® • All Rights Reserved
      </Typography>
        </div>
        <div className="flex flex-col gap-3 items-center">
        <div className="flex flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs text-black underline items-center justify-center">
          {footerLinks.slice(0, 7).map((link, index) => (
            <Link
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 text-black"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs text-black underline items-center justify-center">
          {footerLinks.slice(7).map((link, index) => (
            <Link
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 text-black"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MinimalFooter