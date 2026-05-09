import type {
  AgentToolResult,
  ToolRenderResultOptions,
  Theme,
} from "@mariozechner/pi-coding-agent";
import { keyHint } from "@mariozechner/pi-coding-agent";

export function renderTextResult(
  result: AgentToolResult<unknown>,
  options: ToolRenderResultOptions,
  theme: Theme,
  maxCollapsedLines = 20,
): string {
  const output = result.content.find((c) => c.type === "text")?.text ?? "";
  let text = "";
  if (output) {
    const lines = output.split("\n");
    const maxLines = options.expanded ? lines.length : maxCollapsedLines;
    const displayLines = lines.slice(0, maxLines);
    const remainingLines = lines.length - maxLines;

    text += `\n${displayLines.map((line) => theme.fg("toolOutput", line)).join("\n")}`;

    if (remainingLines > 0) {
      text += `${theme.fg("muted", `\n... (${remainingLines} more lines,`)} ${keyHint("app.tools.expand", "to expand")})`;
    }
  }

  return text;
}
