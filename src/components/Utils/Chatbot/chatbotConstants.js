export const RANDOM_REASONS = [
  "help my master find something",
  "see what my master needs",
  "see something in the kitchen",
  "carry something",
  "feed my cat",
  "charge Nico's battery",
  "look at something my master is fixing",
  "taste-test my master's cooking",
  "find room keys",
  "help my master make a phone call",
  "help my master on a phone call",
  "check something in the workspace"
];

export const FAQ_TEMPLATES = [
  (q) => `i see a bill board about faq at piece question '${q}' and its said`,
  (q) => `that sticky one card '${q}' said`,
  (q) => `glancing at the FAQ board for '${q}', it reads`,
  (q) => `reading the FAQ card about '${q}', it says`,
  (q) => `looking at the FAQ item '${q}', it notes`
];

export const SENSITIVE_KEYWORDS = [
  'horny', 'fuck', 'sex', 'fck', 'porn', 'nudity', 'naked', 'blowjob', 
  'dick', 'pussy', 'boobs', 'cunt', 'asshole', 'goon', 'jerk off', 
  'masturbat', 'bitch'
];

/**
 * Checks if a message contains sensitive keywords.
 * @param {string} text 
 * @returns {boolean}
 */
export function isSensitiveInput(text) {
  const lower = text.toLowerCase();
  return SENSITIVE_KEYWORDS.some(kw => lower.includes(kw));
}
