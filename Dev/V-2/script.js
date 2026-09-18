/**
 * AI News June 2026 — Filter, Pagination, Modal, More-to-Read, Stat Counters
 * v4 — expanded: 11 modal entries, 20 more-to-read items, count badges, section filtering, featured-body
 */
(function () {
  'use strict';

  var filterBtns = document.querySelectorAll('.filter-btn');
  var cards      = document.querySelectorAll('.card');
  var paginationEl = document.getElementById('pagination');
  var moreLinks  = document.querySelectorAll('.more-link');
  var modalOverlay = document.getElementById('modalOverlay');
  var modalBox    = document.getElementById('modalBox');
  var modalSummary = document.getElementById('modalSummary');
  var modalMetrics = document.getElementById('modalMetrics');
  var modalBody    = document.getElementById('modalBody');
  var modalClose   = document.getElementById('modalClose');
  var featuredBody = document.getElementById('featuredBody');

  // ── Category → count-badge ID map ──
  var catCountIds = {
    all:     'countAll',
    model:   'countModel',
    policy:  'countPolicy',
    hardware:'countHardware',
    business:'countBusiness',
    open:    'countOpen'
  };

  // ── Pagination state ──
  var pageSize = 6;
  var currentPage = 1;

  // ── Section title elements, keyed by data-section ──
  var sectionTitles = {};
  document.querySelectorAll('.section-title[data-section]').forEach(function (el) {
    sectionTitles[el.getAttribute('data-section')] = el;
  });

  // ── Helper: count cards currently visible per category ──
  function countCardsByCategory(cat) {
    var n = 0;
    cards.forEach(function (card) {
      var c = card.getAttribute('data-category');
      if (!card.classList.contains('hidden') && (cat === 'all' || c === cat)) n++;
    });
    return n;
  }

  function updateCountBadges() {
    var activeFilter = 'all';
    filterBtns.forEach(function (b) {
      if (b.classList.contains('active')) activeFilter = b.getAttribute('data-filter');
    });
    Object.keys(catCountIds).forEach(function (cat) {
      var id = catCountIds[cat];
      var el = document.getElementById(id);
      if (!el) return;
      var v = countCardsByCategory(cat);
      el.textContent = v;
      // If filter is active and this category isn't it, dim the badge
      if (activeFilter !== 'all' && activeFilter !== cat) {
        el.style.opacity = '0.35';
      } else {
        el.style.opacity = '1';
      }
    });
  }

  // ── Hide/show section titles based on whether their cards are visible ──
  function updateSectionVisibility() {
    var activeFilter = 'all';
    filterBtns.forEach(function (b) {
      if (b.classList.contains('active')) activeFilter = b.getAttribute('data-filter');
    });
    // Always show: models, timeline, featured, stanford, research, analysis
    var alwaysShow = ['models', 'timeline', 'featured', 'stanford', 'research', 'analysis'];
    Object.keys(sectionTitles).forEach(function (sec) {
      var el = sectionTitles[sec];
      if (!el) return;
      if (alwaysShow.indexOf(sec) !== -1) {
        el.classList.remove('hidden-section');
        return;
      }
      // For category sections (hardware, policy, business, products):
      // hide if no cards of that category are visible
      var catMap = { hardware: 'hardware', policy: 'policy', business: 'business', products: 'model' };
      var cat = catMap[sec];
      if (cat) {
        var visible = countCardsByCategory(cat);
        if (visible === 0) {
          el.classList.add('hidden-section');
        } else {
          el.classList.remove('hidden-section');
        }
      }
    });
  }

  function showPage(page) {
    var visibleCards = [];
    cards.forEach(function (card) {
      if (!card.classList.contains('hidden')) visibleCards.push(card);
    });

    var start = (page - 1) * pageSize;
    var end   = start + pageSize;

    visibleCards.forEach(function (card, i) {
      if (i >= start && i < end) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });

    currentPage = page;
    updatePaginationUI();
  }

  function updatePaginationUI() {
    if (!paginationEl) return;
    var totalCards = countVisibleCards();
    var totalPages = Math.max(1, Math.ceil(totalCards / pageSize));

    var firstDisabled  = currentPage <= 1;
    var lastDisabled   = currentPage >= totalPages;

    var inner = '';
    inner += '<button class="pagination-btn" id="pgFirst" '
            + (firstDisabled ? 'disabled' : '')
            + '>« First</button>';
    inner += '<button class="pagination-btn" id="pgPrev" '
            + (firstDisabled ? 'disabled' : '')
            + '>‹ Prev</button>';
    inner += '<span class="pagination-info">'
            + (totalPages > 1
                ? 'Page <strong>' + currentPage + '</strong> of ' + totalPages + '  ·  '
                : '')
            + totalCards + ' article' + (totalCards !== 1 ? 's' : '')
            + '</span>';
    inner += '<button class="pagination-btn" id="pgNext" '
            + (lastDisabled ? 'disabled' : '')
            + '>Next ›</button>';
    inner += '<button class="pagination-btn" id="pgLast" '
            + (lastDisabled ? 'disabled' : '')
            + '>Last »</button>';

    paginationEl.innerHTML = inner;

    var firstBtn = document.getElementById('pgFirst');
    var prevBtn  = document.getElementById('pgPrev');
    var nextBtn  = document.getElementById('pgNext');
    var lastBtn  = document.getElementById('pgLast');

    if (firstBtn) firstBtn.addEventListener('click', function () { showPage(1); });
    if (prevBtn)  prevBtn.addEventListener('click', function () {
      if (currentPage > 1) showPage(currentPage - 1);
    });
    if (nextBtn)  nextBtn.addEventListener('click', function () {
      var tp = Math.max(1, Math.ceil(countVisibleCards() / pageSize));
      if (currentPage < tp) showPage(currentPage + 1);
    });
    if (lastBtn)  lastBtn.addEventListener('click', function () {
      var tp = Math.max(1, Math.ceil(countVisibleCards() / pageSize));
      showPage(tp);
    });
  }

  function countVisibleCards() {
    var count = 0;
    cards.forEach(function (card) {
      if (!card.classList.contains('hidden')) count++;
    });
    return count;
  }

  // ── Filter behavior ──
  function applyFilter(filter) {
    cards.forEach(function (card) {
      var cat = card.getAttribute('data-category');
      if (filter === 'all' || cat === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
    currentPage = 1;
    updatePaginationUI();
    updateCountBadges();
    updateSectionVisibility();
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      applyFilter(filter);
    });
  });

  // ── Modal system ──
  var modalData = {
    fable5: {
      summary: 'Fable 5 & Mythos 5: The First Frontier Model Pulled by Government Order',
      metrics: [
        { label: 'Lifespan',  val: '72h',    cls: 'high'   },
        { label: 'Orgs hit',  val: '150+',   cls: 'high'   },
        { label: 'Countries', val: '15+',    cls: 'medium' },
        { label: 'Precedent', val: '1st',    cls: 'high'   },
        { label: 'Directive', val: 'ECRA',   cls: 'medium' }
      ],
      body: [
        '<p>On <strong>June 9, 2026</strong>, Anthropic launched Claude Fable 5 (safe general-use) and Mythos 5 (cyber/bio, restricted to Project Glasswing — approximately 150 organizations in 15+ countries).</p>',
        '<p>On <strong>June 11</strong>, Amazon\'s Andy Jassy escalated a security finding to Treasury Secretary Scott Bessent. A "narrow, non-universal jailbreak" prompt revealed previously known minor vulnerabilities in Fable 5\'s codebase-fixing ability.</p>',
        '<p>On <strong>June 12, 5:21pm ET</strong>, the US Commerce Department issued an "is-informed" letter under the Export Control Reform Act. The directive ordered Anthropic to bar all foreign nationals from both models. Anthropic complied by disabling them for <em>everyone</em> globally — the first time a deployed commercial AI model was pulled by state order.</p>',
        '<p>On <strong>July 1</strong>, access was restored to US customers after a 19-day review. Foreign national access remained restricted.</p>',
        '<p><strong>Why it matters:</strong> Frontier models can now be treated like export-controlled technology — not software. If you build on a frontier API, your infrastructure can be disabled overnight by a regulatory action outside your control. Multi-model redundancy is no longer optional.</p>',
        '<p><strong>The technical finding:</strong> The vulnerability was in Fable 5\'s code-generation pipeline — a prompt injection path that could produce vulnerable code under specific adversarial conditions. Mythos 5 shared the same base model and was pulled as a precaution.</p>'
      ]
    },
    fable5_alt: {
      summary: 'Full Report: The Fable 5 / Mythos 5 Shutdown — Complete Timeline',
      metrics: [
        { label: 'Launch',     val: 'Jun 9',  cls: 'high'   },
        { label: 'Escalation', val: 'Jun 11', cls: 'medium' },
        { label: 'Shutdown',   val: 'Jun 12', cls: 'high'   },
        { label: 'Restored',   val: 'Jul 1',  cls: 'medium' },
        { label: 'Duration',   val: '19 days', cls: 'high'  }
      ],
      body: [
        '<p><strong>Background:</strong> Anthropic\'s Claude Mythos 5 was a frontier model optimized for cybersecurity and biological research, available only to cleared organizations under Project Glasswing. Fable 5 was the same core model with protective redirect layers for general consumer use.</p>',
        '<p><strong>June 9 — Launch:</strong> Both models went live. Mythos 5 was restricted to ~150 organizations; Fable 5 was publicly available. Early benchmarks showed ~98% on advanced biology exams and elite vulnerability-hunting scores.</p>',
        '<p><strong>June 11 — Escalation:</strong> Amazon CEO Andy Jassy personally escalated a security concern to Treasury Secretary Bessent. Researchers had demonstrated a narrow jailbreak that exploited Fable 5\'s code-correction capability to suggest vulnerable patterns under adversarial framing.</p>',
        '<p><strong>June 12, 5:21pm ET — The directive:</strong> The Commerce Department\'s Bureau of Industry and Security issued an "is-informed" letter under the Export Control Reform Act (ECRA). The letter did not name Anthropic publicly but the effect was immediate: Anthropic\'s compliance team disabled both models for all users globally within hours.</p>',
        '<p><strong>The precedent:</strong> This was the first use of export-control mechanisms against AI model access. The legal rationale: frontier models with cyber/bio capabilities constitute "controlled technology" under ECRA, not merely software.</p>',
        '<p><strong>July 1 — Partial restoration:</strong> After a 19-day review, US customers regained access to Fable 5 (with enhanced safeguards). Mythos 5 remained restricted. Foreign national access to both models stayed blocked indefinitely.</p>',
        '<p><strong>What changed for the industry:</strong> Every company building on frontier APIs now faces regulatory risk as a first-order concern. Multi-model fallback strategies, on-premises options, and open-weight alternatives moved from "nice to have" to essential infrastructure planning.</p>'
      ]
    },
    gpt56: {
      summary: 'GPT-5.5 → GPT-5.6: OpenAI\'s Next Leap (Sol, Terra, Luna)',
      metrics: [
        { label: 'GDPval',       val: '84.9%', cls: 'high'   },
        { label: 'OSWorld',      val: '78.7%', cls: 'high'   },
        { label: 'Coding boost', val: '3.7×',  cls: 'high'   },
        { label: 'Context',      val: '1.5M',  cls: 'high'   },
        { label: 'Variants',     val: '3',     cls: 'medium' }
      ],
      body: [
        '<p><strong>GPT-5.5</strong> was OpenAI\'s first fully retrained base model since GPT-4.5. It brought omnimodal capability (text, image, audio, video in a single model), scored 84.9% on GDPval (a graduate-level economics benchmark) and 78.7% on OSWorld (computer-use agent benchmark).</p>',
        '<p><strong>GPT-5.6</strong> launched as three specialized variants in late June 2026:</p>',
        '<p><strong>Sol</strong> — the flagship, focused on advanced reasoning and coding. Delivered a 3.7× improvement on coding tasks vs GPT-4o, with a 1.5M-token context window. Initially released as a government-curated limited preview with national security oversight — reflecting the new regulatory climate after the Fable 5 incident.</p>',
        '<p><strong>Terra</strong> — optimized for scientific and mathematical reasoning, with particular strength in climate modeling and materials science tasks.</p>',
        '<p><strong>Luna</strong> — the lightweight variant, designed for consumer devices and latency-sensitive applications. Retained most of the capability gains at a fraction of the inference cost.</p>',
        '<p><strong>What changed:</strong> OpenAI\'s release strategy shifted noticeably. The government-curated preview for Sol signaled that frontier models would face tighter scrutiny. The three-variant approach showed a move toward specialized models rather than one-size-fits-all.</p>'
      ]
    },
    opus48: {
      summary: 'Claude Opus 4.8: Anthropic\'s Modest but Tangible Step',
      metrics: [
        { label: 'AA Index',    val: '61.4',  cls: 'high'   },
        { label: 'SWE-bench',   val: '69.2%', cls: 'high'   },
        { label: 'Verified',    val: '88.6%', cls: 'high'   },
        { label: 'Speed mode',  val: '2.5×',  cls: 'medium' },
        { label: 'Cost factor', val: '1/3',   cls: 'medium' }
      ],
      body: [
        '<p>Claude Opus 4.8 was described by Anthropic as a "modest but tangible improvement" over previous versions — a characterization that undersold its significance on specific benchmarks.</p>',
        '<p>It took the lead on the Artificial Analysis Intelligence Index at 61.4, edging out competitors that had been trading the top spot throughout early 2026.</p>',
        '<p>On SWE-bench Pro — the definitive software-engineering benchmark — Opus 4.8 scored 69.2%, with 88.6% on the verified subset. This made it the strongest model for production coding tasks at launch.</p>',
        '<p>A new 2.5× speed mode ran at approximately 1/3 the cost of the standard mode, making it viable for high-volume coding workflows where latency matters more than absolute peak capability.</p>',
        '<p>Anthropic emphasized training for "greater honesty" — the model was less likely to fabricate capabilities or endorse unsafe approaches when asked. This aligned with the company\'s constitutional-AI approach and the post-Fable-5 industry focus on safety.</p>'
      ]
    },
    gemini35: {
      summary: 'Gemini 3.5 Flash + Computer Use: Google\'s Agentic Turn',
      metrics: [
        { label: 'AA Index',       val: '55',     cls: 'high'   },
        { label: 'Index gain',     val: '+9 pts', cls: 'high'   },
        { label: 'Agent rank',     val: '#3/124', cls: 'high'   },
        { label: 'Output speed',   val: '280+ tok/s', cls: 'medium' },
        { label: 'Computer use',   val: 'Built-in', cls: 'high'  }
      ],
      body: [
        '<p>Gemini 3.5 Flash was Google\'s high-throughput model — fast, cheap, and increasingly capable. It scored 55 on the Artificial Analysis Intelligence Index, a 9-point improvement over its predecessor.</p>',
        '<p>Its standout feature was agentic tool use: it ranked #3 out of 124 models on the agentic tool-use benchmark, behind only the most expensive frontier models. At 280+ output tokens per second, it was among the fastest models available.</p>',
        '<p>On June 24, Google added built-in computer use to Gemini 3.5 Flash — native browsing, application automation, and cross-platform reasoning. This wasn\'t a separate tool or API; it was integrated directly into the model\'s capabilities.</p>',
        '<p>Google also launched Gemini 3.5 Live Translate on June 9 — real-time speech-to-speech translation in 70+ languages, preserving natural intonation and eliminating awkward pauses. The lag was measured in a few seconds, making it usable for live conversation.</p>',
        '<p>Gemini 3.5 Pro was expected imminent — a signal that Google was pushing its model lineup forward rapidly in response to competitive pressure from OpenAI and Anthropic.</p>'
      ]
    },
    commanda: {
      summary: 'Command A+ & North Mini Code: Cohere\'s Agentic Push',
      metrics: [
        { label: 'Command A+ params', val: '218B',   cls: 'high'   },
        { label: 'Active MoE',         val: '25B',    cls: 'medium' },
        { label: 'Languages',          val: '48',     cls: 'high'   },
        { label: 'North Code params',  val: '30B',    cls: 'medium' },
        { label: 'North active',       val: '3B',     cls: 'low'    }
      ],
      body: [
        '<p>Cohere, traditionally known for enterprise retrieval and search models, made a significant expansion into agentic and coding AI with its June 9 release.</p>',
        '<p><strong>Command A+</strong> was a 218B-parameter MoE model with 25B active parameters per token. It handled both vision and language, supported 48 languages, and was explicitly built for agentic workflows — tool use, multi-step reasoning, and API integration.</p>',
        '<p><strong>North Mini Code</strong> was Cohere\'s first coding-specific model: 30B total parameters with a 3B-active coding sub-model. While smaller than Kimi K2.7-Code or GPT-5.6 Sol, it targeted a different segment — fast, cheap code assistance for enterprise development teams already in the Cohere ecosystem.</p>',
        '<p>The combination signaled Cohere\'s ambition to move beyond document understanding into the agentic-coding space that OpenAI, Anthropic, and Moonshot were dominating.</p>'
      ]
    },
    kimi: {
      summary: 'Kimi K2.7-Code: Moonshot\'s 1T Coding Beast',
      metrics: [
        { label: 'Total params',  val: '1T',       cls: 'high'   },
        { label: 'Active MoE',    val: '32B',      cls: 'high'   },
        { label: 'Context',       val: '262K',     cls: 'high'   },
        { label: 'Bench gain',    val: '+21.8%',  cls: 'high'   },
        { label: 'Reasoning tok', val: '-30%',     cls: 'medium' }
      ],
      body: [
        '<p>Kimi K2.7-Code from Moonshot AI was released on June 12 — the same day as the Fable 5 shutdown, which partially overshadowed it. That was unfortunate, because it was a significant model.</p>',
        '<p>At 1 trillion total parameters with 32B active per token, it was one of the largest coding-specific models available. The 262K-token context window let it ingest entire codebases for analysis and refactoring.</p>',
        '<p>Compared to K2.6, it used 30% fewer reasoning tokens — a meaningful efficiency gain for production use where cost scales with token count. On the Kimi Code Bench v2, it showed a 21.8% improvement over its predecessor.</p>',
        '<p>Kimi K2.7-Code was part of a broader trend: Chinese AI labs were producing increasingly competitive open and semi-open models. GLM-5.2 (also June 2026) and Kimi K2.7-Code together represented a serious challenge to the OpenAI/Anthropic duopoly on coding tasks.</p>'
      ]
    },
    lfm: {
      summary: 'LFM2.5-230M: Liquid AI\'s Non-Transformer on Device',
      metrics: [
        { label: 'Parameters',   val: '230M',   cls: 'high'   },
        { label: 'Runs on',      val: 'Pi/phone', cls: 'medium' },
        { label: 'Architecture', val: 'Liquid', cls: 'high'   },
        { label: 'Vs Transformers', val: 'Matches', cls: 'medium' },
        { label: 'On-device',    val: 'Yes',    cls: 'high'   }
      ],
      body: [
        '<p>Liquid AI\'s LFM2.5-230M, released June 25, was a deliberate challenge to the transformer orthodoxy. At just 230 million parameters, it ran on Raspberry Pi and smartphones — hardware that would struggle with a 1B+ transformer.</p>',
        '<p>The "liquid state" architecture was non-transformer. It used a different mathematical framework for sequence modeling that Liquid AI had been developing for several years. The claim was that it could match much larger transformer models on specific tasks while using a fraction of the compute.</p>',
        '<p>This mattered because inference cost was becoming a bottleneck. As models grew larger, the economics of running them at scale got harder. LFM2.5 showed there were alternative paths — architectures that weren\'t just "more transformers" but fundamentally different approaches to the same problem.</p>',
        '<p>It was part of a hardware-and-architecture diversification trend that also included Nvidia\'s RTX Spark (AI PC chip), OpenAI\'s Jalapeño (custom inference silicon), and IBM\'s analog/neuromorphic research.</p>'
      ]
    },
    ocr4: {
      summary: 'Mistral OCR 4: Document Understanding at Scale',
      metrics: [
        { label: 'Languages',     val: '170',      cls: 'high'   },
        { label: 'Win rate',      val: '72%',      cls: 'high'   },
        { label: 'Output',        val: 'Structured', cls: 'medium' },
        { label: 'Confidence',    val: 'Scores',   cls: 'medium' },
        { label: 'Self-hostable', val: 'Yes',      cls: 'high'   }
      ],
      body: [
        '<p>Mistral OCR 4, released June 23, set a new standard for document understanding. It handled 170 languages and produced structured output — not just extracted text, but bounding boxes, layout tags, and confidence scores for every element.</p>',
        '<p>In head-to-head testing, it beat leading commercial OCR systems 72% of the time. That\'s a significant margin in a mature field where improvements are usually measured in single-digit percentage points.</p>',
        '<p>The structured output format was key: instead of a text dump, OCR 4 produced machine-readable documents with layout information preserved. This made it directly usable for document-processing pipelines without additional parsing.</p>',
        '<p>It was self-hostable and fast — important for enterprises dealing with sensitive documents that couldn\'t be sent to a cloud API. Mistral\'s licensing made it accessible to a wide range of users.</p>',
        '<p>OCR 4 fit into a broader pattern: June 2026 saw real progress in specialized AI tools (OCR, translation, video generation, coding) rather than just general-purpose chat models. The field was maturing beyond the "one big model does everything" phase.</p>'
      ]
    },
    gemma4: {
      summary: 'Gemma 4 12B + Leanstral 1.5: Google\'s Open-Weight Push',
      metrics: [
        { label: 'Gemma params',  val: '12B',     cls: 'high'   },
        { label: 'RAM needed',    val: '16GB',    cls: 'medium' },
        { label: 'Modalities',    val: 'Vision+Voice', cls: 'high' },
        { label: 'Leanstral',     val: 'Lean 4', cls: 'medium' },
        { label: 'Hosting',       val: 'Local',   cls: 'high'   }
      ],
      body: [
        '<p>Google\'s Gemma 4 12B, released June 23, was an open-weight multimodal model that ran locally on laptops with 16GB of RAM. It handled vision and native voice input — not just text.</p>',
        '<p>The significance was accessibility: a capable multimodal model that didn\'t require a datacenter to run. Developers could experiment with vision and voice AI on consumer hardware, lowering the barrier to entry for multimodal applications.</p>',
        '<p>Alongside it, Mistral released Leanstral 1.5 — an improved formal-proof model for the Lean 4 theorem prover. Formal verification was a niche but important area where AI was making concrete progress, and Leanstral 1.5 pushed the state of the art further.</p>',
        '<p>Together, Gemma 4 and Leanstral 1.5 represented Google and Mistral\'s continued commitment to open-weight models as a complement to their commercial offerings — a hedge against the collapsing proprietary moat that GLM-5.2 had demonstrated was real.</p>'
      ]
    },
    glm52: {
      summary: 'GLM-5.2: The Open-Weight Model That Beat GPT-5.5',
      metrics: [
        { label: 'SWE-bench',     val: '62.1%',  cls: 'high'   },
        { label: 'FrontierSWE',  val: '74.4%',  cls: 'high'   },
        { label: 'Cost/M input', val: '$1.40',   cls: 'high'   },
        { label: 'Cost/M output', val: '$4.40',   cls: 'medium' },
        { label: 'Context',      val: '1M tok', cls: 'low'    },
        { label: 'License',      val: 'MIT',     cls: 'high'   }
      ],
      body: [
        '<p>Zhipu AI\'s GLM-5.2 is a 744B-parameter MoE model with 40B active parameters per token, released under the MIT license with no regional limits on June 16, 2026.</p>',
        '<p>It scored <strong>62.1% on SWE-bench Pro</strong>, beating GPT-5.5\'s 58.6% — and at roughly 1/7 the output cost ($1.40/$4.40 vs GPT-5.5\'s $5/$30 per M tokens). On the FrontierSWE benchmark, it reached 74.4%.</p>',
        '<p>It became the #1 open-weights model on the Artificial Analysis Intelligence Index and the first open model to beat the Claude line on Design Arena\'s web-design leaderboard.</p>',
        '<p>With a 1M-token context window and MIT licensing, GLM-5.2 is usable by anyone, anywhere — no API key, no regional restrictions, no per-seat fees. That combination is what makes it a genuine threat to the proprietary model business.</p>',
        '<p>ChatGPT\'s global market share fell below 50% for the first time in June 2026. The proprietary moat is collapsing — and GLM-5.2 is the sharpest evidence yet that open-weight models can match or exceed closed flagships on real coding tasks.</p>'
      ]
    },
    cursor: {
      summary: 'SpaceX Acquires Cursor (Anysphere) for $60 Billion',
      metrics: [
        { label: 'Deal value',     val: '$60B',    cls: 'high'   },
        { label: 'Buyer',          val: 'SpaceX',  cls: 'high'   },
        { label: 'Target',         val: 'Anysphere', cls: 'medium' },
        { label: 'Deal type',      val: 'Stock',   cls: 'medium' },
        { label: 'Significance',   val: 'Largest', cls: 'high'   }
      ],
      body: [
        '<p>On June 16, 2026, SpaceX (trading as X67 Inc.) announced the acquisition of Anysphere, the company behind Cursor, in a deal valued at approximately $60 billion — conducted in stock rather than cash.</p>',
        '<p>This was the largest AI startup acquisition to date, exceeding the previous record by a wide margin. The deal signaled that space and defense companies were now major players in the AI acquisition market, not just tech giants.</p>',
        '<p>Cursor was (and remains) one of the most popular AI coding assistants — a VS Code-based editor with deep AI integration for code generation, refactoring, and understanding. Integrating it with SpaceX\'s engineering workflows was the stated rationale, but the strategic implications were broader.</p>',
        '<p>The deal reflected a consolidation trend in June 2026: investors were funding infrastructure, hardware, and enterprise tools rather than just models. OpenAI\'s acquisition of Ona (a cloud execution platform for Codex agents) on the same month signaled the same pattern — big players buying the orchestration layer, not just the model.</p>',
        '<p>For the AI coding market, the SpaceX-Cursor deal raised questions about vertical integration: would SpaceX use Cursor to build proprietary tools, or continue offering it as a general-purpose product? The initial signals suggested both — space-grade engineering tools internally, consumer product externally.</p>'
      ]
    },
    grokvideo: {
      summary: 'Grok Imagine Video 1.5: xAI\'s Video Generation Leap',
      metrics: [
        { label: 'Version',      val: '1.5',     cls: 'high'   },
        { label: 'Quality',      val: 'Higher',  cls: 'high'   },
        { label: 'Latency',      val: '~50%↓',  cls: 'high'   },
        { label: 'Audio',        val: 'Improved', cls: 'medium' },
        { label: 'Motion',       val: 'Better',  cls: 'medium' }
      ],
      body: [
        '<p>Grok Imagine Video 1.5, released June 16, was xAI\'s second major video generation model. The improvements were substantial: higher visual quality, better audio synchronization, and roughly half the latency of version 1.0.</p>',
        '<p>Video generation was one of the hardest AI problems, and the leap from 1.0 to 1.5 in a few months was notable. The model produced more coherent motion (less "fluttering" artifacts), better lip-sync when generating talking heads, and more stable camera movement in generated clips.</p>',
        '<p>It was available both via API and through xAI\'s consumer apps, making it one of the more accessible video generation tools at the time. This fit xAI\'s broader strategy of rapid iteration and consumer-facing products — Grok for PowerPoint, Grok Imagine, the plugin marketplace — all launched in a tight window around June 2026.</p>',
        '<p>The competitive landscape: Google had Nano Banana 2 Lite for images and Gemini Omni Flash for video (720p clips in ~25 seconds with continuous audio). xAI\'s Grok Imagine Video 1.5 was competing on speed and quality in a market that was moving fast.</p>'
      ]
    },
    jalapeno: {
      summary: 'OpenAI "Jalapeño": Custom Silicon for LLM Inference',
      metrics: [
        { label: 'Partners',     val: 'Broadcom', cls: 'high'   },
        { label: 'Type',         val: 'Inference', cls: 'medium' },
        { label: 'Perf/watt',    val: 'Better',  cls: 'high'   },
        { label: 'Significance', val: 'First silicon', cls: 'high' },
        { label: 'Vertical',     val: 'Integration', cls: 'medium' }
      ],
      body: [
        '<p>OpenAI\'s "Jalapeño" chip, unveiled June 24 alongside Gemini 3.5\'s computer use announcement, was the company\'s first custom silicon project. Built in partnership with Broadcom, it was designed specifically for LLM inference.</p>',
        '<p>Early tests showed significantly better performance-per-watt than top GPUs for inference workloads. This matters enormously at OpenAI\'s scale — even small efficiency gains translate to massive cost savings when you\'re running billions of inference requests per day.</p>',
        '<p>The chip signaled vertical integration into hardware, following the path that Google had pioneered with TPU. For OpenAI, it was a natural extension: they\'d already optimized their software stack for their own models; custom hardware was the next logical step.</p>',
        '<p>It also reflected the hardware diversification trend of June 2026 — Nvidia\'s RTX Spark for AI PCs, Liquid AI\'s non-transformer architecture, IBM\'s analog/neuromorphic research, and now OpenAI\'s inference-optimized chip. The GPU monoculture was starting to fracture.</p>',
        '<p>The name "Jalapeño" was an internal codename; the commercial name was not yet announced as of June 30. Industry speculation suggested it would be offered both for OpenAI\'s own use and potentially through a cloud service, following Google\'s TPU model.</p>'
      ]
    }
  };

  function openModal(key) {
    var data = modalData[key];
    if (!data) return;
    modalSummary.textContent = data.summary;
    modalMetrics.innerHTML = '';
    data.metrics.forEach(function (m) {
      var el = document.createElement('span');
      el.className = 'modal-metric ' + (m.cls || '');
      el.innerHTML = m.label + ' <span class="metric-val">' + m.val + '</span>';
      modalMetrics.appendChild(el);
    });
    modalBody.innerHTML = data.body.join('\n');
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    // Clear stale content so next open starts fresh
    if (modalSummary) modalSummary.textContent = '';
    if (modalMetrics) modalMetrics.innerHTML = '';
    if (modalBody) modalBody.innerHTML = '';
    if (featuredBody) featuredBody.style.display = 'none';
  }

  if (modalOverlay) {
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
    });
  }

  // ── Wire up data-modal triggers ──
  var modalTriggers = document.querySelectorAll('[data-modal]');
  modalTriggers.forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var key = el.getAttribute('data-modal');
      if (key && modalData[key]) openModal(key);
    });
  });

  // ── More links (existing behavior + modal passthrough) ──
  moreLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      // If it has a data-modal, let the modal handler deal with it
      if (link.getAttribute('data-modal')) return;
      var href = link.getAttribute('href');
      if (href && (href.indexOf('http') === 0 || href.indexOf('//') === 0)) {
        window.open(href, '_blank', 'noopener,noreferrer');
      } else if (href) {
        window.location.href = href;
      } else {
        var grid = document.getElementById('cardsGrid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // ── JS-driven More to Read (20 items) ──
  var moreToReadData = [
    {
      source: 'AI Critique',
      date: 'Jul 2, 2026',
      title: 'AI Developments in June 2026: Major Releases, Products, Research, and Policy',
      desc: 'Comprehensive monthly roundup covering all major model releases, product launches, research papers, and policy developments from June 2026.',
      url: 'https://www.aicritique.org/us/2026/07/02/ai-developments-in-june-2026-major-releases-products-research-and-policy/'
    },
    {
      source: 'KERSAI',
      date: 'Jun 26, 2026',
      title: 'AI Breakthroughs in June 2026: Mid-Year Update',
      desc: 'Mid-year perspective on the most important AI breakthroughs, with emphasis on what the first half of 2026 tells us about the trajectory of the field.',
      url: 'https://kersai.com/ai-breakthroughs-june-2026-mid-year-update/'
    },
    {
      source: 'Google Blog',
      date: 'Jul 1, 2026',
      title: 'The Latest AI News We Announced in June 2026',
      desc: 'Official Google blog post summarizing all AI announcements from June 2026, including Gemini updates, Android AI features, and Google Cloud developments.',
      url: 'https://blog.google/innovation-and-ai/technology/ai/google-ai-updates-june-2026/'
    },
    {
      source: 'Mean CEO',
      date: 'Jun 4, 2026',
      title: 'Latest AI Developments News | June 2026 (Startup Edition)',
      desc: 'Startup-focused roundup of the latest AI developments, funding rounds, product launches, and company news from the June 2026 period.',
      url: 'https://blog.mean.ceo/latest-ai-developments-news-june-2026/'
    },
    {
      source: 'White House',
      date: 'Jun 2, 2026',
      title: 'Executive Order 14409 — Promoting Advanced Artificial Intelligence Innovation and Security',
      desc: 'The full text of the executive order mandating stronger cyber defenses for national security systems and establishing a voluntary frontier model framework.',
      url: 'https://www.whitehouse.gov/presidential-actions/2026/06/promoting-advanced-artificial-intelligence-innovation-and-security/'
    },
    {
      source: 'Stanford HAI',
      date: '2026',
      title: '2026 AI Index Report',
      desc: "Stanford's annual report on AI progress, adoption, investment, and policy. The definitive cross-industry benchmark for where AI stands relative to prior years.",
      url: 'https://hai.stanford.edu/ai-index/2026-ai-index-report'
    },
    {
      source: 'Crescendo AI',
      date: 'Jun 14, 2026',
      title: 'Latest AI News and Updates',
      desc: 'Ongoing AI news coverage with daily updates on model releases, product launches, research, and industry developments.',
      url: 'https://www.crescendo.ai/news/latest-ai-news-and-updates'
    },
    {
      source: 'UN News',
      date: 'Jul 6, 2026',
      title: 'From AI to Killer Robots: UN Chief Issues Urgent Governance Call',
      desc: "UN Secretary-General António Guterres's urgent appeal for AI governance action, referencing the UN Independent International Scientific Panel on Artificial Intelligence.",
      url: 'https://news.un.org/en/story/2026/07/1167873'
    },
    {
      source: 'Anthropic News',
      date: 'Jun 12, 2026',
      title: 'Claude Opus 4.8 and the Fable 5 / Mythos 5 Shutdown: Two Sides of the Same Month',
      desc: "Anthropic's official blog covering both the Opus 4.8 release and the regulatory shutdown of Fable 5 and Mythos 5 — two events that defined June 2026 for the AI industry.",
      url: 'https://www.anthropic.com/news/claude-opus-4-8'
    },
    {
      source: 'OpenAI Blog',
      date: 'Jun 26, 2026',
      title: 'GPT-5.6: Three Variants, One Leap',
      desc: 'OpenAI\'s technical blog on GPT-5.6 Sol, Terra, and Luna — the three-variant release strategy and what it means for different use cases from coding to science to consumer apps.',
      url: 'https://openai.com/index/gpt-5-6/'
    },
    {
      source: 'Artificial Analysis',
      date: 'Jun 2026',
      title: 'June 2026 Model Leaderboard: The Convergence Continues',
      desc: "Artificial Analysis's monthly model comparison: Claude Opus 4.8 takes the intelligence lead, GLM-5.2 leads open weights, and the gap between top models narrows to historic lows.",
      url: 'https://artificialanalysis.ai/models/compare'
    },
    {
      source: 'TechCrunch',
      date: 'Jun 16, 2026',
      title: 'SpaceX Acquires Cursor for $60B in Stock — The Largest AI Deal Ever',
      desc: 'Breaking coverage of the SpaceX-Anysphere deal: deal terms, strategic rationale, and what it means for the AI coding market and the broader consolidation trend.',
      url: 'https://techcrunch.com/2026/06/16/spacex-cursor-acquisition/'
    },
    {
      source: 'The Information',
      date: 'Jun 2026',
      title: 'The Fable 5 Shutdown: Inside the 72 Hours That Changed AI Regulation',
      desc: "Deep-dive investigation into the timeline, the security finding, the Amazon escalation, and the Commerce Department's decision — the most detailed account of the first frontier model pullback.",
      url: 'https://www.theinformation.com/articles/fable-5-shutdown-timeline'
    },
    {
      source: 'Zhipu AI Blog',
      date: 'Jun 16, 2026',
      title: 'GLM-5.2: MIT-Licensed Frontier Model Beating GPT-5.5 on SWE-bench',
      desc: "Zhipu AI's official release announcement for GLM-5.2: technical specifications, benchmark results, licensing details, and the vision for open-weight frontier models.",
      url: 'https://z.ai/blog/glm-5-2-release'
    },
    {
      source: 'Google AI Blog',
      date: 'Jun 24, 2026',
      title: 'Gemini 3.5 Flash Gets Built-In Computer Use',
      desc: 'Google\'s technical deep-dive on the computer use capability: how it works, safety measures, supported platforms, and the agentic tool-use benchmark results.',
      url: 'https://blog.google/technology/ai/gemini-3-5-computer-use/'
    },
    {
      source: 'Moonshot AI',
      date: 'Jun 12, 2026',
      title: 'Kimi K2.7-Code: 1T Parameters, 262K Context, 21.8% Better',
      desc: "Moonshot AI's technical release notes for Kimi K2.7-Code: architecture details, benchmark comparisons with K2.6, and the efficiency gains in reasoning token usage.",
      url: 'https://moonshot.ai/blog/kimi-k2-7-code/'
    },
    {
      source: 'Mistral AI Blog',
      date: 'Jun 23, 2026',
      title: 'OCR 4: 170 Languages, Structured Output, 72% Win Rate',
      desc: "Mistral's announcement of OCR 4 with technical details on the structured output format, language coverage, and the benchmarking methodology behind the 72% win-rate claim.",
      url: 'https://mistral.ai/news/ocr-4/'
    },
    {
      source: 'Liquid AI Blog',
      date: 'Jun 25, 2026',
      title: 'LFM2.5-230M: Non-Transformer AI That Runs on a Raspberry Pi',
      desc: "Liquid AI\'s explanation of the liquid state architecture, why 230M parameters can match larger transformers on specific tasks, and the roadmap for on-device AI beyond transformers.",
      url: 'https://liquid.ai/blog/lfm2-5-230m/'
    },
    {
      source: 'Cohere Blog',
      date: 'Jun 9, 2026',
      title: 'Command A+ and North Mini Code: Enter the Agentic Coding Arena',
      desc: "Cohere\'s announcement of its first coding model (North Mini Code) alongside the expanded Command A+ — the company\'s strategic move from document understanding into agentic workflows.",
      url: 'https://cohere.com/blog/command-a-plus-north-mini-code/'
    },
    {
      source: 'IEEE Spectrum',
      date: 'Jun 2026',
      title: 'AI Hardware Diversification: Beyond the GPU — RTMs, Analog, and Custom Silicon',
      desc: "Technical overview of the hardware diversification trend: Nvidia RTX Spark, OpenAI Jalapeño, Liquid AI\'s liquid state machines, IBM\'s analog chips, and what it means for the future of AI inference.",
      url: 'https://spectrum.ieee.org/ai-hardware-diversification-2026/'
    }
  ];

  function renderMoreToRead() {
    var container = document.querySelector('.mtr-grid');
    if (!container) return;
    container.innerHTML = '';
    moreToReadData.forEach(function (item) {
      var a = document.createElement('a');
      a.className = 'mtr-item';
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML =
        '<div class="mtr-head">' +
          '<span class="mtr-source">' + item.source + '</span>' +
          '<span class="mtr-date">' + item.date + '</span>' +
        '</div>' +
        '<div class="mtr-title-text">' + item.title + '</div>' +
        '<div class="mtr-desc">' + item.desc + '</div>' +
        '<span class="mtr-link-icon">→</span>';
      container.appendChild(a);
    });
  }

  // ── Featured card: populate extended body for fable5-alt ──
  function populateFeaturedBody(key) {
    if (!featuredBody) return;
    if (key === 'fable5_alt' && modalData.fable5_alt) {
      featuredBody.innerHTML = '<div class="featured-body-inner">' + modalData.fable5_alt.body.join('</div><div class="featured-body-inner">') + '</div>';
      featuredBody.style.display = 'block';
    } else {
      featuredBody.style.display = 'none';
    }
  }

  // ── Stat counters ──
  function animateCounter(el, target, suffix) {
    suffix = suffix || '';
    var duration = 1400;
    var start = null;
    var isFloat = target % 1 !== 0;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = eased * target;
      if (isFloat) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.round(current) + suffix;
      }
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        if (isFloat) {
          el.textContent = target.toFixed(1) + suffix;
        } else {
          el.textContent = target + suffix;
        }
      }
    }
    requestAnimationFrame(step);
  }

  function initStatCounters() {
    var statNums = document.querySelectorAll('.stat-num');
    if (statNums.length === 0) return;
    statNums.forEach(function (el) {
      var text = el.textContent.trim();
      var raw = text.replace(/[~$<>]/g, '').trim();
      var suffix = '';
      if (text.includes('B')) suffix = 'B';
      else if (text.includes('%')) suffix = '%';
      else if (text.includes('hrs')) suffix = ' hrs';
      else if (text.includes('/7')) suffix = '/7';

      // Skip non-counter stats (ratios, inequalities)
      if (text.indexOf('1/7') !== -1 || text.indexOf('<50') !== -1) return;

      var target = parseFloat(raw);
      if (isNaN(target)) return;

      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        animateCounter(el, target, suffix);
      } else {
        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(el, target, suffix);
              observer.unobserve(el);
            }
          });
        }, { threshold: 0.3 });
        observer.observe(el);
      }
    });
  }

  // ── Initialise ──
  if (paginationEl) {
    updatePaginationUI();
  }

  renderMoreToRead();

  // Init count badges
  updateCountBadges();

  // Init section visibility
  updateSectionVisibility();

  // Init stat counters after a short delay
  setTimeout(initStatCounters, 300);

  // ── Keyboard shortcuts ──
  document.addEventListener('keydown', function (e) {
    if (paginationEl && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        var totalPages = Math.max(1, Math.ceil(countVisibleCards() / pageSize));
        if (currentPage > 1) showPage(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        var totalPages = Math.max(1, Math.ceil(countVisibleCards() / pageSize));
        if (currentPage < totalPages) showPage(currentPage + 1);
      }
    }
  });

  // ── Wire featured card buttons ──
  var featuredBtns = document.querySelectorAll('.featured-card .btn-read-original');
  featuredBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var key = btn.getAttribute('data-modal');
      if (key && modalData[key]) {
        if (key === 'fable5_alt') {
          populateFeaturedBody(key);
          openModal('fable5');
        } else {
          openModal(key);
        }
      }
    });
  });
})();
