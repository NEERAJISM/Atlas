import { Page, Type } from './page';

export class About implements Page {
  title: string;
  type: Type;
  paragraph: string[] = ['This is a para', 'another para'];
}