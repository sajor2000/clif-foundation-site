import { IRS_STATUS, IRS_STATUS_SHORT } from "@/lib/legal";
export const CONTACT_EMAIL = "info@clificufoundation.org";
export const CONSORTIUM_URL = "https://clif-icu.com/";
export const GITHUB_URL =
  "https://github.com/Common-Longitudinal-ICU-data-Format/CLIF";

export const NAV_ITEMS = [
  { href: "/mission", label: "Mission", id: "mission", index: "01" },
  { href: "/our-work", label: "Our Work", id: "work", index: "02" },
  {
    href: "/research",
    label: "Research & Resources",
    id: "research",
    index: "03",
  },
  {
    href: "/board",
    label: "Board & Governance",
    id: "board",
    index: "04",
  },
] as const;

export const ORG_RECORD = [
  { k: "name", v: "CLIF Foundation" },
  { k: "supports", v: "Common Longitudinal ICU data Format" },
  { k: "entity", v: "Illinois nonprofit corporation" },
  { k: "tax_status", v: IRS_STATUS_SHORT },
  { k: "research_by", v: "CLIF Consortium" },
  { k: "contact", v: CONTACT_EMAIL },
] as const;

export const PROGRAMS = [
  {
    id: "impl_support",
    name: "Implementation support",
    scope:
      "Guidance for health systems converting electronic health record (EHR) data to CLIF, including ETL pipelines (the steps that copy records out of a hospital system and reshape them into CLIF) and quality checks.",
    why: "Converting its records is the first step before a hospital’s ICU data can be compared with other hospitals’.",
    serves: "Health system data teams",
    base: "ETL Guide",
    baseUrl: "https://clif-icu.com/etl-guide",
  },
  {
    id: "education",
    name: "Education",
    scope:
      "Courses and workshops for clinicians and data scientists learning to work with CLIF-formatted data.",
    why: "Clinicians and data teams learn to use CLIF data to study and improve ICU care.",
    serves: "Clinicians, data scientists, trainees",
    base: "CLIF 101",
    baseUrl: "https://clif-icu.com/clif-101",
  },
  {
    id: "oss_stewardship",
    name: "Open-source stewardship",
    scope:
      "Maintenance of the specification, mapping resources, conversion tools, tests, and documentation released under the Apache License 2.0.",
    why: "Keeps the standard free and working for every hospital that uses it.",
    serves: "Technical contributors, adopting sites",
    base: "GitHub repository",
    baseUrl: GITHUB_URL,
  },
  {
    id: "convening",
    name: "Convening",
    scope:
      "Forums for sites and contributors to coordinate on future versions of the standard.",
    why: "Brings CLIF users, clinicians, and technical contributors together to share needs and experience.",
    serves: "Adopting sites and contributors",
    base: "mCIDE expansion process",
    baseUrl: "https://clif-icu.com/mcide-explorer",
  },
] as const;

export type PubType = "Journal" | "Preprint";

export const PUBLICATIONS: Array<{
  year: number;
  title: string;
  venue: string;
  type: PubType;
  url: string;
}> = [
  {
    year: 2026,
    title:
      "Federated generative event models for tokenized electronic health records",
    venue: "arXiv",
    type: "Preprint",
    url: "https://arxiv.org/abs/2608.02939",
  },
  {
    year: 2026,
    title:
      "Federation, Not Centralization: A New Paradigm for EHR-Based Critical Care Research",
    venue: "Annals of the American Thoracic Society",
    type: "Journal",
    url: "https://academic.oup.com/annalsats/advance-article/doi/10.1093/annalsats/aaoaf067/8435347",
  },
  {
    year: 2025,
    title:
      "Prone Positioning in a North American Cohort of Hypoxemic Patients on Mechanical Ventilation",
    venue: "medRxiv",
    type: "Preprint",
    url: "https://www.medrxiv.org/content/10.1101/2025.09.03.25334942v1",
  },
  {
    year: 2025,
    title: "The Epidemiology of ICU Readmissions Across Ten Health Systems",
    venue: "Critical Care Explorations",
    type: "Journal",
    url: "https://journals.lww.com/ccejournal/fulltext/2025/11000/the_epidemiology_of_icu_readmissions_across_ten.1.aspx",
  },
  {
    year: 2025,
    title:
      'Correspondence on "A common longitudinal intensive care unit data format (CLIF) for critical illness research" - Author\'s reply',
    venue: "Intensive Care Medicine",
    type: "Journal",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12617075/",
  },
  {
    year: 2025,
    title:
      "A common longitudinal intensive care unit data format (CLIF) for critical illness research",
    venue: "Intensive Care Medicine",
    type: "Journal",
    url: "https://link.springer.com/article/10.1007/s00134-025-07848-7",
  },
];

