import { notFound } from "next/navigation";
import { ToolLogoGallery } from "./ToolLogoGallery";

export const metadata = {
  title: "Tool logo audit — StackFlex (dev)",
  robots: { index: false, follow: false },
};

/**
 * Local development logo review gallery.
 * Hidden in production builds (404).
 */
export default function ToolLogosDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ToolLogoGallery />;
}
