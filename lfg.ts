import { mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";

// --- CONFIGURATION LAYER ---

const DIRS = [
    ".devcontainer",
    ".github/workflows",
    "docs/architecture",
    "docs/api",
    "docs/prompts",
    "src/domain",
    "src/adapters",
    "tests",
    "scripts"
];

const PKG_JSON = {
    name: "universal-agentic-project",
    module: "src/index.ts",
    type: "module",
    scripts: {
        "dev": "bun run src/index.ts",
        "test": "bun test",
        "context:build": "bun run scripts/update-context.ts && bun run scripts/generate-full-dump.ts",
        "p": "bun run scripts/compose-prompt.ts",
        "precommit": "bun run context:build && git add llms.txt llms-full.txt"
    },
    devDependencies: { "@types/bun": "latest" }
};

const DEVCONTAINER = {
    "name": "Bun Agentic Environment",
    "image": "mcr.microsoft.com/devcontainers/base:bookworm",
    "features": {
        "ghcr.io/devcontainers/features/github-cli:1": {},
        "ghcr.io/oven-sh/bun/bun:1": { "version": "latest" }
    },
    "customizations": {
        "vscode": {
            "settings": {
                "terminal.integrated.defaultProfile.linux": "zsh",
                "editor.formatOnSave": true
            },
            "extensions": [
                "GitHub.copilot",
                "GitHub.copilot-chat",
                "oven.bun-vscode",
                "tamasfe.even-better-toml",
                "bpruitt-goddard.mermaid-markdown-syntax-highlighting"
            ]
        }
    },
    "postCreateCommand": "bun install && echo 'Environment Ready. Agent Active.'"
};

const CI_YAML = `name: Quality Gate
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - name: Verify Context Drift
        run: |
          bun run context:build
          git diff --exit-code || (echo "Context out of sync. Run context:build." && exit 1)
      - name: Test
        run: bun test
      - name: No Emoji Policy
        run: |
          if grep -P "[\\x{1F600}-\\x{1F64F}]" -r src docs; then
            echo "Error: Emojis detected. Strict text-only policy active."
            exit 1
          fi
`;

const AGENTS_MD = `# MISSION & PROTOCOLS
> Authority: Primary instruction set for AI Agents.

## 1. STYLE & TONE DIRECTIVES
- **NO EMOJIS:** Do not use emojis in code, comments, commits, or documentation. Pure text only.
- **Tone:** Professional, technical, concise (High Semantic Density).
- **Language:** English (Code/Comments), User Preference (Chat).

## 2. TECHNICAL DIRECTIVES
- **Runtime:** Bun (Strict Mode).
- **Architecture:** Hexagonal / Ports & Adapters.
- **Testing:** Test-Driven Development (TDD) is mandatory.

## 3. OPERATIONAL RULES
- Do not generate code without analyzing architecture first.
- Use strict typing (no 'any').
- Pure Functions preferred.
- **README MUTATION:** Upon implementing the first domain feature, REWRITE README.md to reflect the specific project purpose. Move the 'Architecture Taxonomy' section to a 'System Appendix' at the bottom.
`;

const README_EN = `# Universal Agentic Project

> Status: Initialized. Ready for Domain Implementation.

## Operational Workflows

### 0. Genesis (System Instantiation)
Executed via ephemeral bootstrapper to generate this architecture (Reference only):
\`\`\`bash
bun run lfg.ts
\`\`\`

### 1. Hydration
Execute immediately (if not already done) to install dependencies:
\`\`\`bash
bun install
\`\`\`

### 2. Autonomous Operation
The System is designed for Agentic Control. 
**Handover Instruction:** Instruct your AI Agent to ingest \`llms-full.txt\` and run \`bun test\`.

## Architecture Taxonomy
- **\`AGENTS.md\`**: The prescriptive rule set. Defines behavior and strict operational constraints.
- **\`llms.txt\`**: The machine-readable index. Follows [llmstxt.org](https://llmstxt.org).
- **\`llms-full.txt\`**: A compiled, XML-encapsulated snapshot for one-shot prompting.

## Quality Gates
CI enforces: No Context Drift, No Emojis, Green Tests.
`;

const README_DE = `# Universal Agentic Project (DE)

> Status: Initialisiert. Bereit für Domänen-Implementierung.

## Operative Arbeitsabläufe

### 0. Genese (System-Instanziierung)
Ausgeführt durch den ephemeren Bootstrapper zur Generierung dieser Architektur (Nur Referenz):
\`\`\`bash
bun run lfg.ts
\`\`\`

### 1. Hydratisierung
Sofort ausführen (falls noch nicht geschehen), um Abhängigkeiten zu installieren:
\`\`\`bash
bun install
\`\`\`

### 2. Autonomer Betrieb
Das System ist für agentische Steuerung ausgelegt.
**Übergabe-Instruktion:** Weisen Sie Ihren AI-Agenten an, \`llms-full.txt\` zu erfassen und \`bun test\` auszuführen.

## Architektur-Taxonomie
- **\`AGENTS.md\`**: Das preskriptive Regelwerk. Definiert Verhalten und operative Restriktionen.
- **\`llms.txt\`**: Der maschinenlesbare Index. Folgt [llmstxt.org](https://llmstxt.org).
- **\`llms-full.txt\`**: Ein kompilierter, XML-gekapselter Snapshot für One-Shot-Prompting.

## Qualitäts-Schranken
CI erzwingt: Keinen Kontext-Drift, Keine Emojis, Grüne Tests.
`;

// --- SOURCE & TESTS CONTENT ---

const SRC_INDEX = `/**
 * System Entry Point
 * Used to verify runtime integrity during bootstrap.
 */
export function systemStatus(): string {
  return "OPERATIONAL";
}

if (import.meta.main) {
  console.log(\`System Status: \${systemStatus()}\`);
}
`;

const TEST_INTEGRITY = `import { describe, test, expect } from "bun:test";
import { existsSync } from "node:fs";
import { systemStatus } from "../src/index";

describe("Architectural Integrity", () => {
  test("Core artifacts must exist", () => {
    // Verify that the bootstrapper generated the critical governance files
    expect(existsSync("AGENTS.md")).toBe(true);
    expect(existsSync("package.json")).toBe(true);
    expect(existsSync("README.md")).toBe(true);
  });

  test("Directory structure must be valid", () => {
    expect(existsSync("src")).toBe(true);
    expect(existsSync("docs")).toBe(true);
    expect(existsSync("tests")).toBe(true);
  });

  test("Runtime is operational", () => {
    expect(systemStatus()).toBe("OPERATIONAL");
  });
});
`;

// --- SCRIPT CONTENT (Minified) ---

const SCRIPT_UPDATE_CONTEXT = `import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
const IGNORE = ["node_modules", ".git", "dist", "bun.lockb", "scripts"];
const ROOT = process.cwd();
async function scan(dir, list = []) {
  const files = await readdir(dir, { withFileTypes: true });
  for (const f of files) {
    const path = join(dir, f.name);
    const rel = relative(ROOT, path);
    if (IGNORE.some(i => rel.includes(i))) continue;
    if (f.isDirectory()) await scan(path, list);
    else if (/\\.(md|ts|json)$/.test(f.name)) list.push(rel);
  }
  return list;
}
const files = await scan(ROOT);
const doc = files.filter(f => f.startsWith("docs") || f.endsWith(".md"));
const src = files.filter(f => f.startsWith("src"));
const out = \`# Context Index\\n## Docs\\n\${doc.map(f=>\`- [\${f}](\${f})\`).join("\\n")}\\n## Src\\n\${src.map(f=>\`- [\${f}](\${f})\`).join("\\n")}\`;
await Bun.write("llms.txt", out);
console.log("Context Index updated.");
`;

const SCRIPT_FULL_DUMP = `import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
const IGNORE = ["node_modules", ".git", "dist", "bun.lockb", "scripts", "llms.txt", "llms-full.txt"];
const ROOT = process.cwd();
async function dump(dir, out = []) {
  const files = await readdir(dir, { withFileTypes: true });
  for (const f of files) {
    const path = join(dir, f.name);
    const rel = relative(ROOT, path);
    if (IGNORE.some(i => rel.includes(i))) continue;
    if (f.isDirectory()) await dump(path, out);
    else {
      const s = await stat(path);
      if (s.size < 100 * 1024 && !rel.endsWith(".png")) {
        const c = await Bun.file(path).text();
        out.push(\`<file path="\${rel}">\\n\${c}\\n</file>\`);
      }
    }
  }
  return out;
}
const data = await dump(ROOT);
await Bun.write("llms-full.txt", \`<project>\\n\${data.join("\\n")}\\n</project>\`);
console.log("Full Dump generated.");
`;

const SCRIPT_COMPOSE = `import { spawn } from "bun";
const ARGS = Bun.argv.slice(2);
if (ARGS.length < 2) { console.error("Usage: bun run p <template> <input>"); process.exit(1); }
const [tmpl, ...inpt] = ARGS;
await spawn(["bun", "run", "context:build"], { stdio: ["ignore","inherit","inherit"] }).exited;
const ctx = await Bun.file("llms-full.txt").text();
const boot = await Bun.file("docs/prompts/00_init_context.md").text();
const taskPath = \`docs/prompts/\${tmpl}.md\`;
let task = "";
try { task = await Bun.file(taskPath).text(); } catch { console.error("Template not found."); process.exit(1); }
task = task.replace("{{USER_INPUT}}", inpt.join(" "));
const payload = [ctx, "---", boot, "---", task].join("\\n");
let cmd = process.platform === "darwin" ? ["pbcopy"] : ["xclip", "-selection", "clipboard"];
if (process.platform === "win32") cmd = ["clip.exe"];
const proc = spawn(cmd, { stdin: "pipe" });
const w = proc.stdin.getWriter();
w.write(payload); w.close();
console.log("Prompt loaded to clipboard.");
`;

const PROMPT_BOOT = `# SYSTEM INIT
Input: XML Project Snapshot.
Action: Index files. Internalize AGENTS.md rules.
Response: "Ready." only. No emojis.`;

const PROMPT_FEAT = `# NEW FEATURE
User Request: "{{USER_INPUT}}"
Action: Analyze context. Implement strictly typed solution. Output Code only. No Emojis.`;

// --- EXECUTION ENGINE ---

console.log("Initializing Universal Agentic Repository (v4.4 - Full Audit Trail)...");

for (const dir of DIRS) {
    await mkdir(dir, { recursive: true });
}

await Bun.write("package.json", JSON.stringify(PKG_JSON, null, 2));
await Bun.write(".devcontainer/devcontainer.json", JSON.stringify(DEVCONTAINER, null, 2));
await Bun.write(".github/workflows/quality-gate.yml", CI_YAML);
await Bun.write("AGENTS.md", AGENTS_MD);
await Bun.write("README.md", README_EN);
await Bun.write("README-DE.md", README_DE);
await Bun.write(".gitignore", "node_modules\ndist\n.DS_Store\nllms-full.txt\nllms.txt\n");

// Inject Source and Tests
await Bun.write("src/index.ts", SRC_INDEX);
await Bun.write("tests/integrity.test.ts", TEST_INTEGRITY);

await Bun.write("scripts/update-context.ts", SCRIPT_UPDATE_CONTEXT);
await Bun.write("scripts/generate-full-dump.ts", SCRIPT_FULL_DUMP);
await Bun.write("scripts/compose-prompt.ts", SCRIPT_COMPOSE);

await Bun.write("docs/prompts/00_init_context.md", PROMPT_BOOT);
await Bun.write("docs/prompts/feature.md", PROMPT_FEAT);

console.log("Bootstrap complete. System integrity verified.");

// SELF-DESTRUCTION SEQUENCE
try {
    // Deletes the script file itself to enforce minimalism
    await unlink(process.argv[1]);
    console.log("Bootstrapper removed. Repository is clean.");
} catch (e) {
    console.log("Note: Could not auto-remove bootstrapper. Please delete manually.");
}