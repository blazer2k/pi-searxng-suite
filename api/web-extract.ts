import {
  createTimeoutSignal,
  getContentType,
  getExtractKind,
} from "../helpers/request";
import { getValidUrl, absolutizeUrls } from "../helpers/url";
import { type ExtractResponse } from "../extractors/shared";
import { extractPlainText } from "../extractors/text";
import { extractHtml } from "../extractors/html";
import { extractImage } from "../extractors/image";

export interface ExtractOptions {
  timeoutMs: number;
  signal?: AbortSignal;
  allowPrivateUrls: boolean;
}

const headers: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
};

export async function webExtract(
  url: string,
  options: ExtractOptions,
): Promise<ExtractResponse> {
  const validatedUrl = getValidUrl(url, options.allowPrivateUrls);

  if (!validatedUrl) {
    throw new Error(`Invalid URL: ${url}`);
  }

  const timeout = createTimeoutSignal(options.timeoutMs, options.signal);

  try {
    const res = await fetch(validatedUrl, { signal: timeout.signal, headers });

    if (!res.ok) {
      throw new Error(`Fetch returned ${res.status} ${res.statusText}`);
    }

    const contentType = getContentType(res);
    const kind = getExtractKind(contentType);

    switch (kind) {
      case "html":
        return extractHtml(validatedUrl, contentType, res);

      case "text":
        return extractPlainText(validatedUrl, contentType, res);

      case "image":
        return extractImage(validatedUrl, contentType, res);

      default:
        throw new Error(
          `Unsupported content type: ${contentType || "unknown"}`,
        );
    }
  } finally {
    timeout.cleanup();
  }
}
