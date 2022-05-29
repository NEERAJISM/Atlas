import { Page, Type } from './page';

export class Info implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Info;

  reverse: string = 'N';
  heading: string = 'Heading';
  info: string = 'Add\nDescription\nHere!!';
  align: string = 'Left';
  color: string = '#000000';
  font: string = 's';
}