export const HOME_PUBS = PUBLICATIONS.filter((_, i) => i === 1 || i === 3 || i === 5).map(
  (p) => ({
    ...p,
    venue: p.venue.replace("American Thoracic Society", "ATS"),
  }),
);

export const RESOURCES = [
  {
    name: "CLIF 101",
    note: "start a CLIF project",
    url: "https://clif-icu.com/clif-101",
  },
  {
    name: "ETL Guide",
    note: "EHR → CLIF conversion",
    url: "https://clif-icu.com/etl-guide",
  },
  {
    name: "Data Dictionary",
    note: "CLIF 2.1.0",
    url: "https://clif-icu.com/data-dictionary",
  },
  {
    name: "DQA Framework",
    note: "data quality assessment",
    url: "https://clif-icu.com/data-quality",
  },
  {
    name: "mCIDE Explorer",
    note: "minimum common ICU data elements",
    url: "https://clif-icu.com/mcide-explorer",
  },
  {
    name: "MIMIC-IV in CLIF format",
    note: "PhysioNet · Zewei Liao et al.",
    url: "https://physionet.org/content/mimic-iv-ext-clif/1.1.0/",
  },
] as const;

export const PRINCIPLES = [
  {
    n: "01",
    t: "Open infrastructure",
    d: "Specifications, tools, mappings, and educational material stay openly available for the people who need to use and improve them.",
  },
  {
    n: "02",
    t: "Adoption beyond research",
    d: "CLIF is for organizations that use ICU data, including hospitals measuring quality of care, not only research networks.",
  },
  {
    n: "03",
    t: "Local control of data",
    d: "Shared analysis code runs at each site. Patient-level data stays with each institution.",
  },
  {
    n: "04",
    t: "Credit and accountability",
    d: "Research credit belongs to the Consortium and original investigators. Foundation funds are budgeted and overseen for adoption work.",
  },
  {
    n: "05",
    t: "Practical pathways",
    d: "Prioritize the work that takes a site from an EHR extract to usable CLIF data: conversion tools, terminology mapping, quality checks, training, and implementation help.",
  },
] as const;

/** Gift-page program summary; order and names match PROGRAMS. */
export const GIFT_PROGRAMS = [
  {
    n: "01",
    t: "Implementation support",
    d: "Hands-on help for health systems converting EHR data to CLIF, including ETL workflows and quality checks.",
  },
  {
    n: "02",
    t: "Education",
    d: "Courses and workshops so clinicians and data teams can work with CLIF-formatted data.",
  },
  {
    n: "03",
    t: "Open-source stewardship",
    d: "Maintenance of the specification, mapping resources, conversion tools, tests, and documentation.",
  },
  {
    n: "04",
    t: "Convening",
    d: "Forums where adopting sites and contributors coordinate on future versions of the standard.",
  },
] as const;

export const GOVERNING_DOCS = [
  { name: "Bylaws", status: "published when adopted" },
  { name: "Conflict-of-interest policy", status: "published when adopted" },
  {
    name: "Organization",
    status: `Illinois nonprofit corporation · ${IRS_STATUS_SHORT}`,
  },
] as const;

