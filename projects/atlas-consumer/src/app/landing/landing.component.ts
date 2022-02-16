import { Component, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ThemeService } from 'ng2-charts';
import { AppService } from '../app.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('home') home: any;
  @ViewChild('features') features: any;
  @ViewChild('demo') demo: any;
  @ViewChild('footer') footer: any;

  isDesktop = false;
  clicked = false;

  name = '';
  mobile = '';
  email = '';
  description = '';

  mailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  inProgress = false;

  scriptURL =
    'https://script.google.com/macros/s/AKfycbx-nA2vJpog6KNnPCYse4v6fxuaod-2m59PM9Lh0gG5rvIQTiHgEO3iOSQBK4UEKriK/exec';

  sliderConfig = {
    spaceBetween: 10,
    centeredSlides: true,
    slidesPerView: 1.25,
    autoplay: true,
    loop: true,
  };

  constructor(public app: AppService) {
    this.isDesktop = app.isDesktop;
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
      case 'demo':
        target = this.demo;
        break;
      case 'footer':
        target = this.footer;
        this.clicked = true;
        break;
    }
    this.content.scrollToPoint(0, target.nativeElement.offsetTop, 1000);
  }

  submit() {
    if (!this.name) {
      this.app.presentToast('Please enter your full name!');
      return;
    }

    this.mobile = this.mobile.trim();
    if (!this.mobile || this.mobile.length < 10) {
      this.app.presentToast('Please enter a valid 10-digit mobile number!');
      return;
    }

    this.email = this.email.trim();
    if (!this.email || !this.mailRegEx.test(this.email)) {
      this.app.presentToast('Please enter a valid email address!');
      return;
    }

    var input = {
      Detail$:
        this.name +
        '~' +
        this.mobile +
        '~' +
        this.email +
        '~' +
        this.description +
        '^^',
    };

    this.inProgress = true;
    fetch(this.scriptURL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(input),
    })
      .then((response) =>
        this.app.presentToast(
          'Thanks ' +
            this.name +
            " for showing your interest. We'll get back you!"
        )
      )
      .catch((error) =>
        this.app.presentToast(
          'Error occurred, Please check your internet connection!'
        )
      )
      .finally(() => {
        this.inProgress = false;
        setTimeout(() => window.location.reload(), 3000);
      });
  }
}
