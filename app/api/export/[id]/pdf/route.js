import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { connectDB } from "@/lib/db";
import Meeting from "@/models/Meeting";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return new Response("Meeting not found", { status: 404 });
    }

    // ✅ Load custom font
    const fontPath = path.join(process.cwd(), "public", "fonts", "Arial.ttf");
    if (!fs.existsSync(fontPath)) {
      return new Response("Font file missing at /public/fonts/Arial.ttf", {
        status: 500,
      });
    }

    // ✅ Create PDF in memory (no file written)
    const chunks = [];
    const doc = new PDFDocument({ font: fontPath });

    // Collect PDF chunks
    doc.on("data", (chunk) => chunks.push(chunk));
    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ✅ Register & use font
      doc.registerFont("Arial", fontPath);
      doc.font("Arial");

      // ✅ PDF Content
      doc.fontSize(18).text(meeting.title || "Untitled Meeting", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(meeting.description || "No description available");
      doc.moveDown();
      doc.fontSize(10).text("Transcript:");
      doc.moveDown();
      doc.fontSize(10).text(meeting.transcript || "No transcript available");

      // ✅ End PDF stream
      doc.end();
    });

    // ✅ Send PDF to browser directly
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="meeting-${meeting._id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
