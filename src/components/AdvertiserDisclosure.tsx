"use client";

import React, { useEffect, useRef, useState } from "react";

// NOTE: This copy is intentionally kept identical to the legacy footer
// "Advertiser Disclosure" overlay, so we can reuse it in the header too.
const disclosureText = `<a href="https://sagewise.com" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">Sagewise.com</a> is an independent, advertising-supported publisher and comparison service. Our websites may earn compensation when a customer clicks on a link, when an application is approved, or when an account is opened. Therefore, this compensation may impact what products appear and how, where, and in what order they appear within listing categories, except where prohibited by law for our mortgage, home equity and other home lending products. Other factors, such as our proprietary website rules and whether a product is offered in your area or at your self-selected credit score range, can also impact how and where products appear on this site. While we strive to provide a wide range of offers, Bankrate does not include information about every financial or credit product or service.`;

type Placement = "top" | "bottom";

export default function AdvertiserDisclosure({
  placement = "bottom",
  className = "",
}: {
  placement?: Placement;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // If clicking on trigger, let the trigger handler toggle.
      if (triggerRef.current && triggerRef.current.contains(target)) return;

      // Close if clicking outside the disclosure container.
      if (isOpen && containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const showPopover = isHovered || isOpen;

  const popoverPositionClasses =
    placement === "top"
      ? "left-1/2 -translate-x-1/2 bottom-full mb-2"
      : "right-0 top-full mt-2";

  return (
    <div
      ref={containerRef}
      className={`relative z-1000 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        ref={triggerRef}
        className="text-black underline hover:text-gray-600 cursor-pointer"
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-expanded={showPopover}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setIsOpen(false);
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((v) => !v);
          }
        }}
      >
        Advertiser Disclosure
      </span>

      {showPopover && (
        <div
          role="dialog"
          aria-label="Advertiser Disclosure"
          className={`absolute ${popoverPositionClasses} w-[90vw] max-w-[600px] bg-white rounded-lg shadow-2xl z-1000 overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            <div className="text-sm font-semibold text-black mb-2">
              Advertiser Disclosure
            </div>
            <div
              className="text-black text-sm leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: disclosureText }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

