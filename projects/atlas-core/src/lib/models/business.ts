import { Address } from "./address";

/////////// REMEMBER TO SAVE EVERY BYTE OF STORAGE ///////////
export class Business {
  id: string;

  profile: string;
  name: string;
  year: number;

  gst: string;

  mobile: string;
  phone: string;
  email: string;
  website: string;
  address: Address = new Address();

  paid: boolean = false;
  expiry: string;
}
