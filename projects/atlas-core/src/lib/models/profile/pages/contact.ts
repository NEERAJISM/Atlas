import { Page, Type } from './page';

export class Contact implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Contact;
  
  paragraph: string[] = ['This is a para', 'another para'];
}