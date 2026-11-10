import { notFound } from "next/navigation";
import { BannerExportLab } from "./BannerExportLab";

export const metadata = {
  title: "Banner export quality — StackFlex (dev)",
  robots: { index: false, follow: false },
};

/** Local PNG sharpness comparison. Hidden in production. */
export default function BannerExportDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <BannerExportLab />;
}
