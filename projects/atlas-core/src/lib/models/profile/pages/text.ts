import { Page, Type } from './page';

export class Text implements Page {
  id: string = '';
  title: string = '';
  readonly type: Type = Type.Text;

  heading: string = 'Heading';
  headingColor: string = '#000000';
  headingFont: string = 'm';

  paragraph: string = 'Add description here!';
  paragraphColor: string = '#000000';
  paragraphStyle: string = 'normal';
}
