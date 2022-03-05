import { Page, Type } from './page';

export class Slides implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Slides;
  
  paragraph: string[] = ['This is a para', 'another para'];
}