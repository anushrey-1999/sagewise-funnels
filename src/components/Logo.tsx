import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  color?: "primary" | "white";
  type?: "wordmark" | "logomark";
  href?: string;
  width?: number;
  height?: number;
  imgClassName?: string;
};

const imgColorWhiteTypeWordmark = "/sagewise-logo.png";
const imgColorPrimaryTypeWordmark = "/sagewise-logo.png";

// The source wordmark is white; on light backgrounds we tint it to brand sage.
const PRIMARY_WORDMARK_FILTER =
  "brightness(0) saturate(100%) invert(28%) sepia(18%) saturate(1080%) hue-rotate(128deg) brightness(88%) contrast(89%)";

export function Logo({ className, color = "primary", type = "wordmark", href = "/", width = 161, height = 35, imgClassName }: LogoProps) {
  const src = color === "white" && type === "wordmark" 
    ? imgColorWhiteTypeWordmark 
    : imgColorPrimaryTypeWordmark;

  const baseImgClassName =
    width === 161 && height === 35 ? "h-[35px] w-[161px]" : undefined;

  return (
    <div className={className}>
      <Link href={href}>
        <Image
          src={src}
          alt="Sagewise Logo"
          width={width}
          height={height}
          className={imgClassName ?? baseImgClassName}
          style={
            imgClassName
              ? color === "primary"
                ? { filter: PRIMARY_WORDMARK_FILTER }
                : undefined
              : {
                  width: `${width}px`,
                  height: `${height}px`,
                  ...(color === "primary" ? { filter: PRIMARY_WORDMARK_FILTER } : null),
                }
          }
        />
      </Link>
    </div>
  );
}

