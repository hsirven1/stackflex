/**
 * V1 launch feature flags.
 * Secondary / unfinished surfaces stay in the codebase but off the primary path.
 */
export const features = {
  /** Personal page preview + How I use AI inline editor on Results. */
  SHOW_PERSONAL_PAGE_PREVIEW: false,
  /** Portfolio builder routes and promos. */
  SHOW_PORTFOLIO: false,
  /**
   * Banner / Post / Bio exports.
   * When true, shown collapsed under “More ways to share” on Results.
   */
  SHOW_SHARE_ELSEWHERE: true,
} as const;
