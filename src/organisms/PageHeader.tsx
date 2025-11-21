import { Typography } from "@/components/ui/typography";
import Image from "next/image";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}
const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  return (
    <div className="bg-primary-dark flex  items-center justify-center overflow-hidden relative rounded-bl-[24px] rounded-br-[24px] w-full py-8 px-8 md:py-21">
      <div className="absolute left-0 top-0 h-full  sm:block">
        <Image
          src="/header-decorative.png"
          alt="Sagewise Logo Background"
          width={375}
          height={600}
          className="w-full h-full"
        />
      </div>
      <div className="flex flex-col gap-4 sm:gap-5 md:gap-6 items-center sm:px-8 md:px-16 z-10 w-full">
        <Typography variant="h2" className="text-3xl text-center">
          {title || "Final Expense Insurance Quote Calculator"}
        </Typography>
        <Typography variant="h5" className="text-center text-base">
          {subtitle ||
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
        </Typography>
      </div>
    </div>
  );
};

export default PageHeader;
