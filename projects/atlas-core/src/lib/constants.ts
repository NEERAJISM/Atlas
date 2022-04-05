export class Constants {
  static readonly SUCCESS = 'Success';
  static readonly FAILURE = 'Failure';

  static readonly AUTH_NO_USER = 'auth/user-not-found';
  static readonly AUTH_INVALID_PASSWORD = 'auth/wrong-password';
  static readonly AUTH_ALREADY_IN_USE = 'auth/email-already-in-use';
  static readonly AUTH_NETWORK_ISSUE = 'auth/network-request-failed';

  // Firebase
  static readonly BUSINESS = 'BUSINESS';
  static readonly INFO = 'INFO';
  static readonly PROFILE = 'PROFILE';
  static readonly PAGES = 'PAGES';
  
  static readonly ORDERS = 'ORDERS';
  static readonly INVOICE = 'INVOICE';
  static readonly INVOICE_PREVIEW = 'INVOICE_PREVIEW';
  static readonly INVOICE_NUMBER = 'INVOICE_NUMBER';

  static readonly USER = 'USER';
  static readonly CART = 'CART';

  // TODO remove old
  static readonly USER_DB = 'UserDB';
  static readonly CLIENT_DB = 'ClientDB';
  static readonly PRODUCT_DB = 'ProductDB';
  static readonly ORDER_DB = 'OrderDB';
  static readonly BIZ_ORDER_DB = 'BizOrderDB';
  static readonly CLIENT_ORDER_DB = 'ClientOrderDB';

  static readonly USERS = 'Users';
  static readonly CLIENTS = 'Clients';
  static readonly PRODUCTS = 'Products';

  // UI
  static readonly TAX_STRING_SGST = 'Tax (SGST + CGST)';
  static readonly TAX_STRING_IGST = 'Tax (IGST)';

  static readonly states: string[] = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttarakhand',
    'Uttar Pradesh',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli',
    'Daman and Diu',
    'Delhi',
    'Lakshadweep',
    'Puducherry',
  ];

  static readonly optionsTax: string[] = [
    '0% GST',
    '5% GST',
    '12% GST',
    '18% GST',
    '28% GST',
  ];
  static readonly optionsTaxValue: number[] = [0, 0.05, 0.12, 0.18, 0.28];

  static readonly mailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  static readonly passRegEx = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  static readonly usernameRegEx = /^[A-Za-z0-9](?:(?:[A-Za-z0-9_-]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9]))?$/;
  static readonly ytbRegEx = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
}
