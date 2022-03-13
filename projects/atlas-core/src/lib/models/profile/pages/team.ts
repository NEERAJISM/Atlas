import { Page, Type } from './page';

export class Team implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Team;

  members: Member[] = [new Member()];
}

export class Member {
  id: string = '';
  name: string = '';
  designation: string = '';
  details: string = '';
}
