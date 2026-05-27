"use client";

import React, { useRef } from "react";
import Link from "next/link";

interface CommonButtonProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const CommonButton: React.FC<CommonButtonProps> = ({ href, className, children, onClick, type = "button", disabled }) => {
  const btnRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      btnRef.current.style.setProperty("--x", `${x}px`);
      btnRef.current.style.setProperty("--y", `${y}px`);
    }
  };

  const commonProps = {
    ref: btnRef as any,
    className: `common-btn box-style d-inline-flex align-items-center justify-content-center overflow-hidden ${className || ""}`,
    onMouseMove: handleMouseMove,
    onClick: onClick,
    style: { "--x": "-999px", "--y": "-999px" } as React.CSSProperties
  };

  if (href) {
    return (
      <Link href={href} {...commonProps}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} {...commonProps}>
      {children}
    </button>
  );
};

export default CommonButton;
