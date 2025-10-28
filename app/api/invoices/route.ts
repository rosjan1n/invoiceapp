import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { z } from "zod";
import { createRateLimit, rateLimitConfigs } from "@/lib/rate-limit";
import { addRateLimitHeaders } from "@/lib/rate-limit-middleware";
import { NextResponse } from "next/server";

const invoicesQuerySchema = z.object({
  search: z.string().optional().default(""),
  offset: z.string().optional().default("0"),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export async function GET(req: Request) {
  try {
    // Sprawdź rate limiting
    const rateLimit = createRateLimit(rateLimitConfigs.invoices);
    const rateLimitResponse = rateLimit(req as any);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = invoicesQuerySchema.parse({
      search: searchParams.get("search") || "",
      offset: searchParams.get("offset") || "0",
      status: searchParams.get("status") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
    });

    const user = session.user;
    const offset = parseInt(query.offset);

    // Buduj where clause z filtrami
    const buildWhereClause = () => {
      const where: any = {
        creatorId: user.id,
      };

      // Search filter
      if (query.search) {
        where.OR = [
          { invoiceId: { contains: query.search, mode: "insensitive" } },
          { client: { name: { contains: query.search, mode: "insensitive" } } },
          {
            client: { email: { contains: query.search, mode: "insensitive" } },
          },
        ];
      }

      // Status filter
      if (query.status) {
        where.status = query.status;
      }

      // Date filters
      if (query.dateFrom || query.dateTo) {
        where.issuedAt = {};
        if (query.dateFrom) {
          where.issuedAt.gte = new Date(query.dateFrom);
        }
        if (query.dateTo) {
          where.issuedAt.lte = new Date(query.dateTo);
        }
      }

      return where;
    };

    // Buduj orderBy clause
    const buildOrderBy = () => {
      if (query.sortBy) {
        const order = query.sortOrder === "desc" ? "desc" : "asc";
        return { [query.sortBy]: order as "asc" | "desc" };
      }
      return { issuedAt: "desc" as const };
    };

    const whereClause = buildWhereClause();
    const orderBy = buildOrderBy();

    // Równoległe zapytania dla lepszej wydajności
    const [totalInvoices, invoices] = await Promise.all([
      db.invoice.count({
        where: whereClause,
      }),
      db.invoice.findMany({
        where: whereClause,
        select: {
          id: true,
          token: true,
          invoiceId: true,
          status: true,
          paymentMethod: true,
          exemptTax: true,
          issuedAt: true,
          soldAt: true,
          createdAt: true,
          updatedAt: true,
          creatorId: true,
          clientId: true,
          fileBase64: true,
          fileName: true,
          contentType: true,
          products: true,
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              address: true,
              taxIdNumber: true,
              createdAt: true,
              creatorId: true,
            },
          },
        },
        orderBy: orderBy,
        skip: offset,
        take: 10,
      }),
    ]);

    // Sprawdź czy są więcej stron
    const hasMorePages = offset + invoices.length < totalInvoices;
    const newOffset = hasMorePages ? offset + invoices.length : null;

    const response = new NextResponse(
      JSON.stringify({
        invoices,
        newOffset,
        totalInvoices,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

    // Dodaj nagłówki rate limit
    return addRateLimitHeaders(req as any, response);
  } catch (error) {
    console.error("Get invoices error:", error);

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
