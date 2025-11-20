import { Suspense } from "react";
import { Home } from "@/components/Home";

function HomePageContent() {
  return (
    <div className="bg-[#f5f5f5] w-full">
      <Home />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="bg-[#f5f5f5] flex items-center justify-center min-h-[calc(100vh-176px)] w-full">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
