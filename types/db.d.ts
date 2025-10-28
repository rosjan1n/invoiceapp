import { Client, Invoice, User } from "@prisma/client";

export type SafeUser = Omit<User, "password">;

export type ExtendedInvoice = Omit<Invoice, "file"> & {
  client: Client;
  creator: SafeUser;
  fileBase64?: string | null;
};

export type InvoiceType = Omit<Invoice, "file"> & {
  client: Client;
  creator: SafeUser;
};

export type SendEmailToClientType = {
  email: string;
  clientName: string;
  invoiceDetails: {
    id: string;
    issuedDate: Date;
  };
  token: string;
  attachment: string;
};
