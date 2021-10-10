/////////// REMEMBER TO SAVE EVERY BYTE OF STORAGE + keep simple + primitive ///////////

import { Address } from './address';
import { Client } from './client';
import { Item } from './order';

export class Invoice {
  id: string;
  invoiceNo: string;
  allVersions: InvoiceVersion[] = [];
}

export class InvoiceVersion {
  isDraft: boolean;
  createdTimeUtc: number;
  lastUpdatedTimeUtc: number;

  invoiceDate: string;
  dueDate: string;

  supplyState: string;
  supplyPlace: string;

  paymentTerms: string;

  client: Client = new Client();
  shippingAddress: Address = new Address();
  shippingAddressSame = true;

  items: Item[] = [];

  packagingCharges: number;
  deliveryCharges: number;

  otherCharges: number;
  otherChargesDesc: string;

  chargesTax: number;
  chargesTaxPercent: number;

  totalTaxableValue: number;
  totalTax: number;
  total: number;

  signId: string;

  constructor() { }
}