import {
  siAnthropic,
  siAsana,
  siAtlassian,
  siClaude,
  siClaudecode,
  siCline,
  siCloudflare,
  siCrewai,
  siCursor,
  siDeepl,
  siDeepseek,
  siDify,
  siElevenlabs,
  siFathom,
  siFigma,
  siGithub,
  siGithubcopilot,
  siGoogle,
  siGooglegemini,
  siGrammarly,
  siHubspot,
  siHuggingface,
  siIfttt,
  siIntercom,
  siJetbrains,
  siKagi,
  siKimi,
  siLangchain,
  siLangflow,
  siLmstudio,
  siMake,
  siMeta,
  siMetaai,
  siMistralai,
  siModal,
  siModelcontextprotocol,
  siN8n,
  siNotebooklm,
  siNotion,
  siNvidia,
  siOllama,
  siOpencode,
  siOpenrouter,
  siPerplexity,
  siPoe,
  siQwen,
  siRaycast,
  siReplicate,
  siReplit,
  siShopify,
  siStackblitz,
  siSuno,
  siV0,
  siVeed,
  siVercel,
  siVllm,
  siWarp,
  siWindsurf,
  siZapier,
  siZoom,
  siZedindustries,
} from "simple-icons";
import { LOGO_ASSETS } from "./logos";

export interface BrandIcon {
  title: string;
  path: string;
  hex: string;
}

/**
 * Simple Icons registry keyed by Simple Icons slug. Brands Simple Icons doesn't carry (OpenAI,
 * Microsoft, xAI, Midjourney…) come from LOGO_ASSETS; brands in neither show a monogram.
 */
const REGISTRY: Record<string, BrandIcon> = {
  anthropic: siAnthropic,
  asana: siAsana,
  atlassian: siAtlassian,
  claude: siClaude,
  claudecode: siClaudecode,
  cline: siCline,
  cloudflare: siCloudflare,
  crewai: siCrewai,
  cursor: siCursor,
  deepl: siDeepl,
  deepseek: siDeepseek,
  dify: siDify,
  elevenlabs: siElevenlabs,
  fathom: siFathom,
  figma: siFigma,
  github: siGithub,
  githubcopilot: siGithubcopilot,
  google: siGoogle,
  googlegemini: siGooglegemini,
  grammarly: siGrammarly,
  hubspot: siHubspot,
  huggingface: siHuggingface,
  ifttt: siIfttt,
  intercom: siIntercom,
  jetbrains: siJetbrains,
  kagi: siKagi,
  kimi: siKimi,
  langchain: siLangchain,
  langflow: siLangflow,
  lmstudio: siLmstudio,
  make: siMake,
  meta: siMeta,
  metaai: siMetaai,
  mistralai: siMistralai,
  modal: siModal,
  modelcontextprotocol: siModelcontextprotocol,
  n8n: siN8n,
  notebooklm: siNotebooklm,
  notion: siNotion,
  nvidia: siNvidia,
  ollama: siOllama,
  opencode: siOpencode,
  openrouter: siOpenrouter,
  perplexity: siPerplexity,
  poe: siPoe,
  qwen: siQwen,
  raycast: siRaycast,
  replicate: siReplicate,
  replit: siReplit,
  shopify: siShopify,
  stackblitz: siStackblitz,
  suno: siSuno,
  v0: siV0,
  veed: siVeed,
  vercel: siVercel,
  vllm: siVllm,
  warp: siWarp,
  windsurf: siWindsurf,
  zapier: siZapier,
  zedindustries: siZedindustries,
  zoom: siZoom,
};

/** A tool's logo: a single-color Simple Icons path, or a complete SVG (multi-color marks) as an image. */
export type Logo = { kind: "path"; path: string; hex: string } | { kind: "image"; src: string };

const imageSrc = new Map<string, string>();

/** The one logo lookup used by every surface (selectors, cards, chips, exports). */
export function getLogo(slug: string | undefined): Logo | undefined {
  if (!slug) return undefined;
  const asset = LOGO_ASSETS[slug];
  if (asset) {
    let src = imageSrc.get(slug);
    if (!src) {
      src = `data:image/svg+xml,${encodeURIComponent(asset.svg)}`;
      imageSrc.set(slug, src);
    }
    return { kind: "image", src };
  }
  const icon = REGISTRY[slug];
  return icon && { kind: "path", path: icon.path, hex: icon.hex };
}
