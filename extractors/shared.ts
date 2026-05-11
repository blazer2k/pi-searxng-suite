export const MAX_TEXT_CHARS = 500_000;
export const MAX_HTML_CHARS = 1_000_000;
export const MAX_MARKDOWN_CHARS = 100_000;
export const MAX_IMAGE_BYTES = 50 * 1024 * 1024;

export type ExtractContent =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string };

export interface ExtractResponse {
  sourceUrl: string;
  contentType: string;
  content: ExtractContent[];
}

export function truncateContent(
  content: string,
  maxChars: number,
  displayString: "..." | "verbose" = "...",
): string {
  if (content.length <= maxChars) return content;

  const display =
    displayString === "verbose"
      ? `\n\n[Content truncated at ${maxChars} characters]`
      : "...";

  return `${content.slice(0, maxChars)}${display}`;
}

export function getExtractTextLength(
  content: Array<{ type: string; text?: string }>,
): number {
  return content.reduce((sum, item) => {
    if (item.type !== "text") return sum;
    return sum + (item.text?.length ?? 0);
  }, 0);
}
