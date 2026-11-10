import { notFound } from "next/navigation";
import { BannerToolsGallery } from "./BannerToolsGallery";

export const metadata = {
  title: "Banner tool layouts — StackFlex (dev)",
  robots: { index: false, follow: false },
};

/** Local layout review for LinkedIn banner tool density. Hidden in production. */
export default function BannerToolsDevPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <BannerToolsGallery />;
}
