"use client";

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react'
import { Typography } from './ui/typography';

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

const disclosureText = `<a href="https://sagewise.com" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Sagewise.com</a> is an independent, advertising-supported publisher and comparison service. Our websites may earn compensation when a customer clicks on a link, when an application is approved, or when an account is opened. Therefore, this compensation may impact what products appear and how, where, and in what order they appear within listing categories, except where prohibited by law for our mortgage, home equity and other home lending products. Other factors, such as our proprietary website rules and whether a product is offered in your area or at your self-selected credit score range, can also impact how and where products appear on this site. While we strive to provide a wide range of offers, Bankrate does not include information about every financial or credit product or service.`;

const MinimalFooter = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const disclosureRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  // Handle click outside to close overlay on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      // Don't close if clicking on the trigger text (it will toggle itself)
      if (triggerRef.current && triggerRef.current.contains(target)) {
        return;
      }
      // Close if clicking outside the disclosure container
      if (
        isMobileOpen &&
        disclosureRef.current &&
        !disclosureRef.current.contains(target)
      ) {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobileOpen]);
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
          <div 
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            ref={disclosureRef}
          >
            <span 
              ref={triggerRef}
              className="text-black underline hover:text-gray-600 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileOpen(!isMobileOpen);
              }}
            >
              Advertiser Disclosure
            </span>
            
            {(isHovered || isMobileOpen) && (
              <div 
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-[90vw] max-w-[600px] bg-white rounded-lg shadow-2xl z-50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4">    
                  <div 
                    className="text-black text-sm leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: disclosureText }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MinimalFooter