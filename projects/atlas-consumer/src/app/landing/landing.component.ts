import { Component, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('home') home: any;
  @ViewChild('about') about: any;
  @ViewChild('services') services: any;
  @ViewChild('projects') projects: any;
  @ViewChild('team') team: any;
  @ViewChild('footer') footer: any;

  isDesktop = false;

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
      case 'about':
        target = this.about;
        break;
      case 'services':
        target = this.services;
        break;
      case 'projects':
        target = this.projects;
        break;
      case 'team':
        target = this.team;
        break;
      case 'footer':
        target = this.footer;
        break;
    }

    this.content.scrollToPoint(0, target.nativeElement.offsetTop, 1000);
  }
}
