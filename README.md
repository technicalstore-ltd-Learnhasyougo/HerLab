# Learn-today How to use, Us AI

HerLab is a hands-on project for learning how to build and ship a modern web app with AI tools, written and maintained by Patrick PWilson (onesobad) under the TechStore template.

The centerpiece is the June 2026 AI News page: 35 articles organized into 14 interactive modals (gpt56, opus48, glm52, gemini35, commanda, kimi, lfm, ocr4, gemma4, fable5, fable5_alt, jalapeno, cursor, grokvideo) plus 22 more-to-read items.

Readers can filter by category — All (35), Model (12), Policy (8), Hardware (4), Business (6), Open (5) — with live count badges, and paginate through the results six per page.

Each article opens in a modal with Read Original and Full Report buttons, ESC closes the modal and clears its content, and the page runs a dark theme with four animated background orbs.

The repo is a single-page static site built with HTML, CSS, and JavaScript — no framework, no build step — so it is easy to inspect, edit, and extend.

The Docker setup and GitHub Actions CI workflow (in .github/workflows/ci.yml) show how to containerize and continuously test the project.

Dev folders (V-1 and V-2) hold older and newer versioned copies of the source so you can compare how the page evolved; they are kept out of the main tracking once the current version is stable.

This repository is a living template: clone it, read the code, open the modals, tweak the filters, and use it as a starting point for your own AI news or content pages.

Published on GitHub at https://github.com/technicalstore-ltd-Learnhasyougo/HerLab — contributions and feedback welcome from the HerLab community.
