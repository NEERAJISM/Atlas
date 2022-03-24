import { Page, Type } from './page';

export class Menu implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Menu;
}