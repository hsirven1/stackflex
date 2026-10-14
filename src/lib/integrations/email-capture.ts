/**
 * Opt-in email capture hook. Not used in V0.1: there is no UI, no gate, and nothing is sent.
 * A future pass can render an optional form when `EMAIL_CAPTURE_ENABLED` is true and pass
 * submissions to a provider that records explicit consent.
 */

export const EMAIL_CAPTURE_ENABLED = false;

export interface EmailCaptureSubmission {
  email: string;
  consent: { marketing: boolean; timestamp: string };
  /** Optional, anonymous context: catalog tool ids only. */
  stackToolIds?: string[];
}

export interface EmailCaptureProvider {
  submit(submission: EmailCaptureSubmission): Promise<{ ok: boolean }>;
}

let provider: EmailCaptureProvider | null = null;

export function registerEmailCaptureProvider(next: EmailCaptureProvider | null) {
  provider = next;
}

export async function submitEmail(submission: EmailCaptureSubmission) {
  if (!EMAIL_CAPTURE_ENABLED || !provider) return { ok: false };
  return provider.submit(submission);
}
