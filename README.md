# Road Ready — New Jersey & New York

A mobile-first, installable web app for practicing the New Jersey and New York automobile knowledge tests. No native mobile build, accounts, server database, paid APIs, or build dependencies are required.

Production domain: https://dmv.l3v.ai. Deployment uses Cloudflare Workers Static Assets, configured in `wrangler.jsonc`. Run `wrangler deploy` with a signed-in account that can deploy Workers and attach the custom domain. The GitHub repository is source storage; automatic deployment on push is not configured.

## Features

- NJ / NY switcher with independent progress and resumable sessions. Existing NJ storage is preserved. There are 84 NJ questions and 50 NY questions, all available in English and Georgian.
- New York mock tests contain 20 questions, exactly four road-sign questions, and require both 14 correct overall and two correct signs. NJ retains its 50-question / 40-correct format. Non-exam practice does not impose the NY sign quota.

- English / ქართული language toggle with questions, choices, explanations, menus and progress labels translated. The saved language is device-local and switching never changes the current question, option order, score or timer. Georgian is an independent study translation; the supplied manual text and road-sign artwork remain in their original English, and US units are retained.

- Ten-question mixed practice with instant explanations.
- Fifty-question mock tests; 40 correct passes the practice target. Optional 30/50-minute challenge timers are app settings, not official exam time limits.
- Topic practice, road-sign images extracted from the supplied manual, and missed-question review.
- Device-local statistics and unfinished-session recovery through localStorage.
- Offline app shell, questions, sign images and manual text after successful first-load service worker caching.
- Web app manifest, home-screen icons, Safari/Chrome installation instructions.

## Run

Requires Node.js 22 or newer. `npm start` serves the authored static app at http://127.0.0.1:8768. `npm test` runs the question-bank and scoring checks. No npm install is necessary.

Deploy the contents of `dist/` to an HTTPS static host. All asset URLs are relative. HTTPS (or localhost for development) is required for service workers and installation. Private hosting may require an online sign-in before first use. Device installation and offline behavior must be tested in the target phone/browser before making platform guarantees.

## Source and accuracy

NY source: user-supplied `mv21.pdf`, 84 PDF pages; printed and PDF page numbers match. NY questions are original paraphrases from chapters 4–11, with page references. Extracted text is in `dist/manual-pages-ny.json`; the bilingual bank is `dist/questions-ny.js`. Format verified against https://dmv.ny.gov/book/export/html/1551. The source PDF and online manual may be different editions; the app does not claim a 2026 NY edition or automatically refresh legal rules. NY sign practice currently uses written shape/color/sign scenarios; NJ retains its extracted sign artwork.

`dist/states.js` owns state-specific banks, chapters, source URLs and exam settings. NJ keeps its original `nj-road-ready-v1` storage key; NY uses `ny-road-ready-v1`, with selection in `road-ready-state`. NY tests cover sign-count and scoring boundaries, bilingual coverage, source references, state isolation and session recovery. Offline cache v3 includes both manuals and both banks.

Source: user-provided **2026 New Jersey Driver Manual**, 243 PDF pages. Question references use printed manual page numbers (PDF page = printed page + 2). This repository contains extracted manual text and 20 cropped signs; it does not include the 44 MB original PDF. Question wording is original and is not the official MVC exam. Read the complete manual when preparing.

Official format reference: https://www.nj.gov/mvc/license/sample_knowledge_test.htm — 50 questions, 40 correct/80% to pass. Online PDF: https://www.nj.gov/mvc/pdf/license/drivermanual.pdf. This app does not automatically update when regulations change. No claim is made about official topic weighting.

`dist/questions.js` is the editable bank. `dist/engine.js` holds scoring/session logic. `dist/app.js` renders the experience. `dist/sw.js` defines the offline asset cache; increment its cache version when publishing changed app content. Extraction scripts require Python, pypdfium2, Pillow (and pypdf for the alternate extractor) and refer to the original source path.

## Validation

Node checks cover unique question IDs, distinct choices, source-page and asset references, scoring boundaries, shuffled mapping, topic filters, mistake clearing, time configuration and valid saved-session structure. Browser visual QA and physical-phone installation have not been run. Optional WebMCP tools are feature-detected; a supported live WebMCP validation context was not available.

Progress is stored only on the current browser/device, does not sync between devices, and is removed if browser storage is cleared. An active timed test continues counting down when the app is closed.
