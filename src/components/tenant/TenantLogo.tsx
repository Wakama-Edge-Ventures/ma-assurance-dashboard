"use client";

import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";

import wakamaLogo from "@/img/wakama_logo.png";
import { useTenant } from "@/components/tenant/useTenant";

interface TenantLogoProps {
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

function resolveInitialSrc(logoPath: string): string | StaticImageData {
  return logoPath.startsWith("/") ? logoPath : wakamaLogo;
}

export function TenantLogo({
  alt,
  className,
  width = 160,
  height = 64,
  priority = false,
}: TenantLogoProps) {
  const { tenant } = useTenant();
  const [src, setSrc] = useState<string | StaticImageData>(resolveInitialSrc(tenant.logoPath));

  useEffect(() => {
    setSrc(resolveInitialSrc(tenant.logoPath));
  }, [tenant.logoPath]);

  return (
    <Image
      src={src}
      alt={alt ?? tenant.displayName}
      width={width}
      height={height}
      priority={priority}
      className={className}
      onError={() => setSrc(wakamaLogo)}
    />
  );
}
