"use client";

import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Menu, Phone } from "lucide-react";
import { Typography } from "./ui/typography";
import { useState, useEffect, useRef } from "react";

export function Navbar() {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const disclosureRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLParagraphElement>(null);

  const disclosureText = `<a href="https://sagewise.com" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Sagewise.com</a> is an independent, advertising-supported publisher and comparison service. Our websites may earn compensation when a customer clicks on a link, when an application is approved, or when an account is opened. Therefore, this compensation may impact what products appear and how, where, and in what order they appear within listing categories, except where prohibited by law for our mortgage, home equity and other home lending products. Other factors, such as our proprietary website rules and whether a product is offered in your area or at your self-selected credit score range, can also impact how and where products appear on this site. While we strive to provide a wide range of offers, Bankrate does not include information about every financial or credit product or service.`;

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
    <div className="bg-[#204c4b] flex items-center justify-between px-6 sm:px-6 py-3 sm:py-4 md:p-6 w-full relative">
      {/* <Button
        variant="ghost"
        size="icon"
        className="bg-white/10 border border-white/10 hover:bg-white/20 h-10 w-10 shrink-0 absolute left-6 sm:absolute sm:left-6 lg:relative lg:left-0 z-10"
      >
        <Menu className="h-4 w-4 text-white" />
      </Button> */}
      <div className="shrink-0 flex justify-center lg:justify-start items-center">
        <Logo color="white" />
      </div>
      {/* <Button className="hidden sm:flex border bg-primary-main text-white border-gray-200 h-10 px-3 sm:px-4">
        <Phone className="h-3.5 w-3.5 mr-2" />
        <span className="text-sm sm:text-base font-medium">1-833-906-2737</span>
      </Button> */}

      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={disclosureRef}
      >
        <Typography 
          ref={triggerRef}
          variant="p" 
          className="text-general-border hover:text-white transition-all duration-300 cursor-pointer text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setIsMobileOpen(!isMobileOpen);
          }}
        >
          Advertiser Disclosure
        </Typography>
        
        {(isHovered || isMobileOpen) && (
          <div 
            className="absolute right-0 top-full mt-2 w-[90vw] max-w-[600px] bg-white rounded-lg shadow-2xl z-50 overflow-hidden"
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
  );
}

