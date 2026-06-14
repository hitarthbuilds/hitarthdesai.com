// Single content source for the site. Copy is from the asset pack (Task 1.3 body,
// Task 2.1 stack, Task 3 bio facts). All facts real/corroborable. Handles: hitarthbuilds.

export const profileLinks = [
  { label: 'GitHub', href: 'https://github.com/hitarthbuilds' },
  { label: 'Hugging Face', href: 'https://huggingface.co/hitarthbuilds' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hitarth-desai10' },
  { label: 'X', href: 'https://x.com/hitarthbuilds' },
  { label: 'PyPI', href: 'https://pypi.org/user/hitarth_builds_10/' },
];

export const hero = {
  eyebrow: '01 / Source',
  name: 'Hitarth Desai',
  thesis: 'I build the layer that makes LLMs reliable in production.',
  sub:
    'Currently at InfraDock AI, designing LLM-powered document processing pipelines. ' +
    'Previously 2× AI/ML Lead at GDSC Surat. Computer Engineering, GTU 2026.',
};

export const extract = {
  eyebrow: '02 / Extract',
  heading: 'What I work on',
  lead:
    'I care about the gap between a model that demos well and a system that survives ' +
    'real traffic. Most of my work lives in that gap — turning probabilistic model ' +
    'output into something a downstream service can trust, then making it fast and ' +
    'observable enough to ship.',
  points: [
    {
      term: 'Reliable extraction',
      body:
        'schema-constrained, validated, deterministic structured output from LLMs ' +
        'instead of "parse the JSON and pray."',
    },
    {
      term: 'Pipeline infrastructure',
      body: 'async, batched, observable document-processing flows.',
    },
    {
      term: 'Open source',
      body: 'I publish the tools I needed and couldn’t find.',
    },
  ],
};

export const structure = {
  eyebrow: '03 / Structure',
  heading: 'Selected work',
  projects: [
    {
      name: 'confident-extract',
      href: 'https://pypi.org/project/confident-extract/',
      blurb:
        'Open-source Python library for deterministic, schema-constrained structured ' +
        'extraction, built on msgspec for low-overhead validation. On PyPI.',
    },
    {
      name: 'promptcrucible',
      href: null,
      blurb:
        'A multi-agent prompt-optimization workbench for systematically testing and ' +
        'improving prompts against eval harnesses. In active development.',
    },
    {
      name: 'AnswerRank AI',
      href: null,
      blurb:
        'AEO diagnostic tool (Gemini + Firecrawl) that scores how discoverable a page ' +
        'is to AI answer engines.',
    },
    {
      name: 'AutoDataset Lab',
      href: null,
      blurb:
        'My first venture: a dataset-intelligence platform for inspecting, profiling, ' +
        'and cleaning ML training data.',
    },
  ],
};

export const stack = {
  eyebrow: '04 / Stack',
  heading: 'Tools I reach for',
  groups: [
    { label: 'Languages', items: ['Python', 'TypeScript', 'Rust (learning)'] },
    { label: 'LLM / Data', items: ['structured outputs', 'constrained decoding', 'msgspec', 'LangChain', 'vLLM'] },
    { label: 'Infra', items: ['Docker', 'Kubernetes', 'Terraform', 'Kafka', 'microservices'] },
    { label: 'MLOps', items: ['async pipelines', 'batching', 'eval harnesses', 'observability'] },
  ],
};

export const experience = {
  eyebrow: '05 / Trace',
  heading: 'Where I’ve worked',
  roles: [
    {
      when: 'Now',
      role: 'AI Systems Engineer',
      org: 'InfraDock AI',
      detail:
        'Designing LLM-powered document-processing pipelines — turning probabilistic ' +
        'model output into structured data downstream services can trust, fast and ' +
        'observable enough to run under real load.',
    },
    {
      when: 'Previously',
      role: '2× AI/ML Lead',
      org: 'GDSC Surat',
      detail:
        'Taught and built alongside a few hundred student engineers across two terms ' +
        'leading the AI/ML track.',
    },
    {
      when: 'Earlier',
      role: 'Backend & systems work',
      org: 'Independent / contract',
      detail:
        'Shipped production systems ranging from event-driven backtesting ' +
        'infrastructure to microservice platforms.',
    },
    {
      when: 'Education',
      role: 'B.E. Computer Engineering',
      org: 'Gujarat Technological University',
      detail: 'Graduating 2026.',
    },
  ],
};

export const faq = {
  eyebrow: '06 / Query',
  heading: 'Common questions',
  items: [
    {
      q: 'What does Hitarth Desai do?',
      a:
        'He is an AI Systems Engineer at InfraDock AI, building LLM data-extraction ' +
        'pipelines, deterministic structured output, and the MLOps infrastructure that ' +
        'keeps them reliable in production.',
    },
    {
      q: 'What open-source tools has he built?',
      a:
        'confident-extract — a Python library for deterministic, schema-constrained ' +
        'extraction from LLMs, built on msgspec — is published on PyPI. promptcrucible, ' +
        'a multi-agent prompt-optimization workbench, is in active development.',
    },
    {
      q: 'What roles is he open to?',
      a: 'AI Systems and Founding Engineer roles at seed to Series A startups.',
    },
    {
      q: 'Where is he based?',
      a: 'Surat, Gujarat, India.',
    },
    {
      q: 'What is his background?',
      a:
        'A Computer Engineering graduate (GTU, 2026) and 2× AI/ML Lead at GDSC Surat, ' +
        'where he taught and built alongside a few hundred student engineers.',
    },
    {
      q: 'What makes his work distinctive?',
      a:
        'He focuses on the reliability layer between a model that demos well and a ' +
        'system that survives production traffic — extraction, validation, batching, ' +
        'and observability.',
    },
  ],
};

export const writing = {
  eyebrow: '07 / Publish',
  heading: 'Writing',
  lead:
    'Field notes on making LLMs reliable in production — structured outputs, pipeline ' +
    'infrastructure, and the unglamorous layer in between.',
};

export const signal = {
  eyebrow: '08 / Signal',
  heading: 'Off the clock',
  body:
    'International gold-medalist powerlifter. I play guitar and perform live — mostly ' +
    'metal and hard rock. The discipline of progressive overload turns out to map ' +
    'surprisingly well onto debugging distributed systems.',
};

export const ship = {
  eyebrow: '09 / Ship',
  heading: 'Get in touch',
  body:
    'Currently at InfraDock AI. Open to AI Systems / Founding Engineer roles at ' +
    'seed–Series A startups.',
};
