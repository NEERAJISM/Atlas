import { About } from './pages/about';
import { Full } from './pages/full';
import { Page, Type } from './pages/page';

// seperate from main profile home page so can be loaded later
export class Pages {
  id: string;
  pages: PageIndex[] = [];

  //remove
  about: About[] = [];

  constructor() {
    this.pages.push(new PageIndex(Type.Full, new Full()));
    this.pages.push(new PageIndex(Type.About, new About()));
  }
}

export class PageIndex {
  type: Type;
  page: Page;

  constructor(type, page) {
    this.type = type;
    this.page = page;
  }
}
