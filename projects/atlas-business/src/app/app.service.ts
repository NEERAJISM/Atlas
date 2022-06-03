import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Constants, FirebaseUtil, Page, Profile } from 'atlas-core';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class AppService {
  isDesktop = false;
  private loading;
  
  private profile: Profile = new Profile();
  private pages: Page[] = [];

  // custom events
  private modal = new BehaviorSubject<string>('');
  modalCloseEvent = this.modal.asObservable();
  private modalProfile = new BehaviorSubject<string>('');
  modalProfileCloseEvent = this.modalProfile.asObservable();
  private modalPdf = new BehaviorSubject<string>('');
  modalPdfCloseEvent = this.modalPdf.asObservable();
  private cart = new BehaviorSubject<string>('');
  cartUpdatedEvent = this.cart.asObservable();

  constructor(private router: Router, private location: Location, private toastController: ToastController, private loadingController: LoadingController, private fbUtil: FirebaseUtil) {
    if (window.innerWidth > 1000) {
      this.isDesktop = true;
    }
  }

  closeModal(s: string) {
    this.modal.next(s);
  }

  closeModalProfile(s: string) {
    this.modalProfile.next(s);
  }

  closeModalPdf(s: string) {
    this.modalPdf.next(s);
  }

  cartUpdated(s: string) {
    this.cart.next(s);
  }

  async presentToast(message: string, bottom?: boolean) {
    const toast = await this.toastController.create({
      position: bottom ? 'bottom' : this.isDesktop ? 'top' : 'bottom',
      message: message,
      duration: 3000,
    });
    toast.present();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await this.loading.present();
  }

  async dismissLoading(){
    var dismissed = false;
    if(this.loading) {
      dismissed = await this.loading.dismiss();
    }
    if(!dismissed) {
      setTimeout(()=> this.dismissLoading(), 500)
    }
  }

  go(url: string, login?: boolean) {
    this.router.navigateByUrl(url, { replaceUrl: login });
  }

  goBack() {
    this.location.back();
  }

  public getProfile() {
    return this.profile;
  }

  public getPages() {
    return this.pages;
  }

  updateProfile(id: string, profile: string, backup?: string) {
    // delete previous
    if (backup) {
      this.fbUtil
        .getInstance()
        .collection(Constants.PROFILE)
        .doc(backup)
        .delete();
    }

    var keywords = [];
    if (profile.indexOf('-') !== -1) {
      keywords.push(profile);
      keywords.push(...profile.split('-'));
      keywords.push(profile.split('-').join(''));
    } else {
      for (let i = 6; i <= profile.length; i++) {
        keywords.push(profile.substring(0, i));
      }
    }

    this.fbUtil
      .getInstance()
      .collection(Constants.PROFILE)
      .doc(profile)
      .set({ id: id, keywords: keywords })
      .catch(() =>
        this.presentToast(
          'Error occurred, Please check Internet connectivity'
        )
      );
  }
}
