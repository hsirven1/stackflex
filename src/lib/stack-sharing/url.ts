import { stackTools } from "@/lib/stackflex/tools";
import { encodeStack } from "./encode";
import type {
  ShareableActivity,
  ShareableProfile,
  SnapshotIdentity,
  StackShareInput,
} from "./types";

/** Strip trailing slashes from an origin or site URL. */
export function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, "");
}

/**
 * Resolve the public site origin for absolute share URLs.
 * Prefer an explicitly configured production URL; never bake hostnames into the token.
 */
type ShareEnv = {
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?: string;
  VERCEL_URL?: string;
};

export function resolveShareOrigin(options?: {
  /** Explicit override (e.g. `window.location.origin` on the client). */
  origin?: string;
  env?: ShareEnv;
}): { origin: string; isLocal: boolean } {
  const env: ShareEnv =
    options?.env ?? (typeof process !== "undefined" ? (process.env as ShareEnv) : {});
  const configured =
    env.NEXT_PUBLIC_SITE_URL?.trim() ||
    env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    "";

  if (configured) {
    const withProtocol = /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
    return { origin: normalizeOrigin(withProtocol), isLocal: false };
  }

  if (options?.origin) {
    const origin = normalizeOrigin(options.origin);
    const isLocal = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
    return { origin, isLocal };
  }

  const vercel = env.VERCEL_URL?.trim();
  if (vercel) {
    const withProtocol = /^https?:\/\//i.test(vercel) ? vercel : `https://${vercel}`;
    return { origin: normalizeOrigin(withProtocol), isLocal: false };
  }

  return { origin: "http://localhost:3000", isLocal: true };
}

/** Build the path segment for a share URL (no leading origin). */
export function stackSharePath(token: string): string {
  return `/s/${token}`;
}

/**
 * Absolute public URL for the given stack snapshot.
 * The token encodes the stack (+ optional identity); the origin is never part of the payload.
 */
export function createStackShareUrl(
  stack: StackShareInput,
  originOrOptions?:
    | string
    | {
        origin?: string;
        env?: ShareEnv;
        profile?: ShareableProfile | null;
        activities?: ShareableActivity[] | null;
      },
): { url: string; token: string; isLocal: boolean } {
  const opts =
    typeof originOrOptions === "string"
      ? { origin: originOrOptions }
      : originOrOptions ?? {};
  const token = encodeStack(stack, opts.profile, opts.activities);
  const { origin, isLocal } = resolveShareOrigin(opts);
  return { url: `${origin}${stackSharePath(token)}`, token, isLocal };
}

/** Social / metadata description derived from decoded tools (optional personal name). */
export function stackShareDescription(stack: StackShareInput, identity?: SnapshotIdentity): string {
  const tools = stackTools(stack);
  const who = identity?.displayName?.trim();
  if (tools.length === 0) {
    return who ? `Explore ${who}'s AI stack on StackFlex.` : "Explore an AI stack on StackFlex.";
  }
  const names = tools.map((t) => t.name);
  const list =
    names.length === 1
      ? names[0]
      : names.length === 2
        ? `${names[0]} and ${names[1]}`
        : `${names.slice(0, 3).join(", ")}${names.length > 3 ? " and more" : ""}`;
  return who ? `${who}'s AI stack: ${list}.` : `Explore my AI stack: ${list}.`;
}

export const STACK_SHARE_TITLE = "My AI Stack | StackFlex";
