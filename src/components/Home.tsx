"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleGetQuote = () => {
    // Get funnel from search params
    const funnel = searchParams.get("funnel");
    
    // If funnel is specified, go to form with that funnel
    // Otherwise, go to default form
    if (funnel) {
      router.push(`/form?funnel=${funnel}`);
    } else {
      router.push("/form");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-176px)] w-full px-4">
      <div className="flex flex-col items-center gap-8 max-w-2xl text-center">
        <h1 className="font-semibold leading-tight text-4xl sm:text-5xl md:text-6xl text-foreground tracking-tight">
          Homepage
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-md">
          Get started on your journey to find the perfect solution for your needs.
        </p>
        <Button
          onClick={handleGetQuote}
          className="bg-[#204c4b] hover:bg-[#204c4b]/90 text-white px-8 text-lg font-medium"
        >
          <span>Get your quote</span>
          <ArrowRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

