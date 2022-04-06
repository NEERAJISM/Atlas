import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Full } from '../models/profile/pages/full';
import { Info } from '../models/profile/pages/info';
import { Page } from '../models/profile/pages/page';
import { Slides } from '../models/profile/pages/slides';
import { Team } from '../models/profile/pages/team';
import { Text } from '../models/profile/pages/text';
import { Video } from '../models/profile/pages/video';
import { Menu } from '../models/profile/pages/menu';

@Injectable()
export class CommonUtil {
  constructor(private httpClient: HttpClient) {}

  getTax(price: number, tax: number): number {
    return Math.round((price * tax + Number.EPSILON) * 100) / 100;
  }

  roundOff(x: number){
    return Math.round((x + Number.EPSILON) * 100) / 100;
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
      case 'Full':
        return new Full();
      case 'Text':
        return new Text();
      case 'Info':
        return new Info();
      case 'Slides':
        return new Slides();
      case 'Team':
        return new Team();
      case 'Video':
        return new Video();
      case 'Menu':
        return new Menu();
    }
    return null;
  }
}
