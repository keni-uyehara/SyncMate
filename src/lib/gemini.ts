import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai"

let cachedModel: GenerativeModel | null = null

export function getGeminiModel(modelName: string = "gemini-1.5-flash"): GenerativeModel | null {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) return null
  if (cachedModel) return cachedModel
  const genAI = new GoogleGenerativeAI(apiKey)
  cachedModel = genAI.getGenerativeModel({ model: modelName })
  return cachedModel
}

export async function summarizeText(text: string, maxTokensApprox: number = 120): Promise<string | null> {
  const model = getGeminiModel()
  if (!model) return null
  const prompt = `Summarize the following text clearly and concisely within ${maxTokensApprox} tokens:\n\n${text}`
  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export async function generateRecommendations(context: string, count: number = 4): Promise<string[] | null> {
  const model = getGeminiModel()
  if (!model) return null
  const prompt = `Based on the context below, produce ${count} numbered, specific, non-redundant recommendations.\nContext:\n${context}`
  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  const lines = text
    .split(/\n+/)
    .map(l => l.replace(/^\s*[-*•]\s*/, "").replace(/^\s*\d+\.?\s*/, "").trim())
    .map(stripMarkdownAsterisks)
    .filter(l => l.length > 0)
  return lines.slice(0, count)
}

function stripMarkdownAsterisks(input: string): string {
  // Remove bold markers like **Heading:** or **text** anywhere
  let output = input
    .replace(/^\*\*(.*?)\*\*:?\s*/, "$1: ") // leading bold heading
    .replace(/\*\*(.*?)\*\*/g, "$1") // remaining bold spans
    .replace(/^_(.*?)_:?\s*/, "$1: ") // leading italic heading
    .replace(/_(.*?)_/g, "$1") // remaining italic spans
    .replace(/^`+(.*?)`+\s*/, "$1 ") // inline code at start
    .replace(/`+(.*?)`+/g, "$1") // inline code anywhere
  return output.trim()
}


