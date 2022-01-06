import { Address } from './address';

// A subset of User
export class Client {
  id: string;
  userId: string;  // like user name / kerberos

  name: string;
  pan: string;
  gst: string;

  mobile: string;
  email: string;

  address: Address = new Address();
}
