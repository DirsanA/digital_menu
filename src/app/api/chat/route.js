import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = body.messages || [];
  if (!messages.length) {
    return NextResponse.json(
      { error: "Body must include a non-empty messages array." },
      { status: 400 }
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;

  if (!apiKey) {
    return NextResponse.json({
      content: "I am missing my API key to connect to my brain. Please add GROQ_API_KEY to the environment variables.",
      fallback: true,
      reason: "missing_api_key",
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          messages: messages,
        }),
        cache: "no-store",
        signal: controller.signal,
      },
    );

    if (!groqResponse.ok) {
      return NextResponse.json({
        content: "Sorry, I am having trouble connecting to my service right now.",
        fallback: true,
        reason: "groq_http_error",
        status: groqResponse.status,
      });
    }

    const data = await groqResponse.json();

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json({
        content: "Sorry, I received an empty response.",
        fallback: true,
        reason: "empty_model_response",
      });
    }

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({
      content: "I could not reach the assistant service right now. Please try again in a moment.",
      fallback: true,
      reason: "groq_fetch_failed",
    });
  } finally {
    clearTimeout(timeout);
  }
}
