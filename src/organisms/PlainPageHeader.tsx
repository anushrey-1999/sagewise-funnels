import { Typography } from "@/components/ui/typography";
import Image from "next/image";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  headingFont?: string; // Custom font classes for heading
  subheadingFont?: string; // Custom font classes for subheading
  updatedAt?: string;
  updatedAtFont?: string;
}
const PlainPageHeader = ({ title, subtitle, headingFont, subheadingFont, updatedAt, updatedAtFont }: PageHeaderProps) => {
  // Default font classes
  const defaultHeadingFont = "text-2xl lg:text-4xl text-center";
  const defaultSubheadingFont = "text-center font-normal text-base lg:text-[17px] lg:max-w-[62.5rem] text-[#8A8A8A]";
  const defaultUpdatedAtFont = "text-center font-normal text-sm lg:text-sm text-primary-light";
  return (
    <div className="flex items-center justify-center overflow-hidden relative rounded-bl-[24px] rounded-br-[24px] w-full py-5 px-8 md:py-10">
      <div className="flex flex-col gap-3 sm:gap-3 md:gap-3 items-center sm:px-8 md:px-16 z-10 w-full">
        <Typography
          variant="h2"
          className={headingFont || defaultHeadingFont}
          color="text-black"
        >
          {title || "Final Expense Insurance Quote Calculator"}
        </Typography>

        {subtitle && (
          <Typography
            variant="h4"
            className={subheadingFont || defaultSubheadingFont}
            color="text-black"
          >
            {subtitle || ""}
          </Typography>
        )}
        
        {updatedAt && (
          <Typography
            variant="h5"
            className={updatedAtFont || defaultUpdatedAtFont}
            color="text-black"
          >
            {updatedAt || ""}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default PlainPageHeader;
