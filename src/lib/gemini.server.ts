const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export interface AnalysisInput {
  interests: string[];
  focusTags: string[];
  level: string | null;
  platforms: string[];
}

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          highlight: { type: "boolean" },
        },
        required: ["name", "highlight"],
      },
    },
    scores: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          value: { type: "number" },
        },
        required: ["label", "value"],
      },
    },
    jobs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          match: { type: "number" },
          title: { type: "string" },
          company: { type: "string" },
          demand: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["match", "title", "company", "demand", "tags"],
      },
    },
  },
  required: ["summary", "skills", "scores", "jobs"],
};

export async function runGeminiAnalysis(apiKey: string, input: AnalysisInput) {
  const prompt = [
    "You are SkillSync, an AI career engine for software engineers.",
    "Build a skill profile from the signals below.",
    `Fields of interest: ${input.interests.join(", ") || "unspecified"}`,
    `Custom focus tags: ${input.focusTags.join(", ") || "none"}`,
    `Experience level: ${input.level ?? "unspecified"}`,
    `Connected platforms: ${input.platforms.join(", ") || "none"}`,
    "",
    "Return:",
    "- summary: 2-3 sentences, second person, describing their strongest direction.",
    "- skills: exactly 6 technical skills; highlight true for the 3 strongest.",
    "- scores: exactly 3 entries labelled 'GitHub Activity', 'Resume Match', 'Interview Readiness', each an integer 0-100.",
    "- jobs: exactly 3 realistic job matches, match as an integer 0-100 sorted descending,",
    "  demand as a short string like '+15% demand', tags 2-3 technologies each.",
  ].join("\n");

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Analysis failed (${res.status}): ${text.slice(0, 300)}`);
  }

  let payload: {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error("Analysis returned an unreadable response.");
  }

  const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("Analysis returned no content.");

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Analysis returned malformed JSON.");
  }
}
