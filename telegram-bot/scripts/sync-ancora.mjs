// Copies ancora/ancora.html into src/ancora-html.js so the worker can serve it at /panel.
// Run after editing Âncora: `npm run sync:ancora` (deploy runs it too).
import { readFileSync, writeFileSync } from "node:fs";
const html = readFileSync(new URL("../../ancora/ancora.html", import.meta.url), "utf8");
writeFileSync(new URL("../src/ancora-html.js", import.meta.url),
  `// Generated from ancora/ancora.html by scripts/sync-ancora.mjs. Do not edit by hand.\nexport const ANCORA_HTML = ${JSON.stringify(html)};\n`);
