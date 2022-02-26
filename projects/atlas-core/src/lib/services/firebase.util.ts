import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Constants } from '../constants';

@Injectable()
export class FirebaseUtil {
  constructor(
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  static errorCodeToMessageMapper(code: string): string {
    if (!code) {
      return code;
    }

    switch (code) {
      case Constants.AUTH_NO_USER:
        return 'No account found for this e-mail, Please register!';
      case Constants.AUTH_INVALID_PASSWORD:
        return 'Incorrect Password!';
      case Constants.AUTH_ALREADY_IN_USE:
        return 'This e-mail id is already registered, Please login!';
      case Constants.AUTH_NETWORK_ISSUE:
        return 'Network issue, Please check your internet connectivity';
      default:
        return code;
    }
  }

  getId(): string {
    return this.firestore.createId();
  }

  getInstance(): AngularFirestore {
    return this.firestore;
  }

  getClientRef(bizId: string): AngularFirestoreCollection {
    return this.firestore
      .collection(Constants.CLIENT_DB)
      .doc(bizId)
      .collection(Constants.CLIENTS);
  }

  getProductRef(bizId: string): AngularFirestoreCollection {
    return this.firestore
      .collection(Constants.PRODUCT_DB)
      .doc(bizId)
      .collection(Constants.PRODUCTS);
  }

  getInvoiceRef(bizId: string): AngularFirestoreCollection {
    return this.firestore
      .collection(Constants.INVOICE_DB)
      .doc(bizId)
      .collection(Constants.INVOICES);
  }

  getInvoicePreviewRef(bizId: string): AngularFirestoreCollection {
    return this.firestore
      .collection(Constants.INVOICE_PREVIEW_DB)
      .doc(bizId)
      .collection(Constants.INVOICE_PREVIEWS);
  }

  toJson(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  uploadImage(
    file: any,
    type: string,
    bizId: string,
    id?: string,
    name?: string
  ) {
    return this.storage
      .ref(type + '/' + bizId + (id ? '/' + id : '') + (name ? '/' + name : ''))
      .put(file);
  }

  downloadImage(type: string, bizId: string, id?: string, name?: string) {
    return this.storage
      .ref(type + '/' + bizId + (id ? '/' + id : '') + (name ? '/' + name : ''))
      .getDownloadURL();
  }
}
