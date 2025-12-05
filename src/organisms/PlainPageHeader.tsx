import { Typography } from "@/components/ui/typography";
import Image from "next/image";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}
const PlainPageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-center overflow-hidden relative rounded-bl-[24px] rounded-br-[24px] w-full py-5 px-8 md:py-10">
      <div className="flex flex-col gap-3 sm:gap-3 md:gap-3 items-center sm:px-8 md:px-16 z-10 w-full">
        <Typography variant="h2" className="text-2xl lg:text-4xl text-center" color="text-black">
          {title || "Final Expense Insurance Quote Calculator"}
        </Typography>
        <Typography variant="h5" className="text-center font-normal text-sm lg:text-sm" color="text-black">
          {subtitle ||
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
        </Typography>
      </div>
    </div>
  );
};

export default PlainPageHeader;
