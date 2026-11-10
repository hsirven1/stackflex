"use client";
/* eslint-disable @next/next/no-img-element */
import { useState, type ReactNode } from "react";
import { stackHeadline, type Tool } from "@/lib/stackflex/tools";
import { Wordmark } from "./Brand";
import { LinkedInIcon, PrimaryButton, TextAction, ThemeSwitch, XIcon, type ArtTheme } from "./Controls";
import { StackBoard } from "./StackBoard";
import { StackChip } from "./StackCard";
import { BannerArt, SocialCardArt } from "./ShareArt";
import { Mark } from "./Brand";

// Results page, latest approved layout (Results v2, section 6).
// Desktop (lg+): 320px sticky "My AI stack" panel | hairline | one 820px column of sharing formats.
// Mobile: stacked, nothing sticky (stack first, then formats).
// All data comes from props. Wire every callback to your existing export / share / storage code.

export type ImageFormat = "social" | "linkedin-banner" | "x-header";
export type TextFormat = "caption" | "badge-html" | "readme-md" | "headline" | "resume" | "caption-variant";

type Person = { name: string; title?: string; handle?: string; avatarSrc?: string };

type Props = {
  stack: Tool[];
  person?: Person;                         // only used by the LinkedIn / X profile previews
  caption: string;                         // social card caption (copied, never drawn into the image)
  headline?: string;                       // LinkedIn headline / X bio
  resume?: string;                         // one-line resume snippet
  captions?: string[];                     // extra caption variants
  badgeHref?: string;
  themes?: Partial<Record<ImageFormat, ArtTheme>>;
  onThemeChange?: (format: ImageFormat, theme: ArtTheme) => void;
  onStartOver?: () => void;
  onAddTool?: () => void;
  onEditStack?: () => void;
  onDownload?: (format: ImageFormat, theme: ArtTheme) => void;
  onCopy?: (format: TextFormat, text: string) => void;
  onShareDevice?: () => void;              // Web Share API with the image file, where supported
  onPost?: (target: "linkedin" | "x") => void;        // opens a new post in a new tab; the user attaches the image
  onOpenProfile?: (target: "linkedin" | "x") => void; // opens the profile settings page
  onPreviewLinkedIn?: () => void;          // optional modal with the post mockup
};

const DEFAULT_THEMES: Record<ImageFormat, ArtTheme> = { social: "light", "linkedin-banner": "light", "x-header": "dark" };

