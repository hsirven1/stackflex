"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowUp, ArrowDown, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Wordmark } from "@/components/stackflex/Brand";
import { focusRing, PrimaryButton, SecondaryButton, TextButton } from "@/components/stackflex/Controls";
import { ToolLogo } from "@/components/stackflex/ToolLogo";
import {
  addManualExperience,
  removeExperience,
  reorderExperience,
  resetPortfolioDraft,
  setShowCapabilities,
  updateExperience,
  updateProfile,
  usePortfolio,
} from "@/lib/portfolio/store";
import { WORK_STATUS_LABEL, WORK_TYPE_LABEL, type PortfolioExperience } from "@/lib/portfolio/types";
import { useHydrated, useStack } from "@/lib/selection/store";
import { stackTools } from "@/lib/stackflex/tools";
import { ExperienceForm } from "./ExperienceForm";
import { ImportModal } from "./ImportModal";
import { PortfolioDocument } from "./PortfolioDocument";

type MobilePane = "edit" | "preview";
type ImportSource = "chatgpt" | "claude" | null;

/**
 * Interactive AI Portfolio builder: live preview + editor. Uses the real saved stack and a
 * separate localStorage portfolio draft.
 */
export function PortfolioBuilder() {
  const hydrated = useHydrated();
  const stack = useStack();
  const portfolio = usePortfolio();
  const tools = useMemo(() => stackTools(stack), [stack]);
  const [mobilePane, setMobilePane] = useState<MobilePane>("edit");
  const [importSource, setImportSource] = useState<ImportSource>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [revealing, setRevealing] = useState(false);

  if (!hydrated) {
    return <div className="min-h-svh bg-white" />;
  }

  function flash(text: string) {
    setNotice(text);
    setTimeout(() => setNotice(""), 2800);
  }

  function onImported(count: number) {
    if (count <= 0) {
      flash("No new experiences were added.");
      return;
    }
    setRevealing(true);
    flash(`Added ${count} experience${count === 1 ? "" : "s"} to your portfolio.`);
    setTimeout(() => setRevealing(false), 700);
  }

  const sorted = [...portfolio.experiences].sort((a, b) => a.order - b.order);

  return (
    <div className="flex min-h-svh flex-col bg-[#FAF8F4] text-sf-ink">
      <header className="flex h-[64px] flex-none items-center justify-between border-b border-[#EFECE5] bg-white px-4 md:px-6 lg:px-8">
        <Link href="/" className={`rounded-md ${focusRing}`}>
          <Wordmark />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/portfolio/preview"
            className={`hidden h-10 items-center rounded-full bg-sf-chip px-4 text-[14px] font-semibold sm:inline-flex ${focusRing}`}
          >
            Preview portfolio
          </Link>
          <Link
            href="/#results"
            onClick={(e) => {
              e.preventDefault();
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- leave portfolio for hash SPA
              window.location.href = "/#results";
            }}
            className={`text-[14px] font-medium text-sf-muted hover:text-sf-ink ${focusRing}`}
          >
            Back to my stack
          </Link>
        </div>
      </header>

      <div className="flex gap-2 border-b border-[#EFECE5] bg-white px-4 py-2 lg:hidden">
        <PaneTab active={mobilePane === "edit"} onClick={() => setMobilePane("edit")}>
          Edit
        </PaneTab>
        <PaneTab active={mobilePane === "preview"} onClick={() => setMobilePane("preview")}>
          Preview
        </PaneTab>
        <Link href="/portfolio/preview" className={`ml-auto self-center text-[13px] font-semibold text-sf-blue ${focusRing}`}>
          Full page
        </Link>
      </div>

      <div className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)] lg:gap-0">
        <section
          aria-label="Live portfolio preview"
          className={`min-h-0 overflow-y-auto overscroll-contain px-4 py-6 md:px-8 lg:px-10 lg:py-8 ${
            mobilePane === "edit" ? "hidden lg:block" : "block"
          }`}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-sf-subtle">Live preview</p>
          <div className={revealing ? "animate-message-in" : undefined}>
            <PortfolioDocument portfolio={portfolio} tools={tools} compact />
          </div>
        </section>

        <aside
          aria-label="Portfolio editor"
          className={`flex min-h-0 flex-col border-[#EFECE5] bg-white lg:sticky lg:top-0 lg:h-[calc(100svh-64px)] lg:border-l lg:overflow-y-auto ${
            mobilePane === "preview" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex flex-col gap-8 px-5 py-6 md:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sf-blue">AI Portfolio</p>
              <h1 className="mt-1 font-display text-[28px] font-medium leading-none tracking-[-0.04em]">Build your portfolio</h1>
              <p className="mt-2 text-[14px] leading-snug text-sf-muted">
                Import experiences from ChatGPT or Claude, or add them yourself. Your AI stack stays in sync with StackFlex.
              </p>
              {notice && (
                <p role="status" className="mt-3 rounded-[12px] bg-sf-blue/8 px-3 py-2 text-[13px] font-medium text-sf-blue">
                  {notice}
                </p>
              )}
            </div>

            <EditorSection title="Profile">
              <ProfileFields />
            </EditorSection>

            <EditorSection
              title="AI Stack"
              action={
                <button
                  type="button"
                  onClick={() => {
                    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- open stack editor
                    window.location.href = "/#edit";
                  }}
                  className={`text-[13px] font-semibold text-sf-blue ${focusRing}`}
                >
                  Edit stack
                </button>
              }
            >
              {tools.length === 0 ? (
                <p className="text-[13px] text-sf-muted">No tools yet — build your stack first.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {tools.map((t) => (
                    <li
                      key={t.id}
                      className="inline-flex items-center gap-2 rounded-full bg-sf-chip py-1 pl-1 pr-3 text-[13px] font-medium"
                    >
                      <span className="flex size-7 items-center justify-center rounded-full bg-white shadow-[0_0_0_1px_#ECEAE4]">
                        <ToolLogo tool={t} size="14px" monogramSize="11px" />
                      </span>
                      {t.name}
                    </li>
                  ))}
                </ul>
              )}
            </EditorSection>

            <EditorSection title="Import with AI">
              <p className="mb-3 text-[13px] leading-snug text-sf-muted">
                Copy a guided prompt, paste the JSON report, then choose what to showcase. We never access your chats automatically.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <PrimaryButton size="sm" onClick={() => setImportSource("chatgpt")}>
                  Import with ChatGPT
                </PrimaryButton>
                <SecondaryButton size="sm" onClick={() => setImportSource("claude")}>
                  Import with Claude
                </SecondaryButton>
              </div>
            </EditorSection>

            <EditorSection
              title="Selected work"
              action={
                <TextButton type="button" className="text-sm" onClick={() => { setAdding(true); setEditingId(null); }}>
                  + Add manually
                </TextButton>
              }
            >
              {adding && (
                <div className="mb-4">
                  <ExperienceForm
                    submitLabel="Add work"
                    onCancel={() => setAdding(false)}
                    onSubmit={(data) => {
                      addManualExperience(data);
                      setAdding(false);
                      flash("Added to your portfolio.");
                    }}
                  />
                </div>
              )}
              {sorted.length === 0 && !adding ? (
                <p className="text-[13px] text-sf-muted">No experiences yet. Import from an assistant or add one manually.</p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {sorted.map((exp, index) => (
                    <li key={exp.id}>
                      {editingId === exp.id ? (
                        <ExperienceForm
                          initial={{
                            title: exp.title,
                            description: exp.description,
                            type: exp.type,
                            status: exp.status,
                            tools: exp.tools.join(", "),
                            capabilities: exp.capabilities.join(", "),
                            outcome: exp.outcome ?? "",
                            link: exp.link ?? "",
                          }}
                          submitLabel="Save"
                          onCancel={() => setEditingId(null)}
                          onSubmit={(data) => {
                            updateExperience(exp.id, data);
                            setEditingId(null);
                            flash("Experience updated.");
                          }}
                        />
                      ) : (
                        <ExperienceRow
                          experience={exp}
                          isFirst={index === 0}
                          isLast={index === sorted.length - 1}
                          onEdit={() => { setEditingId(exp.id); setAdding(false); }}
                          onRemove={() => {
                            removeExperience(exp.id);
                            flash("Removed.");
                          }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </EditorSection>

            <EditorSection title="Capabilities">
              <label className="flex items-center gap-2.5 text-[14px]">
                <input
                  type="checkbox"
                  checked={portfolio.showCapabilities}
                  onChange={(e) => setShowCapabilities(e.target.checked)}
                />
                Show capabilities derived from selected work
              </label>
            </EditorSection>

            <div className="border-t border-[#EEECE6] pt-5">
              {!confirmReset ? (
                <TextButton type="button" className="text-sm text-sf-subtle" onClick={() => setConfirmReset(true)}>
                  Reset portfolio draft…
                </TextButton>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[13px] text-sf-muted">Clear profile and all experiences?</p>
                  <SecondaryButton
                    size="sm"
                    onClick={() => {
                      resetPortfolioDraft();
                      setConfirmReset(false);
                      flash("Draft reset.");
                    }}
                  >
                    Yes, reset
                  </SecondaryButton>
                  <TextButton type="button" className="text-sm" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </TextButton>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {importSource && (
        <ImportModal
          source={importSource}
          existing={portfolio.experiences}
          onClose={() => setImportSource(null)}
          onAdded={onImported}
        />
      )}
    </div>
  );
}

function PaneTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full px-4 text-[13px] font-semibold ${
        active ? "bg-sf-ink text-white" : "bg-sf-chip text-sf-ink"
      } ${focusRing}`}
    >
      {children}
    </button>
  );
}

function EditorSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-[18px] font-medium tracking-[-0.03em]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ProfileFields() {
  const { profile } = usePortfolio();
  const field = `w-full rounded-[12px] border border-[#DAD7CF] bg-white px-3.5 py-2.5 text-[14px] ${focusRing}`;
  return (
    <div className="flex flex-col gap-2.5">
      <input
        className={field}
        placeholder="Name"
        value={profile.name}
        onChange={(e) => updateProfile({ name: e.target.value })}
        maxLength={80}
      />
      <input
        className={field}
        placeholder="Headline"
        value={profile.headline}
        onChange={(e) => updateProfile({ headline: e.target.value })}
        maxLength={160}
      />
      <textarea
        className={`${field} min-h-[72px] resize-y`}
        placeholder="Short bio (optional)"
        value={profile.bio}
        onChange={(e) => updateProfile({ bio: e.target.value })}
        maxLength={600}
      />
      <input
        className={field}
        placeholder="Location (optional)"
        value={profile.location ?? ""}
        onChange={(e) => updateProfile({ location: e.target.value })}
        maxLength={80}
      />
      <input
        className={field}
        placeholder="LinkedIn URL (optional)"
        value={profile.linkedinUrl ?? ""}
        onChange={(e) => updateProfile({ linkedinUrl: e.target.value })}
      />
      <input
        className={field}
        placeholder="Website / GitHub URL (optional)"
        value={profile.websiteUrl ?? ""}
        onChange={(e) => updateProfile({ websiteUrl: e.target.value })}
      />
    </div>
  );
}

