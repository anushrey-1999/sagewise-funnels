"use client";

import { useState } from "react";
import { Loader } from "@/components/Loader";

export default function LoaderPreviewPage() {
  const [show, setShow] = useState(true);

  return (
    <>
      {show && (
        <Loader
          loaderText="Curating your HELOC matches..."
          onComplete={() => {}}
        />
      )}

      {/* Toggle button always on top */}
      <div className="fixed top-4 right-4 z-[9999]">
        <button
          onClick={() => setShow((v) => !v)}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors"
        >
          {show ? "Hide loader" : "Show loader"}
        </button>
      </div>
    </>
  );
}
