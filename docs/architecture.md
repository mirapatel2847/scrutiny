# Architecture

> Last updated: 2026-10-17

## Overview

Scrutiny is a document-intelligence platform that ingests structured and
unstructured project artefacts (specs, PRDs, architecture docs, meeting notes)
and surfaces hidden gaps, contradictions, workflow risks, and data concerns as
actionable findings.

```
                         ┌─────────────┐
         Upload          │             │  Parsed chunks
  ──────────────────────▶│  Ingestion  │──────────────▶ MongoDB
                         │  Pipeline   │               (Section)
                         └─────────────┘
                                │
                                │ Sections + Claims
                                ▼
                         ┌─────────────┐
                         │  Structured │
                         │    Store    │
                         └──────┬──────┘
                                │
                    ┌───────────┴──────────┐
                    │                      │
                    ▼                      ▼
             ┌────────────┐        ┌──────────────┐
             │  Detectors │        │    Scorer    │
             │  (rules +  │        │  (weighted   │
             │    LLM)    │        │   formula)   │
             └─────┬──────┘        └──────┬───────┘
                   │                      │
                   └──────────┬───────────┘
                              │
                              ▼
                     ┌────────────────┐
                     │    Report      │
                     │   Generator   │
                     └────────┬───────┘
                              │
                    JSON / Markdown / UI
```

## 1. Ingestion Pipeline

Files enter through the `POST /api/projects/:id/files` endpoint.
The ingestion pipeline runs in a background job (`src/jobs/`) and performs:

1. **MIME detection** – `src/detectors/` identify the file type and route it
   to the correct parser.
2. **Parsing** – `src/parsers/` extract text, preserve line/char offsets, and
   split content into logical `Section` documents.
3. **Claim extraction** – an LLM prompt (stored in `prompts/`) reads each
   section and returns structured `Claim` objects (assumptions, constraints,
   decisions, dependencies).
4. **Deduplication** – `contentHash` (SHA-256) prevents reprocessing identical
   files; the `SourceFile.status` field tracks pipeline progress.

## 2. Structured Store

All artefacts are stored in MongoDB using the following document hierarchy:

```
Project
  └─ SourceFile (many per project)
       └─ Section (many per file)
            └─ Claim (many per section)

Finding (many per project, linked to Claims via evidence[])
  └─ Feedback (many per finding)
```

### Key design choices

| Choice | Rationale |
|---|---|
| Char offsets on Section & Claim | Enables precise source highlighting in the UI |
| `contentHash` index on SourceFile | O(1) deduplication lookup |
| `status` index on SourceFile | Efficient job-queue polling |
| Subdocument scores on Finding | Atomic reads, no join needed for scoring |

## 3. Detectors

Detectors (`src/detectors/`) are pure functions with the signature:

```ts
(claims: Claim[], context: DetectorContext) => Finding[]
```

Four detector families ship by default:

| Family | `Finding.type` | What it looks for |
|---|---|---|
| **Gap** | `gap` | Required information present in one doc but absent in another |
| **Contradiction** | `contradiction` | Two claims that cannot both be true |
| **Workflow** | `workflow` | Missing actors, undefined hand-offs, or unspecified error paths |
| **Data** | `data` | Undefined data schemas, missing SLAs, or conflicting retention rules |

Each detector can augment its raw output with an LLM call (using a prompt from
`prompts/`) when rule-based matching confidence is low.

## 4. Scorer

Every `Finding` carries a `scores` subdocument with five dimensions:

| Dimension | What it measures | Range |
|---|---|---|
| `severity` | Impact if the issue materialises | 1 – 5 |
| `likelihood` | Probability of it causing a problem | 1 – 5 |
| `blastRadius` | Breadth of affected components | 1 – 5 |
| `lateDetection` | How late in the lifecycle it would surface | 1 – 5 |
| `confidence` | Detector's confidence in the finding | 1 – 5 |

**Priority formula** (default):

```
priority = (severity × 2) + likelihood + blastRadius + lateDetection
```

The confidence score is used to flag low-confidence findings as
`isHypothesis: true`, surfacing them separately in the report.

## 5. Report Generator

The report generator (`src/services/reportGenerator.js`) consumes all
`Finding` documents for a project and produces:

- **JSON** – raw API response consumed by the React UI
- **Markdown** – human-readable report downloadable from the UI
- **Tier grouping** – findings are bucketed into P1 / P2 / P3 tiers based on
  their computed `priority` score

The generator stamps each finding with a `recommendation` (LLM-generated or
template-based) and links it back to its `evidence` claims so the UI can
render source-highlighted quotes.