export function ResultsScreen(p: Props) {
  const [localThemes, setLocalThemes] = useState(DEFAULT_THEMES);
  const themes = { ...localThemes, ...p.themes };
  const setTheme = (f: ImageFormat, t: ArtTheme) => (p.onThemeChange ? p.onThemeChange(f, t) : setLocalThemes((s) => ({ ...s, [f]: t })));
  const headline = p.headline ?? stackHeadline(p.stack);

  return (
    <main className="min-h-screen bg-white text-sf-ink">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex h-[88px] items-center justify-between px-5 md:px-10 lg:px-16">
          <Wordmark />
          <TextAction onClick={p.onStartOver} className="text-[15px] text-sf-muted">Start over</TextAction>
        </header>

        <div className="px-5 pb-24 md:px-10 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-12 lg:px-16">
          {/* Identity panel: sticky on desktop only, no inner scrollbar. */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="flex flex-col gap-4 rounded-[24px] bg-sf-paper p-4">
              <h1 className="font-display text-[22px] font-medium leading-none tracking-[-0.035em]">My AI stack</h1>
              <StackBoard tools={p.stack} layout="grid" gap="6px" />
              <div className="flex gap-2">
                <PanelButton onClick={p.onAddTool}>+ Add tool</PanelButton>
                <PanelButton onClick={p.onEditStack}>Edit stack</PanelButton>
              </div>
            </div>
          </aside>

          {/* Sharing workspace */}
          <section className="mt-10 lg:mt-0 lg:border-l lg:border-[#EEECE6] lg:pl-[60px]">
            <div className="max-w-[820px]">
              <h2 className="pb-6 font-display text-[30px] font-medium leading-none tracking-[-0.04em] lg:text-[32px]">Share it</h2>

              {/* Social card: the actual export, controls beside it */}
              <Format title="Social card" meta="1080 × 1080 · LinkedIn and X" first>
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
                  <SocialCardArt tools={p.stack} theme={themes.social}
                    className="w-full max-w-[400px] flex-none rounded-[12px] shadow-[0_0_0_1px_#EEECE6,0_30px_60px_-36px_rgba(11,11,12,.32)]" />
                  <div className="flex min-w-0 flex-1 flex-col gap-[22px] md:pt-1">
                    <ThemeSwitch value={themes.social} onChange={(t) => setTheme("social", t)} />
                    <PrimaryButton size="sm" icon="↓" className="self-start" onClick={() => p.onDownload?.("social", themes.social)}>Download image</PrimaryButton>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 md:flex md:flex-col md:gap-[13px]">
                      <TextAction onClick={() => p.onCopy?.("caption", p.caption)}>Copy caption</TextAction>
                      <TextAction onClick={p.onShareDevice}>Share via device</TextAction>
                      <TextAction icon={<LinkedInIcon />} onClick={() => p.onPost?.("linkedin")}>Post on LinkedIn</TextAction>
                      <TextAction icon={<XIcon />} onClick={() => p.onPost?.("x")}>Post on X</TextAction>
                    </div>
                    <p className="text-[12.5px] leading-[1.45] text-sf-subtle">Posting opens LinkedIn or X in a new tab. Attach the downloaded image there.</p>
                    {p.onPreviewLinkedIn && (
                      <div className="border-t border-[#EEECE6] pt-3.5">
                        <TextAction onClick={p.onPreviewLinkedIn}>Preview on LinkedIn ↗</TextAction>
                      </div>
                    )}
                  </div>
                </div>
              </Format>

              <Format title="LinkedIn banner" meta="1584 × 396">
                <ProfilePreview platform="linkedin" person={p.person}>
                  <BannerArt tools={p.stack} theme={themes["linkedin-banner"]} className="border-b border-[#EEE]" />
                </ProfilePreview>
                <ImageControls theme={themes["linkedin-banner"]} onTheme={(t) => setTheme("linkedin-banner", t)}
                  open={<TextAction icon={<LinkedInIcon />} onClick={() => p.onOpenProfile?.("linkedin")}>Open LinkedIn profile</TextAction>}
                  onDownload={() => p.onDownload?.("linkedin-banner", themes["linkedin-banner"])} />
              </Format>

              <Format title="X header" meta="1500 × 500">
                <ProfilePreview platform="x" person={p.person}>
                  <BannerArt tools={p.stack} theme={themes["x-header"]} ratio="3 / 1" className="border-b border-[#EEE]" />
                </ProfilePreview>
                <ImageControls theme={themes["x-header"]} onTheme={(t) => setTheme("x-header", t)}
                  open={<TextAction icon={<XIcon />} onClick={() => p.onOpenProfile?.("x")}>Open X profile</TextAction>}
                  onDownload={() => p.onDownload?.("x-header", themes["x-header"])} />
              </Format>

              <Format title="Badges" meta="Website and GitHub">
                <div className="flex flex-col gap-8">
                  <Row label="Website badge" meta="HTML or SVG">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {p.stack.slice(0, 6).map((t) => <StackChip key={t.id} tool={t} />)}
                      <span className="flex h-10 items-center gap-2 rounded-full bg-sf-ink pl-[11px] pr-4 text-[13.5px] font-semibold text-white">
                        <Mark size={16} outline="#0B0B0C" /> Built with {p.stack.length} AI tools
                      </span>
                    </div>
                    <InkButton onClick={() => p.onCopy?.("badge-html", "")}>Copy HTML</InkButton>
                  </Row>
                  <Row label="GitHub README" meta="Markdown">
                    <div className="flex w-full flex-col gap-2.5 rounded-[10px] p-4 shadow-[0_0_0_1px_#E6E3DC]">
                      <span className="border-b border-[#EEECE6] pb-[7px] text-sm font-bold">My AI stack</span>
                      <div className="flex flex-wrap gap-1.5">{p.stack.map((t) => <StackChip key={t.id} tool={t} />)}</div>
                    </div>
                    <InkButton onClick={() => p.onCopy?.("readme-md", "")}>Copy Markdown</InkButton>
                  </Row>
                </div>
              </Format>

              <Format title="Text" meta="Headline, bio, resume, captions" last>
                <div className="mt-1 flex flex-col">
                  <TextRow label="LinkedIn headline · X bio" text={headline} onCopy={() => p.onCopy?.("headline", headline)} />
                  {p.resume && <TextRow label="Resume snippet" text={p.resume} onCopy={() => p.onCopy?.("resume", p.resume!)} />}
                  {(p.captions ?? []).map((c, i) => (
                    <TextRow key={i} label="Caption" text={c} onCopy={() => p.onCopy?.("caption-variant", c)} />
                  ))}
                </div>
              </Format>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Format({ title, meta, first, last, children }: { title: string; meta?: string; first?: boolean; last?: boolean; children: ReactNode }) {
  return (
    <section className={`flex flex-col gap-4 ${first ? "pb-10" : "border-t border-[#EEECE6] py-10"} ${last ? "pb-0" : ""}`}>
      <div className="flex flex-wrap items-baseline gap-3">
        <h3 className="font-display text-[22px] font-medium leading-[1.1] tracking-[-0.035em] md:text-[26px]">{title}</h3>
        {meta && <span className="text-[13px] text-sf-subtle">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

function ImageControls({ theme, onTheme, open, onDownload }: { theme: ArtTheme; onTheme: (t: ArtTheme) => void; open: ReactNode; onDownload: () => void }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-5">
      <ThemeSwitch value={theme} onChange={onTheme} />
      <div className="flex flex-col-reverse gap-4 md:flex-row md:items-center md:gap-6">
        {open}
        <PrimaryButton size="sm" icon="↓" onClick={onDownload}>Download image</PrimaryButton>
      </div>
    </div>
  );
}

/** Profile preview: shows where the banner lands. Illustrative, never part of the exported image. */
function ProfilePreview({ platform, person, children }: { platform: "linkedin" | "x"; person?: Person; children: ReactNode }) {
  const avatar = person?.avatarSrc
    ? <img src={person.avatarSrc} alt="" className="h-full w-full rounded-full object-cover" />
    : <span className="block h-full w-full rounded-full" style={{ background: "linear-gradient(140deg,#FFC9A8,#B9A8FF)" }} />;
  return (
    <div className="overflow-hidden rounded-[12px] bg-white font-[system-ui] text-[#191919] shadow-[0_0_0_1px_#EEECE6,0_24px_48px_-32px_rgba(11,11,12,.28)]">
      {children}
      <div className={`relative flex items-start justify-between px-[18px] pb-3.5 pt-2.5 ${platform === "linkedin" ? "pl-[124px]" : ""}`}>
        <span className="absolute -top-11 left-[18px] h-[88px] w-[88px] rounded-full border-[3px] border-white">{avatar}</span>
        {platform === "linkedin" ? (
          <>
            <div className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold">{person?.name ?? "Your name"}</span>
              {person?.title && <span className="text-[12.5px] text-[#666]">{person.title}</span>}
            </div>
            <LinkedInIcon size={18} />
          </>
        ) : (
          <div className="flex w-full flex-col gap-0.5">
            <div className="flex h-10 justify-end"><XIcon size={18} /></div>
            <span className="text-base font-extrabold">{person?.name ?? "Your name"}</span>
            {person?.handle && <span className="text-[13px] text-[#536471]">@{person.handle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, meta, children }: { label: string; meta: string; children: ReactNode }) {
  return (
    <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)] md:gap-6">
      <div className="flex flex-col gap-[3px] md:pt-1">
        <span className="text-base font-semibold">{label}</span>
        <span className="text-[13px] text-sf-subtle">{meta}</span>
      </div>
      <div className="flex flex-col items-start gap-3.5">{children}</div>
    </div>
  );
}

function TextRow({ label, text, onCopy }: { label: string; text: string; onCopy: () => void }) {
  return (
    <div className="grid gap-2 border-t border-[#F2F0EB] py-[18px] md:grid-cols-[200px_minmax(0,1fr)_auto] md:items-baseline md:gap-6">
      <span className="text-[15px] font-semibold">{label}</span>
      <p className="text-[15px] leading-normal text-sf-ver [text-wrap:pretty]">{text}</p>
      <TextAction onClick={onCopy}>Copy</TextAction>
    </div>
  );
}

function PanelButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-9 flex-1 rounded-full bg-white text-[13.5px] font-semibold text-sf-ink outline-none focus-visible:ring-2 focus-visible:ring-sf-blue">
      {children}
    </button>
  );
}

function InkButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-10 rounded-full bg-sf-ink px-[18px] text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-sf-blue focus-visible:ring-offset-2">
      {children}
    </button>
  );
}
