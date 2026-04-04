# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static portfolio website (no build step, no package manager, no server). Open `index.html` directly in a browser to run it. To enter edit mode, append `?edit=1` to the URL (e.g., `file:///…/index.html?edit=1`).

## Architecture

Three files do all the work:

- **`index.html`** — structure and static content. Profile photo, birthdate, phone, intro text, and education are hardcoded here and edited directly in the HTML.
- **`styles.css`** — all styling.
- **`app.js`** — all runtime logic: edit mode, right-click toolbox, drag-and-drop, modals, canvas layout, GitHub API integration, and localStorage persistence.
- **`published_data.js`** — generated export file. Sets the global `window.__PUBLISHED_PORTFOLIO_DATA__` to freeze canvas state for visitors.

### Data flow

- In edit mode (`?edit=1`): changes are saved to `localStorage` (key: `portfolio_canvas_data`).
- In visit mode (no `?edit=1`): data is loaded from `published_data.js` first; falls back to `localStorage` if the global is absent.
- The "배포 파일 생성" button serializes `localStorage` into a downloadable `published_data.js` to be placed alongside `index.html`.

### Dynamic canvas system

WORK, SKILLS, and PROJECT sections each contain a `.canvas-area.dynamic-area` div (ids: `canvas-career`, `canvas-skills`, `canvas-portfolio`). In edit mode, right-clicking inside a canvas opens a toolbox to add items at the cursor position. Items are absolutely positioned `.draggable-item` elements.

`app.js` key subsystems:
- **Grid snapping** — `GRID_SNAP = 8px`, applied during drag and placement via `snapToGrid()`.
- **Collision avoidance** — `findNearestFreeSpot()` uses an expanding-ring search to find a free slot; `layoutCanvasNoOverlap()` resolves overlaps on load/resize.
- **Responsive reflow** — `layoutCanvasFlowGrid()` reflows items into a wrapping row layout on narrow viewports (≤ 640px breakpoint).
- **GitHub section** — fetches profile, repos, and events from the GitHub REST API using the hardcoded username `kinetas`.

## Editing content

| Content | Where to edit |
|---|---|
| Profile photo, birthdate, phone, intro | `index.html` directly |
| Education | `#educationList` in `index.html` |
| Career / Skills / Project items | Edit mode canvas (right-click in canvas) |
| Contact details | `#contactCard` in `index.html` |
| GitHub username | `#githubUsername` hidden input in `index.html` |

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
