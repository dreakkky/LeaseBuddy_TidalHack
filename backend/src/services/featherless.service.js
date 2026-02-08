const OpenAI = require("openai");
const dotenv = require("dotenv");
const config = require("../config.json");
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.FEATHERLESS_API_KEY,
  baseURL: "https://api.featherless.ai/v1"
});

const SYSTEM_PROMPT = `
You are a legal document analysis engine.
Analyze residential or commercial lease text.
Extract ONLY meaningful legal clauses and risks.
Ignore headers, footers, page numbers, signatures, filler text.

Return STRICT JSON ONLY.
DO NOT include markdown, backticks, or explanations.

For EACH clause, return:
- clause_type
- title
- summary
- obligations (array)
- risks (array)
- severity ("low" | "medium" | "high")
- original_text
- score (0-100, depending on how tenant-friendly the clause is)


Constraints:
- Limit obligations to a maximum of 2 short bullet points
- Prefer tenant-facing obligations unless landlord duties are unusual
- Limit risks to 1-2 concise, concrete risks
- Avoid generic legal language or hypothetical disputes
- Write 2-3 concise sentences per summary (30-60 words total)
- Summaries should explain what the clause does AND why it matters to the tenan
- Use severity "high" ONLY if the clause is unusually harsh, non-standard, or significantly more landlord-favoring than a typical lease
- Do NOT assign "high" severity solely because a clause allows eviction or penalties that are standard in most leases

If no clauses are found, return:
{ "clauses": [] }

JSON FORMAT:
{
  "clauses": [ ... ],
}

`.trim();

// split long text into chunks without breaking sentences
function splitTextToChunks(text, maxChars = 8000) {
  const lines = text.split("\n");
  const chunks = [];
  let current = "";

  for (const line of lines) {
    if ((current + line).length > maxChars) {
      chunks.push(current);
      current = line;
    } else {
      current += "\n" + line;
    }
  }

  if (current.trim()) chunks.push(current);
  return chunks;
}

// Clean AI output by removing markdown code fences and trimming
function cleanJSON(text) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

// Analyze a single chunk of text and return extracted clauses
async function analyzeChunk(chunkText, chunkIndex) {
  const response = await client.chat.completions.create({
    model: config.featherless_model,
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Lease text chunk ${chunkIndex}:\n\n${chunkText}`
      }
    ]
  });

  const raw = response.choices[0].message.content;
  const cleaned = cleanJSON(raw);

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Raw AI output:\n", raw);
    throw new Error(`Invalid JSON from chunk ${chunkIndex}`);
  }
}

// Analyze all chunks and aggregate clauses
async function analyzeChunks(text) {
  // split text into manageable chunks for the AI
  const chunks = splitTextToChunks(text);

  const allClauses = [];

  for (let i = 0; i < chunks.length; i++) {
    const result = await analyzeChunk(chunks[i], i + 1);
    if (Array.isArray(result.clauses)) {
      allClauses.push(...result.clauses);
    }
  }

  return allClauses;
}


module.exports = {
  analyzeChunks
};

