# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A static "awesome list" — a curated, hand-maintained collection of AI-powered tools, MCP servers, and agent skills for scientific research workflows (literature search → reading → writing → analysis → computing → automation → publishing → funding → collaboration). There is no application code, build step, or test suite. The entire deliverable is `README.md` (plus translated copies).

## Commands

There is no build/lint/test tooling installed in the repo (no `package.json`). Formatting is checked with `awesome-lint`, run ad hoc:

```bash
npx awesome-lint
```

`awesome-lint` is what shaped several existing structural constraints (see below) — run it after editing `README.md` and fix anything it flags before committing.

## Repository structure

- `README.md` — the canonical, English list. This is the source of truth; all other files are secondary.
- `README-zh.md`, `README-ja.md`, `README-es.md`, `README-de.md` — translated copies, linked from the language selector at the top of `README.md`.
- `README-zh-CN.md` — **not** linked from `README.md`'s language selector or any other file. It appears to be a leftover/orphaned duplicate of `README-zh.md` from the initial translation commit (216 vs. 229 lines, different header). Don't treat it as an active translation target unless asked; flag the inconsistency if touching translations.
- `CONTRIBUTING.md` — contribution guidelines for new entries (format, quality bar, PR process).
- `LICENSE` — CC0-1.0 (public domain dedication). The README intentionally has no separate "License" section — see below.

## Structure of README.md

- Starts with a `<div align="center">` header block: title, `awesome.re` badge, one-line tagline, then the language selector line (`[English](README.md) | [中文](README-zh.md) | ...`).
- A `## Contents` section with anchor links to every `##` category, in the same order the categories appear in the body.
- One `##` heading per category, each a flat bullet list of entries.
- Ends with a `## Footnotes` section pointing to `CONTRIBUTING.md` — this is deliberate: earlier revisions had a `## Contributing` section with duplicated instructions and a `## License` section with a CC0 badge, both of which `awesome-lint` flagged as errors (duplicate content is guideline #21 in `CONTRIBUTING.md`; the license lives only in `LICENSE`). Don't reintroduce either.
- The translated READMEs still carry the older pre-lint-fix header style (bold tagline + PR/License badges) — they were not updated when `README.md`'s header was simplified. Keep this in mind: the translations are not kept in structural lockstep with `README.md`, and updating one does not imply updating the others unless asked.

## Entry format and editing rules (from CONTRIBUTING.md)

When adding or editing an entry in `README.md`:

- Format: `[Tool Name](URL) - Brief description ending with a period.`
- One sentence, under 200 characters.
- Add to the single most appropriate existing category; only propose a new category via an issue, don't invent one unilaterally.
- Alphabetical order within a category *where possible* — in practice several categories are not strictly alphabetical (ordered more by prominence/relevance), so don't reflow an entire section just to alphabetize it.
- No duplicate links across categories (an `awesome-lint` check).
- No affiliate links.
- Entries must be tools/servers/skills that are actively maintained (updated within ~2 years) and either free-tier or in widespread academic/commercial use — not papers, datasets, or bare model checkpoints.
- Two categories are specific to this list and worth knowing before adding elsewhere: **MCP Servers for Research** (Model Context Protocol bridges to scientific databases) and **AI Agent Skills & Plugins** (skills/plugins for Claude Code, Cursor, and similar coding agents).
