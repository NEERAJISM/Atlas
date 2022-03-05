import { Page, Type } from './page';

export class Team implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Team;

  paragraph: string[] = ['This is a para', 'another para'];
}