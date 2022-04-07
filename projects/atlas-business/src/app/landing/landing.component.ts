import { Component, ViewChild } from '@angular/core';
import { AlertController, IonContent, ModalController } from '@ionic/angular';
import { AuthService, Constants } from 'atlas-core';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { ModalPage } from './modal/modal.page';

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

  // subscriptions
  subscriptions: Subscription[] = [];

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private service: AppService,
    private auth: AuthService
  ) {
    this.isDesktop = service.isDesktop;
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.service.modalCloseEvent.subscribe((s) => {
        if (s === 'success') {
          this.modalController.dismiss();
          setTimeout(() => this.service.go('/dashboard'), 1000);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.modalController.dismiss();
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  async presentModal() {
    if (this.auth.userData) {
      this.service.go('/dashboard');
      return;
    }

    const modal = await this.modalController.create({
      component: ModalPage,
      cssClass: 'login-modal',
    });
    return await modal.present();
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
      this.service.presentToast('Please enter your full name!');
      return;
    }

    this.mobile = this.mobile.trim();
    if (!this.mobile || this.mobile.length < 10) {
      this.service.presentToast('Please enter a valid 10-digit mobile number!');
      return;
    }

    this.email = this.email.trim();
    if (!this.email || !Constants.mailRegEx.test(this.email)) {
      this.service.presentToast('Please enter a valid email address!');
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
        this.service.presentToast(
          'Thanks ' +
            this.name +
            " for showing your interest. We'll get back you!"
        )
      )
      .catch((error) =>
        this.service.presentToast(
          'Error occurred, Please check your internet connection!'
        )
      )
      .finally(() => {
        this.inProgress = false;
        setTimeout(() => window.location.reload(), 3000);
      });
  }

  go() {
    if (!this.auth.userData) {
      this.service.go('/register');
      return;
    }
    this.presentAlert();
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Signout required before you can continue',
      buttons: [
        {
          text: 'Signout',
          handler: () => {
            this.auth.signOut().then(() => this.service.go('/register'));
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }
}
