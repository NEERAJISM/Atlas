import { Address } from "./address";

/////////// REMEMBER TO SAVE EVERY BYTE OF STORAGE ///////////
export class Business {
  id: string;

  paid: boolean;
  expiry: string;

  profileName: string;
  name: string;
  year: number;

  mobile: string;
  phone: string;
  email: string;
  web: string;
  addresses: Address[] = [];

  users: string[] = [];
}
