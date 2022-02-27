import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { About, Pages, Product, Profile, Unit } from 'atlas-core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AppService {
  isDesktop = false;
  private loading;
  
  items: Product[] = [];
  private profile: Profile = new Profile();
  private pages: Pages = new Pages();

  // custom events
  private modal = new BehaviorSubject<string>('');
  modalCloseEvent = this.modal.asObservable();
  private cart = new BehaviorSubject<string>('');
  cartUpdatedEvent = this.cart.asObservable();

  constructor(private router: Router, private location: Location, public toastController: ToastController, private loadingController: LoadingController) {
    if (window.innerWidth > 1000) {
      this.isDesktop = true;
    }
    this.init();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Please wait...',
    });
    await this.loading.present();
  }

  async dismissLoading(){
    this.loading.dismiss();
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

  private init() {
    if (true) {
      this.getProfile_Maharaja();
    } else {
      this.getProfile_MohanChem();
    }

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

  private getProfile_Maharaja() {
    this.profile.title = 'Maharaja Architects Pvt. Ltd.';
    this.profile.background = 'assets/images/profile/arch-1.jpg';
    this.profile.caption = 'Providing    innovative  designs!';
    this.profile.icon = 'assets/images/profile/logo.jpg';

    const about = new About();
    about.paragraph.push(
      'Maharaja Architects Pvt. Ltd. is specializing in rendering services for repairs & restoration of civil structures. In the relatively short span of time, we have carried out quality jobs using a systematic & scientific approach and applying a professional attitude to largely unorganized sector. From 1998 till now, we also worked in the name of “R. M. Patidar & Associates” as Repair board Architect.'
    );
    about.paragraph.push(
      'We take this opportunity to introduce ourselves as Civil and Structural Consultants Specialized in “New Construction” and Building “Repairs & Restorations” , who assist the client on all aspect of services carrying out their project in the most smooth and economical way.'
    );
    about.paragraph.push(
      'The company has a Team of Structural Design Engineer- Architect, Project Managers, Executive Engineers – supervisors, Structural Auditor, Valuer and Marketing Team, who have got vast experience in Consulting & Executing services for New Construction and Building Repairs and Rehabilitation Projects.'
    );
    this.pages.about.push(about);
  }

  private getProfile_MohanChem() {
    this.profile.title = 'Mohan Chemicals Pvt. Ltd.';
    this.profile.background = 'assets/images/profile/mc/background.jpg';
    this.profile.caption = 'Building    Trust   since        1998!';
    this.profile.icon = 'assets/images/profile/mc/mc-logo.png';

    const about = new About();
    about.paragraph.push(
      'We, Mohan Chemical, were incorporated in the year 1965, as Manufacturer, Supplier, Trader and Retailer of a diverse range of Organic and Inorganic Chemicals . The range involves Industrial Chemicals, Waterproofing Chemicals and Construction Chemicals. Our Chemicals are considered one of the best that is available in the market. These products provided by us are appreciated in the market for their long shelf life, balanced pH, accurate composition and high effectiveness. In addition, our ethical work practices have helped us to achieve a huge client base spreading all over the world. We also provide Laboratory Products required for Schools and Colleges.'
    );
    about.paragraph.push(
      'The highly developed state-of-the-art infrastructure is known to be one of the finest in the nation. The facility is laced with modernized technology and advanced machinery. For the purpose of achieving smooth operations, we have divided our infrastructure into several units. The units guided by qualified and expert professionals work effectively and efficiently, in order to achieve several organizational objectives. All the products we provide in the market are further sent for a number of quality checks, for final assurance.'
    );
    this.pages.about.push(about);
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
