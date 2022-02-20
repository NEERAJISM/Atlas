export class InvoicePreview {
  id: string;
  invoiceNo: string;
  isDraft: boolean;

  client: string;
  address: string;

  amount: number;

  invoiceDate: string;
  dueDate: string;

  lastUpdatedTimeUtc: number;
}
