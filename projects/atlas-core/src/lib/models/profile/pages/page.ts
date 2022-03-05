export interface Page {
  id: string;
  title: string; // for header
  readonly type: Type;
}

export enum Type {
  Text = 'Text',
  Contact = 'Contact',
  Full = 'Full',
  Info = 'Info',
  Team = 'Team',
  Video = 'Video',
  Slides = 'Slides',
}
