"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScaledStageProps {
  width: number;
  height: number;
  children: ReactNode;
  /** Rendered above the composition (not exported), in composition pixel coordinates. */
  overlay?: ReactNode;
  /** Caps the on-screen width (e.g. so a square card doesn't dominate the viewport). */
  maxDisplayWidth?: number;
  className?: string;
}

/**
 * Displays a fixed-pixel composition scaled down to fit its container. Only the preview is
 * scaled; the composition node keeps its native size, which is what gets exported.
 */
export function ScaledStage({ width, height, children, overlay, maxDisplayWidth, className }: ScaledStageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / width));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={frameRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: Math.min(width, maxDisplayWidth ?? width),
        aspectRatio: `${width} / ${height}`,
        marginInline: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          visibility: scale ? "visible" : "hidden",
        }}
      >
        {children}
        {overlay}
      </div>
    </div>
  );
}
