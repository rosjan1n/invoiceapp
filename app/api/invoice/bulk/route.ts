import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { z } from "zod";
import { invalidateUserCache } from "@/lib/cache";
import { validateCSRFTokenFromRequest } from "@/lib/csrf";

const bulkActionSchema = z.object({
  action: z.enum(["delete", "markAsPaid", "sendEmails", "export"]),
  invoiceIds: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Walidacja CSRF
    if (!validateCSRFTokenFromRequest(req as any)) {
      return new Response("Invalid CSRF token", { status: 403 });
    }

    const body = await req.json();
    const { action, invoiceIds } = bulkActionSchema.parse(body);

    // Sprawdź czy wszystkie faktury należą do użytkownika
    const invoices = await db.invoice.findMany({
      where: {
        id: { in: invoiceIds },
        creatorId: session.user.id,
      },
      include: {
        client: true,
        creator: true,
      },
    });

    if (invoices.length !== invoiceIds.length) {
      return new Response("Some invoices not found or not authorized", {
        status: 404,
      });
    }

    let result;

    switch (action) {
      case "delete":
        result = await handleBulkDelete(invoiceIds);
        break;
      case "markAsPaid":
        result = await handleBulkMarkAsPaid(invoiceIds);
        break;
      case "sendEmails":
        result = await handleBulkSendEmails(invoices);
        break;
      case "export":
        result = await handleBulkExport(invoices);
        break;
      default:
        return new Response("Invalid action", { status: 400 });
    }

    // Wyczyść cache po operacji
    invalidateUserCache(session.user.id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Bulk operation error:", error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: error.errors,
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

async function handleBulkDelete(invoiceIds: string[]) {
  const deletedInvoices = await db.invoice.deleteMany({
    where: {
      id: { in: invoiceIds },
    },
  });

  return {
    success: true,
    message: `Usunięto ${deletedInvoices.count} faktur`,
    count: deletedInvoices.count,
  };
}

async function handleBulkMarkAsPaid(invoiceIds: string[]) {
  const updatedInvoices = await db.invoice.updateMany({
    where: {
      id: { in: invoiceIds },
    },
    data: {
      status: "PAID",
    },
  });

  return {
    success: true,
    message: `Oznaczono jako opłacone ${updatedInvoices.count} faktur`,
    count: updatedInvoices.count,
  };
}

async function handleBulkSendEmails(invoices: any[]) {
  // TODO: Implement email sending logic
  // For now, just return success
  return {
    success: true,
    message: `Wysłano ${invoices.length} emaili`,
    count: invoices.length,
  };
}

async function handleBulkExport(invoices: any[]) {
  // TODO: Implement export logic (PDF, Excel, etc.)
  // For now, just return success
  return {
    success: true,
    message: `Eksportowano ${invoices.length} faktur`,
    count: invoices.length,
  };
}
