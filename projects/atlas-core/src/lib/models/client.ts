import { Address } from './address';

// A subset of User
export class Client {
  id: string;

  pan: string;
  gst: string;

  address: Address = new Address();
}
