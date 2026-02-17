import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  color?: "primary" | "white";
  type?: "wordmark" | "logomark";
  href?: string;
};

const imgColorWhiteTypeWordmark = "/sagewise-logo.png";
const imgColorPrimaryTypeWordmark = ""

export function Logo({ className, color = "primary", type = "wordmark", href = "/" }: LogoProps) {
  const src = color === "white" && type === "wordmark" 
    ? imgColorWhiteTypeWordmark 
    : imgColorPrimaryTypeWordmark;

  return (
    <div className={className}>
      <Link href={href}>
        <Image
          src={src}
          alt="Sagewise Logo"
          width={169}
          height={35}
          className="h-[35px] w-[169px]"
        />
      </Link>
    </div>
  );
}

