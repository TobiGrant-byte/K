/**
 * Home quote stays a single Firestore string (no extra fields / rules).
 * Optional author: put it after an em dash on the same line.
 *
 *   Keep going every day — Dr. Sunday Okafor
 *
 * Also accepts en dash (–) or ASCII double-hyphen ( -- ).
 * Without a separator, the whole string is the quote (no author line).
 */

export type ParsedHomeQuote = {
  text: string;
  author: string | null;
};

const AUTHOR_SEPARATORS = [" — ", " – ", " -- "] as const;

export function parseHomeQuote(raw: string): ParsedHomeQuote {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return { text: "", author: null };

  for (const sep of AUTHOR_SEPARATORS) {
    const index = trimmed.lastIndexOf(sep);
    if (index <= 0) continue;
    const text = trimmed.slice(0, index).trim();
    const author = trimmed.slice(index + sep.length).trim();
    if (text && author) {
      return { text, author };
    }
  }

  return { text: trimmed, author: null };
}
