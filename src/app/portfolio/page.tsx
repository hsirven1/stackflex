import { notFound, redirect } from "next/navigation";

/** Experimental portfolio index — production returns 404; local goes to the builder. */
export default function PortfolioIndexPage() {
  if (process.env.NODE_ENV === "production") notFound();
  redirect("/portfolio/build");
}
