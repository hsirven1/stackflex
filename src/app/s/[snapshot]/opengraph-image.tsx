import { ImageResponse } from "next/og";
import { decodeStackSnapshot } from "@/lib/stack-sharing";
import { ogTools, StackOgFallback, StackOgLayout } from "@/lib/stack-sharing/og";

export const alt = "My AI Stack | StackFlex";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ snapshot: string }> }) {
  const { snapshot } = await params;
  const decoded = decodeStackSnapshot(snapshot);

  try {
    if (!decoded.ok) {
      return new ImageResponse(<StackOgFallback />, { ...size });
    }
    return new ImageResponse(<StackOgLayout tools={ogTools(decoded.stack)} />, { ...size });
  } catch {
    return new ImageResponse(<StackOgFallback />, { ...size });
  }
}
