import { type SettingItem } from "@earendil-works/pi-tui";
import { type Config } from "../helpers/config";

export function getSettingsList(config: Config): SettingItem[] {
  return [
    {
      id: "limit",
      label: "Results limit",
      description: "Max results from search engines",
      currentValue: String(config.limit),
      values: ["1", "5", "10", "15", "20"],
    },
    {
      id: "llmCanOverrideLimit",
      label: "LLM can override limit",
      description: "Allow the LLM to request fewer results per search",
      currentValue: String(config.llmCanOverrideLimit),
      values: ["false", "true"],
    },
    {
      id: "timeoutMs",
      label: "Timeout",
      description: "Request timeout in milliseconds",
      currentValue: String(config.timeoutMs),
      values: ["5000", "10000", "15000", "30000"],
    },
    {
      id: "safesearch",
      label: "SafeSearch",
      description:
        "Filter explicit content (0 = off, 1 = moderate, 2 = strict)",
      currentValue: String(config.safesearch),
      values: ["0", "1", "2"],
    },
    {
      id: "llmCanPickCategory",
      label: "LLM can pick category",
      description: "Allow the LLM to choose search category",
      currentValue: String(config.llmCanPickCategory),
      values: ["false", "true"],
    },
    {
      id: "allowPrivateUrls",
      label: "Allow private URLs",
      description: "Allow requests to local and private IP ranges",
      currentValue: String(config.allowPrivateUrls),
      values: ["false", "true"],
    },
    {
      id: "verbose",
      label: "Verbose",
      description: "Render results in tool output",
      currentValue: String(config.verbose),
      values: ["false", "true"],
    },
  ] satisfies SettingItem[];
}
