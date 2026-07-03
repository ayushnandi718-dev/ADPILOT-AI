import { NextResponse } from "next/server";
import { aiService } from "@/services/ai-service";

export async function POST(request: Request) {
  try {
    const { messages, provider, apiKey, model, baseUrl } = await request.json();

    if (!provider) {
      return NextResponse.json({ error: "AI provider is required" }, { status: 400 });
    }

    aiService.setProvider(provider);
    const response = await aiService.generateCompletion(messages, {
      provider,
      apiKey,
      model,
      baseUrl,
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI request failed" },
      { status: 500 }
    );
  }
}
