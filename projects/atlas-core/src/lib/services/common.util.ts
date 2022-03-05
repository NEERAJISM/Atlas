import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Page } from '../models/profile/pages/page';
import { Text } from '../models/profile/pages/text';

@Injectable()
export class CommonUtil {
  constructor(private httpClient: HttpClient) {}

  getTax(price: number, tax: number): number {
    return Math.round((price * tax + Number.EPSILON) * 100) / 100;
  }

  getFormattedDate(date: Date): string {
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    return da + ' ' + mo + ' ' + ye;
  }

  httpGet(url: string) {
    return this.httpClient.get(url);
  }

  getPage(type: string): Page {
    switch (type) {
      case 'Text':
        return new Text();
    }
    return null;
  }
}
