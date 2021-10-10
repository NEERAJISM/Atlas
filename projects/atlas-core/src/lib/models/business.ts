import { Address } from './Address';

/////////// REMEMBER TO SAVE EVERY BYTE OF STORAGE ///////////
export class Business {
  id: string;

  profileName: string; //TODO like insta / twitter handle

  name: string;
  web: string;

  mobile: string;
  phone: string;
  email: string;
  // TODO Array of images of business

  paid: boolean;
  expiry: string;

  users: string[] = [];

  addresses: Address[] = [];
}
