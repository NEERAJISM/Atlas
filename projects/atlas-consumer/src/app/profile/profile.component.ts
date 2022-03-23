import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import {
  Address,
  AuthService,
  Business,
  Client,
  CommonUtil,
  Constants,
  FirebaseUtil,
  Order,
  Page,
  Product,
  Profile,
  Slides,
  Team,
  Type,
  Unit,
  Video,
} from 'atlas-core';
import firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';

class CartItem {
  name = '';
  qty = 1;
  unit = '';
  price = 0;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('home') home: any;
  @ViewChild('about') about: any;
  @ViewChild('services') services: any;
  @ViewChild('projects') projects: any;
  @ViewChild('team') team: any;
  @ViewChild('footer') footer: any;

  isAccountSection = false;
  isOrderSection = false;
  isCheckoutSection = false;

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;

  customerNext = false;
  addressNext = false;

  states = Constants.states;

  items: Product[] = [];

  cartMap: Map<number, CartItem> = new Map();
  orderRequested = false;

  // Business
  bizInfo: Business;

  // Client form
  client = new Client();
  pickup = true;
  shippingAddressSame = true;
  shippingAddress: Address = new Address();
  isVerified = false;

  // verification
  code: string;
  otpRequested = false;
  otpSuccess = false;
  verification = false;
  confirmationResult: firebase.auth.ConfirmationResult;
  recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  userData: firebase.User;

  // Account Details
  orders: Order[] = [];
  orderSubscription: Subscription;
  limit = 3;
  url = 'assets/images/profile/white.jpg';
  icon = '';

  // slider config

  sliderConfig = {
    spaceBetween: 5,
    centeredSlides: false,
    slidesPerView: 3,
    autoplay: true,
  };

  sliderConfigTeam = {
    spaceBetween: 5,
    centeredSlides: false,
    slidesPerView: 4,
    autoplay: true,
  };

  landingFont = '70px';
  isDesktop = false;

  // **** Assets for Custom web  *****

  service1 = 'assets/images/profile/service-1.jpg';
  service2 = 'assets/images/profile/service-2.jpg';
  service3 = 'assets/images/profile/service-3.jpg';

  project1 = 'assets/images/profile/project-1.jpg';
  project2 = 'assets/images/profile/project-2.jpg';
  project3 = 'assets/images/profile/project-3.jpg';

  rameshji = 'assets/images/profile/rameshji.jpg';
  aashika = 'assets/images/profile/aashika.jpg';
  deepikaji = 'assets/images/profile/deepikaji.jpg';
  chirag = 'assets/images/profile/chirag.jpg';
  logo = 'assets/images/profile/logo.jpg';

  // **************
  business: Business = new Business();
  profile: Profile = new Profile();
  pagesMap: Map<string, Page> = new Map();
  pages = [];

  bizId = 'bA3Y7HgRrbNGfgisuXCKTtSeYLk2';

  imgMap: Map<string, string> = new Map();
  complete = false;

  ytbUrl: Map<string, SafeResourceUrl> = new Map();
  locationSrc: any;

  constructor(
    private location: Location,
    private router: Router,
    private _formBuilder: FormBuilder,
    private auth: AuthService,
    private fbUtil: FirebaseUtil,
    private appService: AppService,
    private util: CommonUtil,
    private sanitizer: DomSanitizer
  ) {
    if (window.innerWidth > 1000) {
      this.landingFont = '120px';
      this.isDesktop = true;
    }

    this.init2();
    this.getBusiness();
    this.getProfile();
    this.updateLocationUrl();
  }

