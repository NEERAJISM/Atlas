// Segergate Main Page & others so that itloads early

import { Contact } from './pages/contact';
import { Full } from './pages/full';

export class Profile {
  id: string;

  // toolbar
  title: string;
  icon: string;
  color: string;
  fontColor: string;

  home: Full = new Full();
  contact: Contact = new Contact();

  pages: string[] = [];
}
