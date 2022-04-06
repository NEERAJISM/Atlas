import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'atlas-core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AppService {
  isDesktop = false;
  private loading;

  // custom events
  private modal = new BehaviorSubject<string>('');
  modalCloseEvent = this.modal.asObservable();
  private cart = new BehaviorSubject<string>('');
  cartUpdatedEvent = this.cart.asObservable();

  constructor(
    private router: Router, 
    private location: Location, 
    private auth : AuthService,
    private toastController: ToastController, 
    private alertController: AlertController,
    private loadingController: LoadingController) {
    if (window.innerWidth > 1000) {
      this.isDesktop = true;
    }
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await this.loading.present();
  }

  async dismissLoading() {
    var dismissed = false;
    if (this.loading) {
      dismissed = await this.loading.dismiss();
    }
    if (!dismissed) {
      setTimeout(() => this.dismissLoading(), 500)
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      position: this.isDesktop ? 'top' : 'bottom',
      message: message,
      duration: 3000,
    });
    toast.present();
  }

  closeModal(s: string) {
    this.modal.next(s);
  }

  cartUpdated(s: string) {
    this.cart.next(s);
  }

  go(url: string) {
    this.router.navigateByUrl(url);
  }

  goBack() {
    this.location.back();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Please confirm if you want to sign out.',
      buttons: [
        {
          text: 'Signout',
          handler: () => {
            this.auth.signOut().then(() => this.go(''));
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
