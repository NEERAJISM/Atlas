import { Address } from "../address";
import { Client } from "../client";

export class Order {
  id: string;
  vId: string;

  client: Client = new Client();
  billingAddress: Address = new Address();
  shippingAddress: Address = new Address();

  bizId: string;

  createdTimeUTC: number;
  status: OrderStatus[] = [];

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

  // TODO payment gateway details

  constructor() { }
}

export class Item {
  id: string;
  name: string;

  // Biz Item photo url

  unit: string;
  price: number;

  qty: number;

  discount: number = 0;
  tax: string;
  taxValue: number;

  total: number;

  constructor() { }
}

export class OrderStatus {
  status: Status;
  time: number;
}

export enum Status {
  New = 'New',
  Cancel = 'Cancel',
  Reject = 'Reject',
  Accept = 'Accept',
  Progress = 'Progress',
  Transit = 'Transit',
  Complete = 'Complete',
  Return = 'Return',
  ReturnAccept = 'ReturnAccept',
  ReturnComplete = 'ReturnComplete',
}
