import { NextRequest, NextResponse } from "next/server";
import { generateCSRFToken } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  try {
    const token = generateCSRFToken();

    const response = NextResponse.json({ token });

    // Ustaw token w cookie
    response.cookies.set("csrf-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 godziny
    });

    return response;
  } catch (error) {
    console.error("CSRF token refresh error:", error);
    return NextResponse.json(
      { error: "Failed to refresh CSRF token" },
      { status: 500 }
    );
  }
}
