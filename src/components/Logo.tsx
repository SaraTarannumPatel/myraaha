import { Link } from "react-router-dom";
import logo from "@/assets/myraaha-logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Optional link target. If null, render a plain element (no link). */
  to?: string | null;
  showWordmark?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  wordmarkClassName?: string;
  variant?: "primary" | "muted" | "inverted";
}

const sizeMap = {
  xs: { img: "w-6 h-6", text: "text-base" },
  sm: { img: "w-8 h-8", text: "text-lg" },
  md: { img: "w-10 h-10", text: "text-xl sm:text-2xl" },
  lg: { img: "w-12 h-12 sm:w-14 sm:h-14", text: "text-2xl sm:text-3xl" },
  xl: { img: "w-16 h-16 sm:w-20 sm:h-20", text: "text-3xl sm:text-4xl" },
};

const Logo = ({
  to = "/",
  showWordmark = true,
  size = "md",
  className,
  wordmarkClassName,
  variant = "primary",
}: LogoProps) => {
  const sz = sizeMap[size];
  const wordmarkColor =
    variant === "inverted"
      ? "text-primary-foreground"
      : variant === "muted"
        ? "text-foreground"
        : "text-primary";

  const inner = (
    <span className={cn("inline-flex items-center gap-2 sm:gap-2.5 shrink-0", className)}>
      <img
        src={logo}
        alt="MyRaaha logo"
        className={cn(sz.img, "object-contain shrink-0 select-none")}
        draggable={false}
      />
      {showWordmark && (
        <span
          className={cn(
            "font-display tracking-tight leading-none",
            sz.text,
            wordmarkColor,
            wordmarkClassName,
          )}
        >
          MyRaaha
        </span>
      )}
    </span>
  );

  if (!to) return inner;
  return (
    <Link to={to} className="inline-flex items-center shrink-0" aria-label="MyRaaha home">
      {inner}
    </Link>
  );
};

export default Logo;
