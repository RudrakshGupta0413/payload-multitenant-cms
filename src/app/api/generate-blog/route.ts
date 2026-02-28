import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `You are a professional blog writer. Given a topic/prompt, write a detailed, engaging, well-structured blog post.

You MUST return ONLY a valid JSON object with this exact structure:
{
  "title": "The Blog Title Here",
  "slug": "the-blog-title-here",
  "content": {
    "root": {
      "type": "root",
      "format": "",
      "indent": 0,
      "version": 1,
      "direction": "ltr",
      "children": [
        ... nodes here ...
      ]
    }
  }
}

RULES FOR THE "children" ARRAY INSIDE "root":

1. For the blog title, use a heading node:
{
  "type": "heading",
  "tag": "h1",
  "format": "",
  "indent": 0,
  "version": 1,
  "direction": "ltr",
  "children": [{ "type": "text", "text": "Title Text", "version": 1 }]
}

2. For section headers, use h2 headings:
{
  "type": "heading",
  "tag": "h2",
  "format": "",
  "indent": 0,
  "version": 1,
  "direction": "ltr",
  "children": [{ "type": "text", "text": "Section Title", "version": 1 }]
}

3. For sub-sections, use h3 headings (same structure as h2 but with "tag": "h3")

4. For body paragraphs:
{
  "type": "paragraph",
  "format": "",
  "indent": 0,
  "version": 1,
  "direction": "ltr",
  "children": [{ "type": "text", "text": "Paragraph content here...", "version": 1 }]
}

5. For bold text within a paragraph, set "format": 1 on the text node:
{ "type": "text", "text": "bold text", "format": 1, "version": 1 }

6. For italic text, set "format": 2:
{ "type": "text", "text": "italic text", "format": 2, "version": 1 }

IMPORTANT RULES:
- Write at least 800-1000 words
- Use multiple h2 sections (at least 4-5)
- Include an engaging introduction paragraph after the h1
- Include a conclusion section
- Make the content informative, well-researched, and professional
- The "slug" should be a URL-friendly version of the title (lowercase, hyphens, no special chars)
- Return ONLY the JSON object, nothing else — no markdown, no code fences, no explanations`

// Helper for wait/sleep
const sleep = (ms: number) => new Promise((resolve) => resolve(null))

async function generateWithRetry(model: any, prompt: string, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent([
                { text: SYSTEM_PROMPT },
                { text: `Write a blog post about: ${prompt.trim()}` },
            ])
            return result
        } catch (error: any) {
            const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')

            if (isRateLimit && i < retries - 1) {
                console.log(`Rate limit hit, retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`)
                await new Promise(resolve => setTimeout(resolve, delay))
                delay *= 2 // Exponential backoff
                continue
            }
            throw error
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json()

        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'A valid prompt is required.' },
                { status: 400 },
            )
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API key is not configured on the server.' },
                { status: 500 },
            )
        }

        const genAI = new GoogleGenerativeAI(apiKey)

        // Use gemini-flash-latest as primary, as it is widely available and stable on free tier
        // Some keys might 404 on 'gemini-1.5-flash' specifically
        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.7,
            },
        })

        const result = await generateWithRetry(model, prompt)
        const responseText = result.response.text()

        // Parse and validate the JSON response
        let blogData
        try {
            blogData = JSON.parse(responseText)
        } catch {
            console.error('Gemini returned invalid JSON:', responseText.substring(0, 500))
            return NextResponse.json(
                { error: 'AI returned an invalid response. Please try again.' },
                { status: 502 },
            )
        }

        // Validate required fields
        if (!blogData.title || !blogData.slug || !blogData.content?.root) {
            console.error('Gemini response missing required fields:', Object.keys(blogData))
            return NextResponse.json(
                { error: 'AI response is missing required fields. Please try again.' },
                { status: 502 },
            )
        }

        return NextResponse.json({
            title: blogData.title,
            slug: blogData.slug,
            content: blogData.content,
        })
    } catch (error: any) {
        console.error('Generate blog error:', error?.message || error)

        const isRateLimit = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')

        if (isRateLimit) {
            return NextResponse.json(
                { error: 'The AI service is currently busy (Rate Limit). This usually happens on free accounts. I have implemented automatic retries, but if it still fails, please wait 30 seconds and try again.' },
                { status: 429 },
            )
        }

        return NextResponse.json(
            { error: error?.message || 'An unexpected error occurred. Please try again.' },
            { status: 500 },
        )
    }
}