  getBusiness(){
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.bizId + '/' + Constants.INFO)
      .doc(this.bizId)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          Object.assign(this.business, doc.data());
          this.updateLocation();
        }
      });
  }

  updateLocation() {
    if (this.business.address.location && this.business.address.location.includes('src=')) {
      var tags = this.business.address.location.split(' ');
      tags.filter(tag => tag.startsWith('src=')).find(src => this.updateLocationUrl(src.slice(5, src.length - 1)));
    } else {
      this.updateLocationUrl();
    }
  }

  updateLocationUrl(url?: string): void {
    this.locationSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      url ? url : 'https://www.google.com/maps/embed'
    );
  }

  getProfile() {
    this.fbUtil
      .downloadImage(Constants.PROFILE + '/' + this.bizId + '/home')
      .subscribe((url) => {
        this.url = url;
      });

    this.fbUtil
      .downloadImage(Constants.PROFILE + '/' + this.bizId + '/icon')
      .subscribe((url) => {
        this.icon = url;
      });

    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + this.bizId + '/' + Constants.PROFILE
      )
      .doc(this.bizId)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          Object.assign(this.profile, doc.data());
        }
        this.getPages();
      });
  }

  getPages() {
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.bizId + '/' + Constants.PAGES)
      .get()
      .forEach((doc) => {
        doc.docs.forEach((i) => {
          if (i.data()) {
            var page = this.util.getPage((i.data() as Page).type);
            this.pagesMap.set(
              (i.data() as Page).id,
              Object.assign(page, i.data())
            );

            if (page.type === Type.Video) {
              this.ytbUrl.set(page.id, this.urlUpdate((page as Video).url));
            }
          }
        });

        // sort
        this.profile.pages.forEach((id) => {
          this.pages.push(this.pagesMap.get(id));
        });

        this.downloadImages();
      });
  }

  urlUpdate(url: string): SafeResourceUrl {
    var match = url.match(Constants.ytbRegEx);
    if (match && match.length > 1 && match[1].length == 11) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://www.youtube-nocookie.com/embed/' + match[1]
      );
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube-nocookie.com/embed/'
    );
  }

  downloadImages() {
    var counter = 0;
    this.pagesMap.forEach((v, k) => {
      if (v.type === Type.Full || v.type === Type.Info) {
        counter++;
        this.fbUtil
          .downloadImage(Constants.PAGES + '/' + this.profile.id + '/' + k)
          .subscribe((url) => {
            this.imgMap.set(k, url);

            if (this.imgMap.size == counter) {
              this.complete = true;
            }
          });
      } else if (v.type === Type.Slides) {
        (v as Slides).slides.forEach((slide) => {
          counter++;
          this.fbUtil
            .downloadImage(
              Constants.PAGES + '/' + this.profile.id + '/' + k + '/' + slide.id
            )
            .subscribe((url) => {
              this.imgMap.set(slide.id, url);

              if (this.imgMap.size == counter) {
                this.complete = true;
              }
            });
        });
      } else if (v.type === Type.Team) {
        (v as Team).members.forEach((member) => {
          counter++;
          this.fbUtil
            .downloadImage(
              Constants.PAGES + '/' + this.profile.id + '/' + k + '/' + member.id
            )
            .subscribe((url) => {
              this.imgMap.set(member.id, url);

              if (this.imgMap.size == counter) {
                this.complete = true;
              }
            });
        });
      }
    });
  }

  routeToOrder() {
    this.router.navigateByUrl('/order');
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

  async presentToast() {
    this.appService.presentToast(
      "Thanks. Your query has been registerd. we'll reachout to you."
    );
  }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.orderSubscription.unsubscribe();
  }

  init2() {
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
    product1.units.push(unit1);
    product1.units.push(unit2);
    product1.units.push(unit3);
    product1.photoUrl.push('assets/images/profile/food1.jpg');

    const product2 = new Product();
    product2.name = 'French Toast';
    product2.units.push(unit1);
    product2.units.push(unit2);
    product2.units.push(unit3);
    product2.photoUrl.push('assets/images/profile/food2.jpg');

    const product3 = new Product();
    product3.name = 'Yoghurt';
    product3.units.push(unit1);
    product3.units.push(unit2);
    product3.units.push(unit3);
    product3.photoUrl.push('assets/images/profile/food3.jpg');

    const product4 = new Product();
    product4.name = 'Pancake';
    product4.units.push(unit1);
    product4.units.push(unit2);
    product4.units.push(unit3);
    product4.photoUrl.push('assets/images/profile/food4.jpg');

    this.items.push(product1);
    this.items.push(product2);
    this.items.push(product3);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);

    this.loadUserData();
  }

  // Load orders
  loadUserData() {
    // user data

    // orders
    this.orderSubscription = this.fbUtil
      .getInstance()
      .collection(
        Constants.USER +
          '/' +
          'my7dwdbkikdLXrKvZDtYSV3ugfP2' +
          '/' +
          Constants.ORDERS
      )
      .valueChanges()
      .subscribe(() => this.loadOrders());
  }

  loadOrders() {
    const result: Order[] = [];
    this.fbUtil
      .getInstance()
      .collection(
        Constants.USER +
          '/' +
          'my7dwdbkikdLXrKvZDtYSV3ugfP2' +
          '/' +
          Constants.ORDERS,
        (ref) => ref.orderBy('createdTimeUTC', 'desc').limit(this.limit)
      )
      .get()
      .forEach((res) =>
        res.forEach((data) => {
          const o = new Order();
          if (data.data()) {
            Object.assign(o, data.data());
            result.push(o);
          }
        })
      )
      .finally(() => this.updateOrders(result));
  }

  updateOrders(result: Order[]) {
    this.orders = result;
  }

  order() {
    this.location.replaceState('profile#products');
    document.documentElement.scrollTop = 0;
    this.isOrderSection = true;
    this.isAccountSection = false;
    this.isCheckoutSection = false;
  }

  account() {
    this.location.replaceState('profile#account');
    document.documentElement.scrollTop = 0;
    this.isOrderSection = false;
    this.isCheckoutSection = false;
    this.isAccountSection = true;
  }

  checkout() {
    if (!this.isOrderSection) {
      this.order();
    }
    document.documentElement.scrollTop = 0;
    this.isCheckoutSection = true;
  }

  goBackToOrderSection() {
    this.isCheckoutSection = false;
    this.customerNext = false;
    this.addressNext = false;
  }

  addToCart(i: number) {
    if (this.cartMap.has(i)) {
      this.cartMap.get(i).qty++;

      this.items[i].units.forEach((unit) => {
        if (unit.unit === this.cartMap.get(i).unit) {
          this.cartMap.get(i).price = this.cartMap.get(i).qty * unit.price;
        }
      });
    } else {
      const item = new CartItem();
      item.name = this.items[i].name;
      item.unit = this.items[i].units[0].unit;
      item.price = this.items[i].units[0].price;
      this.cartMap.set(i, item);
    }
  }

  removeFromCart(i: number) {
    this.cartMap.get(i).qty--;
    if (this.cartMap.get(i).qty === 0) {
      this.cartMap.delete(i);

      if (this.cartMap.size === 0) {
        this.isCheckoutSection = false;
      }
    } else {
      this.items[i].units.forEach((unit) => {
        if (unit.unit === this.cartMap.get(i).unit) {
          this.cartMap.get(i).price = this.cartMap.get(i).qty * unit.price;
        }
      });
    }
  }

  unitChange(i: number, value: string) {
    this.items[i].units.forEach((unit) => {
      if (unit.unit === value) {
        this.cartMap.get(i).price = this.cartMap.get(i).qty * unit.price;
      }
    });
  }

  itemsNext() {}

  getOtp() {
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = this.auth.getRecaptcha('recaptcha-container');
    }
    this.otpRequested = true;
    this.auth
      .verifyUserMobile(this.client.mobile, this.recaptchaVerifier)
      .then((confirmationResult) => {
        this.otpSuccess = true;
        this.confirmationResult = confirmationResult;
        this.appService.presentToast('Verification OTP sent successfully.');
      })
      .catch((error) => {
        this.otpRequested = false;
        this.appService.presentToast(
          'Unable to send verification OTP. Please check you Internet.'
        );
      });
  }

  deliveryMode(e) {
    if (e.value === 'delivery') {
      this.pickup = false;
    } else {
      this.pickup = true;
    }
  }
}