function ExperienceRow({
  experience,
  isFirst,
  isLast,
  onEdit,
  onRemove,
}: {
  experience: PortfolioExperience;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-[14px] border border-[#ECEAE4] bg-[#FAF9F6] p-3.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-sf-ink">{experience.title}</p>
            {!experience.visible && <span className="text-[11px] text-sf-subtle">Hidden</span>}
          </div>
          <p className="mt-0.5 text-[12px] text-sf-muted">
            {WORK_TYPE_LABEL[experience.type]} · {WORK_STATUS_LABEL[experience.status]} · {experience.source}
          </p>
        </div>
        <div className="flex flex-none gap-0.5">
          <IconBtn label="Move up" disabled={isFirst} onClick={() => reorderExperience(experience.id, "up")}>
            <ArrowUp className="size-4" />
          </IconBtn>
          <IconBtn label="Move down" disabled={isLast} onClick={() => reorderExperience(experience.id, "down")}>
            <ArrowDown className="size-4" />
          </IconBtn>
          <IconBtn
            label={experience.visible ? "Hide" : "Show"}
            onClick={() => updateExperience(experience.id, { visible: !experience.visible })}
          >
            {experience.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </IconBtn>
          <IconBtn label="Edit" onClick={onEdit}>
            <Pencil className="size-4" />
          </IconBtn>
          <IconBtn label="Remove" onClick={onRemove}>
            <Trash2 className="size-4" />
          </IconBtn>
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg p-1.5 text-sf-muted hover:bg-white hover:text-sf-ink disabled:opacity-30 ${focusRing}`}
    >
      {children}
    </button>
  );
}
