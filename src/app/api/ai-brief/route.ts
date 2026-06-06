
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const refresh = searchParams.get("refresh") === "true";

  if (!refresh) {
    const latest = await prisma.aiBrief.findFirst({
      orderBy: { generatedAt: "desc" },
    });
    if (latest) {
      return NextResponse.json({
        section1: latest.section1,
        section2: latest.section2,
        section3: latest.section3,
        generatedAt: latest.generatedAt,
      });
    }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      section1: "Claude API key not configured. Please add ANTHROPIC_API_KEY to environment variables.",
      section2: "AI brief generation requires an Anthropic API key.",
      section3: "Configure the key in the admin panel under AI Brief Config.",
    });
  }

  try {
    const [indiaItems, globalItems] = await Promise.all([
      prisma.newsItem.findMany({
        where: { region: "INDIA", isSuppressed: false },
        orderBy: { publishedAt: "desc" },
        take: 20,
        select: { title: true, publishedAt: true, tag: true, summary: true },
      }),
      prisma.newsItem.findMany({
        where: { region: "GLOBAL", isSuppressed: false },
        orderBy: { publishedAt: "desc" },
        take: 20,
        select: { title: true, publishedAt: true, tag: true, summary: true },
      }),
    ]);

    const context = JSON.stringify({ indiaItems, globalItems });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: "You are a crypto policy intelligence analyst for the Government of India. Generate three concise brief sections based on the provided news data. Be factual, professional, and India-focused.",
        messages: [{
          role: "user",
          content: "Generate three sections: (1) India Regulatory Pulse - key India policy/regulatory developments, (2) Global Threat Landscape - international crypto threats relevant to India, (3) Enforcement & Compliance Watch - notable enforcement actions and compliance updates. Format each as 150-200 words. Here is the context:\n\n" + context,
        }],
      }),
    });

    const result = await response.json();
    const text = result.content?.[0]?.text || "";

    const sections = text.split(/(?:\(1\)|Section 1:|India Regulatory Pulse)/i);
    const section1 = sections[1] || "No data";
    const section2 = sections[2] || "No data";
    const section3 = sections[3] || "No data";

    await prisma.aiBrief.create({
      data: {
        section1: section1.trim().substring(0, 500),
        section2: section2.trim().substring(0, 500),
        section3: section3.trim().substring(0, 500),
        modelUsed: "claude-sonnet-4-20250514",
        tokensUsed: result.usage?.input_tokens || 0,
        sourceItemIds: "[]",
      },
    });

    return NextResponse.json({
      section1: section1.trim().substring(0, 500),
      section2: section2.trim().substring(0, 500),
      section3: section3.trim().substring(0, 500),
    });
  } catch (error: any) {
    console.error("AI Brief error:", error);
    return NextResponse.json({
      section1: "Error generating brief: " + (error.message || "Unknown error"),
      section2: "Please check the Claude API key and try again.",
      section3: "Contact the administrator if the issue persists.",
    });
  }
}
