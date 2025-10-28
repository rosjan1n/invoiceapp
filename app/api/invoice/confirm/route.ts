import { db } from "@/lib/prisma";
import { invalidateUserCache } from "@/lib/cache";
import { z } from "zod";

// Schema walidacji dla request body
const confirmInvoiceSchema = z.object({
  token: z
    .string()
    .min(1, "Token jest wymagany")
    .max(100, "Token jest za długi"),
});

export async function POST(req: Request) {
  try {
    // Parsowanie i walidacja body
    const body = await req.json();
    const validationResult = confirmInvoiceSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn("Invalid request body:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane",
          details: validationResult.error.errors.map((err) => err.message),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { token } = validationResult.data;

    // Sprawdź czy faktura istnieje
    const invoiceToConfirm = await db.invoice.findFirst({
      select: {
        id: true,
        status: true,
        invoiceId: true,
        creatorId: true,
        issuedAt: true,
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      where: {
        token: token,
      },
    });

    if (!invoiceToConfirm) {
      console.warn(`Invoice not found for token: ${token.substring(0, 8)}...`);
      return new Response(
        JSON.stringify({
          error: "Faktura nie została znaleziona",
          message: "Sprawdź czy link jest prawidłowy",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sprawdź czy faktura nie jest już opłacona
    if (invoiceToConfirm.status === "PAID") {
      console.info(`Invoice ${invoiceToConfirm.invoiceId} is already paid`);
      return new Response(
        JSON.stringify({
          error: "Faktura została już opłacona",
          message: "Ta faktura została wcześniej potwierdzona jako opłacona",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sprawdź czy faktura nie jest zbyt stara (opcjonalne zabezpieczenie)
    const invoiceAge = Date.now() - invoiceToConfirm.issuedAt.getTime();
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 rok w milisekundach

    if (invoiceAge > maxAge) {
      console.warn(
        `Invoice ${invoiceToConfirm.invoiceId} is too old: ${Math.floor(
          invoiceAge / (24 * 60 * 60 * 1000)
        )} days`
      );
      return new Response(
        JSON.stringify({
          error: "Faktura jest zbyt stara",
          message: "Nie można potwierdzić płatności za fakturę starszą niż rok",
        }),
        {
          status: 410,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Zmień status na PAID
    const updatedInvoice = await db.invoice.update({
      where: {
        id: invoiceToConfirm.id,
      },
      data: {
        status: "PAID",
        updatedAt: new Date(),
      },
      select: {
        id: true,
        invoiceId: true,
        creatorId: true,
        status: true,
        updatedAt: true,
      },
    });

    // Wyczyść cache po zmianie statusu faktury
    await invalidateUserCache(updatedInvoice.creatorId);

    // Logowanie pomyślnego potwierdzenia
    console.info(
      `Invoice ${updatedInvoice.invoiceId} confirmed as paid by client ${invoiceToConfirm.client.name} (${invoiceToConfirm.client.email})`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Faktura została pomyślnie potwierdzona jako opłacona",
        data: {
          invoiceId: updatedInvoice.invoiceId,
          status: updatedInvoice.status,
          confirmedAt: updatedInvoice.updatedAt,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error confirming invoice:", err);

    // Sprawdź czy to błąd bazy danych
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return new Response(
        JSON.stringify({
          error: "Błąd bazy danych",
          message: "Wystąpił problem z aktualizacją faktury",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Błąd serwera",
        message: "Wystąpił nieoczekiwany błąd podczas potwierdzania płatności",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
