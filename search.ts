import { Type, type Static } from "typebox";
import { Compile } from "typebox/compile";
import type {
  AgentToolResult,
  ToolRenderResultOptions,
  Theme,
} from "@mariozechner/pi-coding-agent";
import { keyHint } from "@mariozechner/pi-coding-agent";

export interface SearchOptions {
  limit: number;
  timeoutMs: number;
  safesearch: 0 | 1 | 2;
  signal?: AbortSignal;
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  engine: string;
}

export interface SearchResponse {
  results: SearchResult[];
}

const SearchResultSchema = Type.Object({
  title: Type.String(),
  url: Type.String(),
  content: Type.String(),
  engine: Type.Optional(Type.String()),
});

const SearchResponseSchema = Type.Object({
  results: Type.Array(SearchResultSchema),
});

type RawSearchResponse = Static<typeof SearchResponseSchema>;

const searchResponseValidator = Compile(SearchResponseSchema);

function truncate(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}...`;
}

function normalizeSearchResponse(raw: unknown): SearchResponse {
  if (!searchResponseValidator.Check(raw)) {
    throw new Error("Invalid SearxNG response shape");
  }

  const response = raw as RawSearchResponse;

  return {
    results: response.results.map((result) => ({
      title: truncate(result.title, 200),
      url: truncate(result.url, 500),
      content: truncate(result.content, 1000),
      engine: truncate(result.engine ?? "unknown", 50),
    })),
  };
}

export async function search(
  query: string,
  options: SearchOptions,
): Promise<SearchResponse> {
  const baseUrl = process.env.SEARXNG_URL || "http://localhost:8888";

  const url = new URL("/search", baseUrl);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("safesearch", options.safesearch.toString());

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const apiKey = process.env.SEARXNG_API_KEY;
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), options.timeoutMs);

  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutController.signal])
    : timeoutController.signal;

  try {
    const res = await fetch(url.toString(), {
      signal,
      headers,
    });

    if (!res.ok) {
      throw new Error(`SearxNG returned ${res.status} ${res.statusText}`);
    }

    const raw = await res.json();
    const response = normalizeSearchResponse(raw);
    const results = response.results.slice(0, options.limit);

    return { results };
  } finally {
    clearTimeout(timer);
  }
}

export function formatSearchResults(response: SearchResponse): string {
  const results = response.results;

  const resultsString =
    results.length === 0
      ? "No results found. Try changing your query."
      : results
          .map(
            (r, i) =>
              `## **${i + 1}.** ${r.title}\n**URL:** ${r.url}\n${r.content}`,
          )
          .join("\n\n---\n\n");

  return resultsString;
}

export function renderToolResult(
  result: AgentToolResult<{
    query: string;
    resultCount: number;
  }>,
  options: ToolRenderResultOptions,
  theme: Theme,
  verbose: boolean,
): string {
  let text = "";

  if (!verbose) {
    const resultsCount = result.details.resultCount || 0;

    text += `${theme.fg("dim", `${resultsCount !== 0 ? `${resultsCount} results` : "No results"}`)}`;
    return text;
  }

  const output = result.content.find((c) => c.type === "text")?.text ?? "";
  if (output) {
    const lines = output.split("\n");
    const maxLines = options.expanded ? lines.length : 20;
    const displayLines = lines.slice(0, maxLines);
    const remainingLines = lines.length - maxLines;

    text += `\n${displayLines.map((line) => theme.fg("toolOutput", line)).join("\n")}`;

    if (remainingLines > 0) {
      text += `${theme.fg("muted", `\n... (${remainingLines} more lines,`)} ${keyHint("app.tools.expand", "to expand")})`;
    }
  }

  return text;
}
