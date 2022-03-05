import { Page, Type } from './page';

export class Info implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Info;
  
  paragraph: string[] = ['This is a para', 'another para'];
}