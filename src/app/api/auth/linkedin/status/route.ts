import { NextResponse } from "next/server";
import { linkedInConfigured } from "@/lib/linkedin/config";

/** Whether LinkedIn import is available (credentials configured). */
export async function GET() {
  return NextResponse.json({ configured: linkedInConfigured() });
}
