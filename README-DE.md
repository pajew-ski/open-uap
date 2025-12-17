# Universal Agentic Project (DE)

> A bootstraper for a universal agentic project. Let's freaking go!

## Operative Arbeitsabläufe

### 0. Genese (System-Instanziierung)
Ausgeführt durch den ephemeren Bootstrapper zur Generierung dieser Architektur (Nur Referenz):
```bash
bun run lfg.ts
```

### 1. Hydratisierung
Sofort ausführen (falls noch nicht geschehen), um Abhängigkeiten zu installieren:
```bash
bun install
```

### 2. Autonomer Betrieb
Das System ist für agentische Steuerung ausgelegt.
**Übergabe-Instruktion:** Weisen Sie Ihren AI-Agenten an, `llms-full.txt` zu erfassen und `bun test` auszuführen.

## Architektur-Taxonomie
- **`AGENTS.md`**: Das preskriptive Regelwerk. Definiert Verhalten und operative Restriktionen.
- **`llms.txt`**: Der maschinenlesbare Index. Folgt [llmstxt.org](https://llmstxt.org).
- **`llms-full.txt`**: Ein kompilierter, XML-gekapselter Snapshot für One-Shot-Prompting.

## Qualitäts-Schranken
CI erzwingt: Keinen Kontext-Drift, Keine Emojis, Grüne Tests.
