import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { About, Pages, Product, Profile, Unit } from 'atlas-core';
import { BehaviorSubject } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';


@Injectable()
export class AppService {
  isDesktop = false;
  loading;
  
  items: Product[] = [];
  private profile: Profile = new Profile();
  private pages: Pages = new Pages();

  // custom events
  private modal = new BehaviorSubject<string>('');
  modalCloseEvent = this.modal.asObservable();
  private modalProfile = new BehaviorSubject<string>('');
  modalProfileCloseEvent = this.modalProfile.asObservable();
  private cart = new BehaviorSubject<string>('');
  cartUpdatedEvent = this.cart.asObservable();

  closeModal(s: string) {
    this.modal.next(s);
  }

  closeModalProfile(s: string) {
    this.modalProfile.next(s);
  }

  cartUpdated(s: string) {
    this.cart.next(s);
  }

  constructor(private router: Router, private location: Location, public toastController: ToastController, public loadingController: LoadingController) {
    if (window.innerWidth > 1000) {
      this.isDesktop = true;
    }
    this.init();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      position: this.isDesktop ? 'top' : 'bottom',
      message: message,
      duration: 3000,
    });
    toast.present();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Please wait...',
      duration: 2000
    });
    await this.loading.present();
  }

  async dismissLoading(){
    this.loading.dismiss();
  }

  go(url: string) {
    this.router.navigateByUrl(url);
  }

  goBack() {
    this.location.back();
  }

  private init() {

    this.initItems();
  }

  public getItems() {
    return this.items;
  }

  public getProfile() {
    return this.profile;
  }

  public getPages() {
    return this.pages;
  }

  private initItems() {
    const unit1 = new Unit();
    unit1.unit = '500 gm';
    unit1.price = 500;

    const unit2 = new Unit();
    unit2.unit = '1 kg';
    unit2.price = 1000;

    const unit3 = new Unit();
    unit3.unit = '5 kg';
    unit3.price = 2500;

    const product1 = new Product();
    product1.name = 'Veg Pasta';
    product1.id = '1';
    product1.units.push(unit1);
    product1.units.push(unit2);
    product1.units.push(unit3);
    product1.photoUrl.push('assets/images/profile/food1.jpg');

    const product2 = new Product();
    product2.name = 'French Toast';
    product2.id = '2';
    product2.units.push(unit1);
    product2.units.push(unit2);
    product2.units.push(unit3);
    product2.photoUrl.push('assets/images/profile/food2.jpg');

    const product3 = new Product();
    product3.name = 'Yoghurt';
    product3.id = '3';
    product3.units.push(unit1);
    product3.units.push(unit2);
    product3.units.push(unit3);
    product3.photoUrl.push('assets/images/profile/food3.jpg');

    const product4 = new Product();
    product4.name = 'Pancake';
    product4.id = '4';
    product4.units.push(unit1);
    product4.units.push(unit2);
    product4.units.push(unit3);
    product4.photoUrl.push('assets/images/profile/food4.jpg');

    const product5 = new Product();
    product5.name = 'Pancake - Banana';
    product5.id = '5';
    product5.units.push(unit1);
    product5.units.push(unit2);
    product5.units.push(unit3);
    product5.photoUrl.push('assets/images/profile/food4.jpg');

    const product6 = new Product();
    product6.name = 'Yoghurt - Honey';
    product6.id = '6';
    product6.units.push(unit1);
    product6.units.push(unit2);
    product6.units.push(unit3);
    product6.photoUrl.push('assets/images/profile/food3.jpg');

    this.items.push(product1);
    this.items.push(product2);
    this.items.push(product3);
    this.items.push(product4);
    this.items.push(product5);
    this.items.push(product6);
  }
}
