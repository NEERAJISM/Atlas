import { Page, Type } from './page';

export class Full implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Full;

  fullTitle: string = '';
  fullTitleColor: string = '#000000';
  fullTitleX: string = 'Mid';
  fullTitleY: string = 'Mid';
  fullTitleW: string = 'NA';
  fullTitleFont: string = 'm';

  // background image is stored in /PROFILE/bizID.jpg with id as biz id
}