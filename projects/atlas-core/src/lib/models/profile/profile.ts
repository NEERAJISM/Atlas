// Segergate Main Page & others so that itloads early

import { Full } from './pages/full';

export class Profile {
  id: string;

  // toolbar
  title: string;
  icon: string;
  color: string;
  fontColor: string;

  home: Full = new Full();

  pages: string[] = [];
}
