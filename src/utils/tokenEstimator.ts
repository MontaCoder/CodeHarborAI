const CHARS_PER_TOKEN = 3.6; // closer to GPT-style encoding than the previous 4.0 guess
const TOKENS_PER_LINE = 1.6; // lightweight line heuristic for non-text-aware calls

/**
 * Estimate tokens for raw text by character count with a floor from line-based heuristic.
 */
export const estimateTextTokens = (text: string): number => {
  if (!text) return 0;
  const byChars = Math.ceil(text.length / CHARS_PER_TOKEN);
  const byLines = Math.ceil(text.split(/\r?\n/).length * TOKENS_PER_LINE);
  return Math.max(byChars, byLines);
};

/**
 * Estimate tokens when only byte size and line count are known (e.g., pre-read stats).
 */
export const estimateTokensFromBytesLines = (
  sizeBytes: number,
  lines: number,
): number => {
  if (!Number.isFinite(sizeBytes) || !Number.isFinite(lines)) return 0;
  const byBytes = Math.ceil(sizeBytes / CHARS_PER_TOKEN);
  const byLines = Math.ceil(lines * TOKENS_PER_LINE);
  return Math.max(byBytes, byLines, 0);
};
