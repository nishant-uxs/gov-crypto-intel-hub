
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const table = searchParams.get("table") || "news";

  let title = ""; let columns: string[] = []; let rows: string[][] = [];

  switch (table) {
    case "news": {
      title = "News Intelligence Report";
      columns = ["Title","Tag","Region","Source","Published"];
      const data = await prisma.newsItem.findMany({ include:{source:{select:{name:true}}}, orderBy:{publishedAt:"desc"}, take:200 });
      rows = data.map((d) => [d.title, d.tag||"—", d.region, d.source.name, new Date(d.publishedAt).toLocaleDateString("en-IN")]);
      break;
    }
    case "exchanges": {
      title = "FIU-Registered VASP Directory";
      columns = ["Name","Reg#","Status","Risk","Jurisdiction","CEO"];
      const data = await prisma.exchange.findMany({ orderBy:{name:"asc"} });
      rows = data.map((d) => [d.name, d.registrationNumber||"—", d.status, d.riskLevel, d.jurisdiction, d.ceo||"—"]);
      break;
    }
    case "scams": {
      title = "Crypto Scam Registry";
      columns = ["Name","Risk Level","India Prevalence","Description"];
      const data = await prisma.scamType.findMany({ orderBy:{name:"asc"} });
      rows = data.map((d) => [d.name, d.riskLevel, d.indiaPrevalence, d.description]);
      break;
    }
    case "countries": {
      title = "Country Policy Directory";
      columns = ["Country","Stance","Regulatory Body","FATF Status","CBDC Status"];
      const data = await prisma.country.findMany({ orderBy:{name:"asc"} });
      rows = data.map((d) => [d.name, d.stance, d.regulatoryBody, d.fatfStatus, d.cbdcStatus]);
      break;
    }
    default:
      return NextResponse.json({error:"Invalid table"},{status:400});
  }

  const { jsPDF } = require("jspdf");
  require("jspdf-autotable");

  const doc = new (jsPDF as any)("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(13, 17, 28); doc.rect(0,0,pageWidth,20,"F");
  doc.setTextColor(255,255,255); doc.setFontSize(16);
  doc.text("GOVERNMENT CRYPTO INTELLIGENCE HUB", 14, 13);
  doc.setFontSize(10); doc.setTextColor(156, 163, 175);
  doc.text("Digital South Trust • Blockchain Centre of Excellence, Vellore", 14, 18);

  doc.setTextColor(13, 17, 28); doc.setFontSize(13);
  doc.text(title, 14, 30);
  doc.setFontSize(8); doc.setTextColor(107, 114, 128);
  doc.text("Generated: " + new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"}) + " IST | Classification: OFFICIAL USE ONLY", 14, 36);

  (doc as any).autoTable({
    head: [columns],
    body: rows,
    startY: 40,
    styles: { fontSize: 7, cellPadding: 2, lineColor: [55, 65, 81], lineWidth: 0.1 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255,255,255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: 10, right: 10 },
    didDrawPage: () => {
      doc.setFontSize(7); doc.setTextColor(156,163,175);
      doc.text("OFFICIAL USE ONLY • GOV CRYPTO INTEL HUB", pageWidth-10, doc.internal.pageSize.getHeight()-5, {align:"right"});
    },
  });

  const buf = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(buf, { headers: { "Content-Type":"application/pdf", "Content-Disposition":`attachment; filename="${table}-report-${new Date().toISOString().slice(0,10)}.pdf"` } });
}
