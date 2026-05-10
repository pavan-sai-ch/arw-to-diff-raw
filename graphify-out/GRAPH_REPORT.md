# Graph Report - /Users/pavansai/Documents/coding/arw-converter  (2026-05-10)

## Corpus Check
- Corpus is ~2,326 words - fits in a single context window. You may not need a graph.

## Summary
- 40 nodes · 40 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Conversion Backend & Tools|Conversion Backend & Tools]]
- [[_COMMUNITY_App Shell & Components|App Shell & Components]]
- [[_COMMUNITY_Tool Detection API|Tool Detection API]]
- [[_COMMUNITY_Convert API Logic|Convert API Logic]]
- [[_COMMUNITY_CSS Config|CSS Config]]

## God Nodes (most connected - your core abstractions)
1. `API Route: convert` - 7 edges
2. `Home Page` - 6 edges
3. `API Route: check-tools` - 4 edges
4. `ARW to DNG/TIFF Conversion` - 4 edges
5. `GET()` - 3 edges
6. `POST()` - 3 edges
7. `Adobe DNG Converter Tool` - 3 edges
8. `dcraw Tool` - 3 edges
9. `commandExists()` - 2 edges
10. `dngConverterExists()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `ARW to DNG/TIFF Conversion` --rationale_for--> `API Route: convert`  [INFERRED]
  README.md → src/app/api/convert/route.ts
- `Next.js Server Actions 100mb Limit` --rationale_for--> `API Route: convert`  [INFERRED]
  next.config.ts → src/app/api/convert/route.ts
- `ARW to DNG/TIFF Conversion` --conceptually_related_to--> `Adobe DNG Converter Tool`  [EXTRACTED]
  README.md → src/app/api/check-tools/route.ts
- `ARW to DNG/TIFF Conversion` --conceptually_related_to--> `dcraw Tool`  [EXTRACTED]
  README.md → src/app/api/check-tools/route.ts
- `PostCSS Config` --conceptually_related_to--> `Tailwind CSS Config`  [INFERRED]
  postcss.config.mjs → tailwind.config.ts

## Hyperedges (group relationships)
- **ARW Conversion Pipeline** — component_dropzone, app_page, api_convert, concept_adobe_dng_converter, concept_dcraw [INFERRED 0.95]
- **Tool Detection Flow** — component_toolstatus, api_check_tools, concept_adobe_dng_converter, concept_dcraw [INFERRED 0.95]
- **File Queue Management System** — app_page, component_filequeue, component_dropzone, concept_queue_item [INFERRED 0.90]

## Communities (11 total, 1 thin omitted)

### Community 1 - "Conversion Backend & Tools"
Cohesion: 0.33
Nodes (9): API Route: check-tools, API Route: convert, Adobe DNG Converter Tool, archiver npm Package for ZIP, ARW to DNG/TIFF Conversion, dcraw Tool, Next.js Server Actions 100mb Limit, Next.js Config (+1 more)

### Community 2 - "App Shell & Components"
Cohesion: 0.4
Nodes (6): Root Layout, Home Page, DropZone Component, FileQueue Component, ToolStatus Component, QueueItem Data Structure

### Community 3 - "Tool Detection API"
Cohesion: 0.83
Nodes (3): commandExists(), dngConverterExists(), GET()

### Community 4 - "Convert API Logic"
Cohesion: 0.83
Nodes (3): convertFile(), getAvailableTool(), POST()

## Knowledge Gaps
- **7 isolated node(s):** `PostCSS Config`, `Tailwind CSS Config`, `Next.js Config`, `Root Layout`, `DropZone Component` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `API Route: convert` connect `Conversion Backend & Tools` to `App Shell & Components`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Why does `Home Page` connect `App Shell & Components` to `Conversion Backend & Tools`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `API Route: convert` (e.g. with `Next.js Server Actions 100mb Limit` and `ARW to DNG/TIFF Conversion`) actually correct?**
  _`API Route: convert` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `PostCSS Config`, `Tailwind CSS Config`, `Next.js Config` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._