import { Address } from './address';

// A subset of User
export class Client {
  id: string;
  userId: string;  // like user name / kerberos

  name: string;  // remove
  pan: string;
  gst: string;

  mobile: string; // remove
  email: string; // remove

  address: Address = new Address();
}
