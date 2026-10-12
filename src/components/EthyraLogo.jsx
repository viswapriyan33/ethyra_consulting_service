import React from "react";
import logoTransparent from "../assets/ethyra_logo_transparent.png";
import logoWhite from "../assets/ethyra_logo_white.png";

export default function EthyraLogo({
  className = "h-10",
  variant = "auto", // "auto" | "white" | "dark"
  alt = "ETHYRA",
  style = {},
  ...props
}) {
  if (variant === "white") {
    return (
      <img
        src={logoWhite}
        alt={alt}
        className={`object-contain ${className}`}
        style={style}
        {...props}
      />
    );
  }

  if (variant === "dark") {
    return (
      <img
        src={logoTransparent}
        alt={alt}
        className={`object-contain ${className}`}
        style={style}
        {...props}
      />
    );
  }

  // Auto switches with system/site dark mode
  return (
    <span className="inline-flex items-center">
      <img
        src={logoTransparent}
        alt={alt}
        className={`object-contain dark:hidden ${className}`}
        style={style}
        {...props}
      />
      <img
        src={logoWhite}
        alt={alt}
        className={`object-contain hidden dark:block ${className}`}
        style={style}
        {...props}
      />
    </span>
  );
}
