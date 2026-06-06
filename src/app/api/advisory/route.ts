
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    legislative, fatf, tds, gst, states, carf, recommendations, legal,
  ] = await Promise.all([
    prisma.advisoryLegislative.findMany({ orderBy: { dateIntroduced: "desc" } }),
    prisma.advisoryFatf.findMany({ orderBy: { recNumber: "asc" } }),
    prisma.advisoryTds.findMany({ orderBy: { fyLabel: "desc" } }),
    prisma.advisoryGst.findMany({ orderBy: { year: "desc" } }),
    prisma.advisoryState.findMany({ orderBy: { scamLossesCr: "desc" } }),
    prisma.advisoryCarf.findMany({ orderBy: { stepNumber: "asc" } }),
    prisma.advisoryRecommendation.findMany({ orderBy: { priority: "asc" } }),
    prisma.advisoryLegal.findMany({ orderBy: { year: "desc" } }),
  ]);

  return NextResponse.json({
    legislative, fatf, tds, gst, states, carf, recommendations, legal,
  });
}
