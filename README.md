# Learn-today How to use, Us AI
HerLab by Patrick PWilson (onesobad) under the TechStore template is a hands-on project for learning to build and ship a modern web app with AI tools.
The centerpiece is the June 2026 AI News page: 35 articles across 14 interactive modals (gpt56, opus48, glm52, gemini35, commanda, kimi, lfm, ocr4, gemma4, fable5, fable5_alt, jalapeno, cursor, grokvideo) and 22 more-to-read items.
Readers filter by category — All (35), Model (12), Policy (8), Hardware (4), Business (6), Open (5) — with live count badges, then paginate six per page.
Each article opens in a modal with Read Original and Full Report buttons; ESC closes it and clears the content, all on a dark theme with four animated background orbs.
The repo is a single-page static site in HTML, CSS, and JavaScript with no framework or build step, so it is easy to inspect, edit, and extend.
A Dockerfile and GitHub Actions CI workflow in .github/workflows/ci.yml show how to containerize and continuously test the project.
Dev folders V-1 and V-2 hold older and newer versioned copies so you can compare how the page evolved; they are kept out of main tracking once stable.
Clone it, open the modals, tweak the filters, and use it as a starting point for your own AI news or content pages.
Published on GitHub at https://github.com/technicalstore-ltd-Learnhasyougo/HerLab — contributions and feedback welcome from the HerLab community.