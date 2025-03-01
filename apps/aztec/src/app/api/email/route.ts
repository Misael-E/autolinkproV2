import Email from "@/emails/page";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@repo/database";
import { SingleInvoice } from "@/lib/types";
import { calculateInvoiceTotals } from "@/lib/util";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { Resend } from "resend";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const resend = new Resend(process.env.RESEND_API_KEY);

// interface InvoiceProps {
// 	invoice: SingleInvoice;
// 	totals: {
// 		subtotal: string;
// 		gst: string;
// 		total: string;
// 	};
// }

export async function POST(request: Request) {
  const data = await request.json();
  const invoiceId = parseInt(data.invoiceId);

  const res: SingleInvoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      services: true,
    },
  });

  if (!res) {
    return notFound();
  }

  // Ensure the PDF is properly encoded before sending
  if (!data.buffer) {
    return new Response(JSON.stringify({ error: "PDF data is missing" }), {
      status: 400,
    });
  }
  const pdfBuffer = Buffer.from(data.buffer, "base64");
  const { subtotal, gst, total } = calculateInvoiceTotals(res.services);
  try {
    await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "aztec/invoices",
          public_id: `Invoice_${invoiceId}`,
          format: "pdf",
          overwrite: true,
        },
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(result);
        }
      );

      const stream = require("stream");
      const readableStream = new stream.PassThrough();
      readableStream.end(pdfBuffer);
      readableStream.pipe(uploadStream);
    });

    await resend.emails.send({
      from: "Aztec Auto Glass <noreply@invoice.aztecautoglass.ca>",
      to: `${res.customer.email}`,
      subject: `You received a new invoice (#${String(res?.id).padStart(
        6,
        "0"
      )})`,
      attachments: [
        {
          filename: `Invoice-${invoiceId}.pdf`,
          content: data.buffer,
          contentType: "application/pdf",
        },
      ],
      react: Email({ invoice: res, totals: { subtotal, gst, total } }),
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
