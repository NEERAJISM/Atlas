import { Page, Type } from './page';

export class Video implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Video;

  videoTitle = 'Our Video'
  url: string = '';
}