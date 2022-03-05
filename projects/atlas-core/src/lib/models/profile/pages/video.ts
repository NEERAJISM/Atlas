import { Page, Type } from './page';

export class Video implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Video;

  paragraph: string[] = ['This is a para', 'another para'];
}