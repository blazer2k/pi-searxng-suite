import { type ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { loadConfig } from "./helpers/config";
import { registerSearchTool } from "./tools/searchTool";
import { registerExtractTool } from "./tools/extractTool";
import { registerConfigCommand } from "./tools/configCommand";

export default function (pi: ExtensionAPI) {
  loadConfig();

  pi.on("session_start", (event, ctx) => {
    loadConfig();
  });

  registerSearchTool(pi);
  registerExtractTool(pi);

  registerConfigCommand(pi);
}
