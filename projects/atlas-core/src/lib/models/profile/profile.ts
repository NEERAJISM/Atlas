// Segergate Main Page & others so that itloads early

import { Full } from './pages/full';

export class Profile {
  id: string;

  title: string;
  icon: string;

  //remove
  caption: string;
  background: string;
  color:string;

  home: Full = new Full();
}