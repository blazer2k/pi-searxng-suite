import type {
  AgentToolResult,
  ToolRenderResultOptions,
  Theme,
} from "@mariozechner/pi-coding-agent";
import { keyHint } from "@mariozechner/pi-coding-agent";
import type { ExtractToolDetails } from "../tools/extract-tool";
import type { SearchToolDetails } from "../tools/search-tool";
import { getExtractTextLength, formatBytes } from "../extractors/shared";

export type ToolStatus = "success" | "aborted" | "error";

interface ToolStatusDetails {
  status: ToolStatus;
  error?: string;
}

export function getToolFailureStatus(
  details: ToolStatusDetails,
  theme: Theme,
): string | null {
  if (details.status === "error") {
    return theme.fg("error", `${details.error || "Unknown error"}`);
  }

  if (details.status === "aborted") {
    return theme.fg("muted", "Aborted");
  }

  return null;
}

export function getApproxTokens(charCount: number): string {
  const rawTokenCount = Math.ceil(charCount / 4);

  const tokenCount =
    rawTokenCount < 1000 ? rawTokenCount : Math.ceil(rawTokenCount / 100) * 100;

  return tokenCount < 1000 ? tokenCount.toString() : `${tokenCount / 1000}k`;
}

export function buildToolCallText(
  toolName: string,
  query: string,
  theme: Theme,
): string {
  return (
    theme.fg("toolTitle", toolName) + " " + theme.fg("accent", `${query || ""}`)
  );
}

function isImageResult(result: AgentToolResult<ExtractToolDetails>): boolean {
  return result.details.contentType?.startsWith("image/") ?? false;
}

export function buildToolResultText(
  result: AgentToolResult<ExtractToolDetails | SearchToolDetails>,
  options: ToolRenderResultOptions,
  theme: Theme,
  maxCollapsedLines = 20,
): string {
  const output = result.content.find((c) => c.type === "text")?.text ?? "";

  if (!output) return "";

  const lines = output.split("\n");
  const maxLines = options.expanded ? lines.length : maxCollapsedLines;
  const displayLines = lines.slice(0, maxLines);
  const remainingLines = lines.length - maxLines;

  let text = `\n${displayLines.map((line) => theme.fg("toolOutput", line)).join("\n")}`;

  if (remainingLines > 0) {
    text += `${theme.fg("muted", `\n... (${remainingLines} more lines,`)} ${keyHint("app.tools.expand", "to expand")})`;
  }

  return text;
}

export function buildSearchResultsSummary(
  result: AgentToolResult<SearchToolDetails>,
  theme: Theme,
): string {
  const resultCount = result.details.resultCount ?? 0;
  return theme.fg(
    "dim",
    resultCount !== 0 ? `${resultCount} results` : "No results",
  );
}

export function buildExtractContentSummary(
  result: AgentToolResult<ExtractToolDetails>,
  theme: Theme,
): string {
  if (isImageResult(result)) {
    const format = result.details.contentType?.split("/")[1] ?? "";
    const fileSize = result.details.byteLength ?? 0;

    return theme.fg(
      "dim",
      `Image attached (.${format}): ${formatBytes(fileSize)}`,
    );
  }

  const textLength = getExtractTextLength(result.content);

  if (textLength === 0) {
    return theme.fg("dim", "Empty");
  }

  return theme.fg(
    "dim",
    `${textLength} chars (~${getApproxTokens(textLength)} tokens)`,
  );
}
