import { Page, Type } from './page';

export class Slides implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Slides;

  slides: Slide[] = [new Slide()];
}

export class Slide {
  id: string = '';
  title: string = 'Title';
  description: string = 'Description';
  orientation = 'p';
}
