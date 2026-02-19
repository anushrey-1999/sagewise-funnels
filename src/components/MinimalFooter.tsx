"use client";

import Link from 'next/link';
import React from 'react'
import { Typography } from './ui/typography';
import AdvertiserDisclosure from "@/components/AdvertiserDisclosure";
import { usePathname } from "next/navigation";

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

const MinimalFooter = () => {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  const showDisclosureInFooter = !pathname?.startsWith("/adwall/");
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
            <Link key={index} href={link.href} className="hover:text-gray-600 text-black">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs text-black underline items-center justify-center">
          {footerLinks.slice(7).map((link, index) => (
            <Link key={index} href={link.href} className="hover:text-gray-600 text-black">
              {link.label}
            </Link>
          ))}
          {showDisclosureInFooter ? <AdvertiserDisclosure placement="top" /> : null}
        </div>
      </div>
    </div>
  )
}

export default MinimalFooter