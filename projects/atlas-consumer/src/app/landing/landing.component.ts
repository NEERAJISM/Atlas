import { Component, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('home') home: any;
  @ViewChild('features') features: any;
  @ViewChild('footer') footer: any;

  isDesktop = false;
  clicked = false;

  constructor() {
    if (window.innerWidth > 1000) {
      this.isDesktop = true;
    }
  }

  public scrollElement(element: string) {
    let target;

    switch (element) {
      case 'home':
        target = this.home;
        break;
      case 'features':
        target = this.features;
        break;
      case 'footer':
        target = this.footer;
        this.clicked = true;
        break;
    }
    this.content.scrollToPoint(0, target.nativeElement.offsetTop, 1000);
  }
}