export const SUPPORT_PATHS = [
  {
    n: "01",
    who: "Donors",
    body: "Individuals and foundations interested in supporting Foundation programs.",
    cta: "Give online",
    href: "/support#give",
    external: false,
  },
  {
    n: "02",
    who: "Institutional partners",
    body: "Health systems and organizations exploring CLIF adoption.",
    cta: "Email a partnership inquiry",
    href: `mailto:${CONTACT_EMAIL}?subject=Partnership%20inquiry`,
    external: false,
  },
  {
    n: "03",
    who: "Clinicians",
    body: "Learn the format first, then tell us about education needs.",
    cta: "Start with CLIF 101 ↗",
    href: "https://clif-icu.com/clif-101",
    external: true,
  },
  {
    n: "04",
    who: "Technical contributors",
    body: "Specifications, ETL pipelines, and tools are open source.",
    cta: "Contribute on GitHub ↗",
    href: GITHUB_URL,
    external: true,
  },
] as const;

/** One plain-language finding for the home page. Keep the numbers as the paper reports them. */
export const HOME_FINDING = {
  lead: "Turning a patient onto their stomach, called prone positioning, helps people with severe lung failure survive. Using CLIF data from 37 hospitals, researchers found its use jumped during the COVID-19 pandemic, then fell back afterward. Whether a patient was proned also depended a great deal on which hospital treated them.",
  stats: [
    { value: "8%", label: "of eligible patients proned before the pandemic" },
    { value: "45%", label: "during the pandemic" },
    { value: "20%", label: "after the pandemic" },
  ],
  source: "Prone Positioning in a North American Cohort of Hypoxemic Patients on Mechanical Ventilation",
  note: "medRxiv preprint, 2025; not yet peer reviewed. 5,760 eligible patients.",
  url: "https://www.medrxiv.org/content/10.1101/2025.09.03.25334942v1",
};

export const HOME_PATHS = [
  {
    n: "01",
    who: "Donors",
    arrow: "→",
    cta: "Give online",
    href: "/support#give",
  },
  {
    n: "02",
    who: "Institutional partners",
    arrow: "→",
    cta: "Email a partnership inquiry",
    href: `mailto:${CONTACT_EMAIL}?subject=Partnership%20inquiry`,
  },
  {
    n: "03",
    who: "Clinicians",
    arrow: "↗",
    cta: "Start with CLIF 101",
    href: "https://clif-icu.com/clif-101",
  },
  {
    n: "04",
    who: "Technical contributors",
    arrow: "↗",
    cta: "Contribute on GitHub",
    href: GITHUB_URL,
  },
] as const;

export const MAPPINGS = [
  { local: "Vent - Servo-u", cat: "IMV" },
  { local: "BiPAP mask", cat: "NIPPV" },
  { local: "HFNC Optiflow 40L", cat: "High Flow NC" },
  { local: "NC 2L", cat: "Nasal Cannula" },
  { local: "RA", cat: "Room Air" },
] as const;

export const NEEDS = [
  {
    n: "01",
    need: "Minute-level timing",
    how: "Every row carries a timestamp, so ventilator changes, infusion titrations, and labs line up on one clock.",
    ex: "recorded_dttm · admin_dttm",
  },
  {
    n: "02",
    need: "Life support over time",
    how: "Device, mode, and medication categories describe when each therapy starts, changes, and stops.",
    ex: 'device_category = "IMV"',
  },
  {
    n: "03",
    need: "Same meaning at every site",
    how: "mCIDE maps local terms to shared permissible values.",
    ex: 'med_category = "norepinephrine"',
  },
  {
    n: "04",
    need: "Quality you can check",
    how: "The DQA Framework tests completeness and plausibility before analysis.",
    ex: "DQA Framework",
  },
  {
    n: "05",
    need: "Privacy at multicenter scale",
    how: "Federated analysis: code runs at each site and only aggregate results are shared.",
    ex: "aggregate results only",
  },
  {
    n: "06",
    need: "Open and testable",
    how: "Open-source tools under Apache 2.0, and MIMIC-IV in CLIF format, which lets eligible researchers develop code without access to their own institution's EHR data. PhysioNet credentialing and applicable data-use requirements still apply.",
    ex: "MIMIC-IV-Ext-CLIF",
  },
] as const;

export const FOOTER_NOTE = `An Illinois nonprofit corporation helping more organizations use the Common Longitudinal ICU data Format (CLIF). ${IRS_STATUS} Research is credited to the CLIF Consortium and its investigators.`;
