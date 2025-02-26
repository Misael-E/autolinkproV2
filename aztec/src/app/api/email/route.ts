import Email from "@/emails/page";
import prisma from "@/lib/prisma";
import { SingleInvoice } from "@/lib/types";
import { calculateInvoiceTotals } from "@/lib/util";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { Resend } from "resend";

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
  if (!data.pdfBase64) {
    return new Response(JSON.stringify({ error: "PDF data is missing" }), {
      status: 400,
    });
  }

  const { subtotal, gst, total } = calculateInvoiceTotals(res.services);
  try {
    await resend.emails.send({
      from: "Aztec Auto Glass <noreply@invoice.aztecautoglass.ca>",
      to: `${res.customer.email}`,
      subject: `You received a new invoice (#${String(res?.id).padStart(
        6,
        "0"
      )})`,
      attachments: [
        {
          filename: `invoice-${invoiceId}.pdf`,
          content: data.pdfBase64,
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
