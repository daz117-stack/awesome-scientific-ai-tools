---
name: add-awesome-entry
description: Add or validate a tool entry in this repo's README.md (an awesome-list of scientific AI tools). Use when the user wants to add a new tool/MCP server/agent skill to the list, or wants an existing entry checked against the list's format and quality rules.
---

# Add an entry to the awesome list

This repo (`awesome-scientific-ai-tools`) is a static, hand-curated list. The
entire deliverable is `README.md`. There is no app code, build, or test
suite — the only "correctness" check is `awesome-lint` and the rules below,
taken from `CONTRIBUTING.md` and `CLAUDE.md`.

## Steps

1. **Confirm scope.** The tool must be related to scientific research and
   use AI, or significantly aid an AI-powered research workflow. It must be
   actively maintained (updated within ~2 years) and either free-tier or in
   widespread academic/commercial use. Do not add papers, datasets, or bare
   model checkpoints.

2. **Pick the single most appropriate category** from the existing `##`
   headings in `README.md` (e.g. `MCP Servers for Research`,
   `AI Agent Skills & Plugins`, `Literature Search & Discovery`, `Citation
   Management`, `Writing & Editing`, `Data Analysis & Visualization`,
   `Scientific Computing`, `Bioinformatics & Genomics`, `Research Workflow
   Automation`, etc. — run `grep -n '^## ' README.md` to see the current
   list). Do not invent a new category; if nothing fits, tell the user to
   open an issue to propose one instead of adding it unilaterally.

3. **Format the entry exactly as:**
   `[Tool Name](URL) - Brief description ending with a period.`
   - One sentence, under 200 characters.
   - Link must resolve to the tool's official site/repo — never guess a URL.
   - No affiliate links.

4. **Check for duplicates.** Search `README.md` for the same URL or tool
   name across all categories — `awesome-lint` flags cross-category
   duplicates as an error.

5. **Insert in alphabetical order within the category where possible.**
   Several categories are already ordered by prominence rather than strict
   alphabetical order — don't reflow an entire section just to alphabetize
   it; only place the new entry sensibly near where it alphabetically belongs.

6. **Do not touch these on purpose:**
   - The `## Footnotes` section (points to `CONTRIBUTING.md`) — don't
     reintroduce a `## Contributing` or `## License` section; both were
     removed because `awesome-lint` flagged them as duplicate content.
   - Translated copies (`README-zh.md`, `README-ja.md`, `README-es.md`,
     `README-de.md`, and the orphaned `README-zh-CN.md`) — these are not
     kept in lockstep with `README.md`; only update them if asked.

7. **Run the lint check** after editing:
   ```bash
   npx awesome-lint
   ```
   Fix anything it flags before considering the change done.
