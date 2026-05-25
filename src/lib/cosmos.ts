export const DISCIPLINES = [
  "Auto",
  "Physics",
  "Chemistry",
  "Biology",
  "Geology",
  "Astronomy",
] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export const MODES = [
  { id: "standard", label: "Standard", hint: "Default editorial response." },
  {
    id: "eli5",
    label: "ELI-Undergrad",
    hint: "Explain with intuitive analogies first, then introduce formal notation. Assume an undergraduate audience.",
  },
  {
    id: "exam",
    label: "Exam Prep",
    hint: "Structure the response as exam-ready study notes: key definitions, common pitfalls, worked example, and a 3-question self-check at the end (with answers hidden behind a markdown details block).",
  },
  {
    id: "derivation",
    label: "Full Derivation",
    hint: "Show the complete step-by-step mathematical derivation with every algebraic move justified. Box the final result.",
  },
] as const;
export type ModeId = (typeof MODES)[number]["id"];

export interface StarterPrompt {
  discipline: Exclude<Discipline, "Auto">;
  q: string;
}

export const STARTERS: StarterPrompt[] = [
  {
    discipline: "Physics",
    q: "Derive the time-dilation factor in special relativity and explain its experimental confirmation in muon decay.",
  },
  {
    discipline: "Chemistry",
    q: "Why does ice float? Explain the molecular geometry and hydrogen bonding behind water's density anomaly.",
  },
  {
    discipline: "Biology",
    q: "Walk me through the chemiosmotic mechanism of ATP synthesis at the mitochondrial inner membrane.",
  },
  {
    discipline: "Geology",
    q: "How do isotope ratios in zircon crystals let us date the formation of Earth's crust?",
  },
  {
    discipline: "Astronomy",
    q: "What sets the Chandrasekhar limit, and why does it determine whether a star becomes a white dwarf or a neutron star?",
  },
];

export const CONSTANTS: { sym: string; name: string; val: string }[] = [
  { sym: "c", name: "Speed of light", val: "2.998 × 10⁸ m/s" },
  { sym: "G", name: "Gravitational constant", val: "6.674 × 10⁻¹¹ N·m²/kg²" },
  { sym: "h", name: "Planck constant", val: "6.626 × 10⁻³⁴ J·s" },
  { sym: "ℏ", name: "Reduced Planck", val: "1.055 × 10⁻³⁴ J·s" },
  { sym: "kB", name: "Boltzmann constant", val: "1.381 × 10⁻²³ J/K" },
  { sym: "NA", name: "Avogadro number", val: "6.022 × 10²³ /mol" },
  { sym: "R", name: "Gas constant", val: "8.314 J/(mol·K)" },
  { sym: "e", name: "Elementary charge", val: "1.602 × 10⁻¹⁹ C" },
  { sym: "me", name: "Electron mass", val: "9.109 × 10⁻³¹ kg" },
  { sym: "mp", name: "Proton mass", val: "1.673 × 10⁻²⁷ kg" },
  { sym: "ε₀", name: "Vacuum permittivity", val: "8.854 × 10⁻¹² F/m" },
  { sym: "σ", name: "Stefan–Boltzmann", val: "5.670 × 10⁻⁸ W/(m²·K⁴)" },
];

export const EQUATIONS: { domain: string; name: string; tex: string }[] = [
  { domain: "Physics", name: "Newton's 2nd law", tex: "F = ma" },
  { domain: "Physics", name: "Mass–energy", tex: "E = mc^2" },
  {
    domain: "Physics",
    name: "Schrödinger (time-dep.)",
    tex: "i\\hbar \\partial_t \\psi = \\hat H \\psi",
  },
  {
    domain: "Physics",
    name: "Lorentz factor",
    tex: "\\gamma = 1/\\sqrt{1 - v^2/c^2}",
  },
  {
    domain: "Chemistry",
    name: "Ideal gas law",
    tex: "PV = nRT",
  },
  {
    domain: "Chemistry",
    name: "Gibbs free energy",
    tex: "\\Delta G = \\Delta H - T\\Delta S",
  },
  {
    domain: "Chemistry",
    name: "Nernst equation",
    tex: "E = E^\\circ - \\frac{RT}{nF}\\ln Q",
  },
  {
    domain: "Biology",
    name: "Hardy–Weinberg",
    tex: "p^2 + 2pq + q^2 = 1",
  },
  {
    domain: "Biology",
    name: "Michaelis–Menten",
    tex: "v = \\frac{V_{max}[S]}{K_M + [S]}",
  },
  {
    domain: "Astronomy",
    name: "Kepler's 3rd law",
    tex: "T^2 = \\frac{4\\pi^2}{GM} a^3",
  },
  {
    domain: "Astronomy",
    name: "Schwarzschild radius",
    tex: "r_s = \\frac{2GM}{c^2}",
  },
  {
    domain: "Astronomy",
    name: "Hubble's law",
    tex: "v = H_0 \\, d",
  },
  {
    domain: "Geology",
    name: "Radiometric decay",
    tex: "N(t) = N_0 \\, e^{-\\lambda t}",
  },
];

export function buildSystemHint(mode: ModeId, discipline: Discipline) {
  const m = MODES.find((x) => x.id === mode);
  const parts: string[] = [];
  if (m && mode !== "standard") parts.push(`Mode directive: ${m.hint}`);
  if (discipline !== "Auto")
    parts.push(
      `The user has focused this session on ${discipline}. Bias examples, terminology, and synthesis toward ${discipline}, but cross-link to adjacent disciplines when illuminating.`,
    );
  return parts.join("\n");
}
