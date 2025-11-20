import Image from "next/image";

type LogoProps = {
  className?: string;
  color?: "primary" | "white";
  type?: "wordmark" | "logomark";
};

const imgColorWhiteTypeWordmark = "http://localhost:3845/assets/ddc796417f3284bb651e2d6435726ff51199336d.svg";
const imgColorPrimaryTypeWordmark = "http://localhost:3845/assets/ada122cf4b45bfea79ed76c36ee7b15f7a50c6eb.svg";

export function Logo({ className, color = "primary", type = "wordmark" }: LogoProps) {
  const src = color === "white" && type === "wordmark" 
    ? imgColorWhiteTypeWordmark 
    : imgColorPrimaryTypeWordmark;

  return (
    <div className={className}>
      <Image
        src={src}
        alt="Sagewise Logo"
        width={169}
        height={35}
        className="h-[35px] w-[169px]"
      />
    </div>
  );
}

