import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { Menu, Phone } from "lucide-react";

export function Navbar() {
  return (
    <div className="bg-[#204c4b] flex items-center justify-between px-6 sm:px-6 py-3 sm:py-4 md:p-6 w-full relative">
      <Button
        variant="ghost"
        size="icon"
        className="bg-white/10 border border-white/10 hover:bg-white/20 h-10 w-10 shrink-0 absolute left-6 sm:absolute sm:left-6 lg:relative lg:left-0 z-10"
      >
        <Menu className="h-4 w-4 text-white" />
      </Button>
      <div className="flex-1 flex justify-center lg:justify-start items-center lg:pl-6">
        <Logo color="white" />
      </div>
      <Button className="hidden sm:flex border bg-primary-main text-white border-gray-200 h-10 px-3 sm:px-4">
        <Phone className="h-3.5 w-3.5 mr-2" />
        <span className="text-sm sm:text-base font-medium">1-833-906-2737</span>
      </Button>
    </div>
  );
}

