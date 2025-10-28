import { useState, useEffect } from "react";

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    // Pobierz token CSRF z cookies
    const getCSRFToken = () => {
      const cookies = document.cookie.split(";");
      const csrfCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("csrf-token=")
      );

      if (csrfCookie) {
        const token = csrfCookie.split("=")[1];
        setCsrfToken(token);
      }
    };

    getCSRFToken();
  }, []);

  const getCSRFHeaders = () => {
    if (!csrfToken) return {};

    return {
      "x-csrf-token": csrfToken,
    };
  };

  const refreshCSRFToken = async () => {
    try {
      const response = await fetch("/api/csrf/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.token);
      }
    } catch (error) {
      console.error("Failed to refresh CSRF token:", error);
    }
  };

  return {
    csrfToken,
    getCSRFHeaders,
    refreshCSRFToken,
  };
}
