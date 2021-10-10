/////////// REMEMBER TO SAVE EVERY BYTE OF STORAGE ///////////

export class User {
  id: string;
  clientId: string; // for linkage

  email: string;
  emailVerified: boolean;
  mobile: string;
  password: string;

  firstName: string;
  lastName: string;

  // copy all fields from client as a User can be a client but vice versa is not true
}
