import { Page, Type } from './page';

export class Info implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Info;

  reverse: string = 'N';
  info: string = '\n\n\nAdd\nDescription\nHere!!';
  align: string = 'Left';
  color: string = '#000000';
  font: string = 'm';
}
