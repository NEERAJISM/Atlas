import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, ToastController } from '@ionic/angular';
import {
  Address,
  AuthService,
  Business,
  Client,
  CommonUtil,
  Constants,
  FirebaseUtil,
  Item,
  Order,
  OrderStatus,
  Pages,
  Product,
  Profile,
  Status,
  Unit
} from 'atlas-core';
import firebase from 'firebase/app';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { ProfileService } from './profile.service';

class CartItem {
  name = '';
  qty = 1;
  unit = '';
  price = 0;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
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
  url = 'https://material.angular.io/assets/img/examples/shiba2.jpg';


  // slider config

  sliderConfig = {
    spaceBetween: 10,
    centeredSlides: true,
    slidesPerView: 1,
    autoplay:true,
    loop:true
  };

  landingFont = "70px";
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

  profile: Profile;
  pages: Pages;

  constructor(
    private location: Location,
    private router: Router,
    private _formBuilder: FormBuilder,
    private auth: AuthService,
    private commonUtil: CommonUtil,
    private fbUtil: FirebaseUtil,
    public toastController: ToastController,
    private service: ProfileService
  ) {

    if(window.innerWidth > 1000) {
      this.sliderConfig.slidesPerView = 1.8;
      this.landingFont = "120px";
      this.isDesktop = true;
    }

    this.init();
    this.profile = this.service.getProfile();
    this.pages = this.service.getPages();
    
  }

  routeToOrder(){
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
    const toast = await this.toastController.create({
      message: "Thanks. Your query has been registerd. we'll reachout to you.",
      duration: 2000,
      position: this.isDesktop ? 'top' : 'bottom'
    });
    toast.present();
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

  init() {
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
    console.log('Loaded ' + this.orders.length + ' orders');
  }

  // home() {
  //   document.documentElement.scrollTop = 0;
  //   this.isOrderSection = false;
  //   this.isCheckoutSection = false;
  //   this.isAccountSection = false;
  // }

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

  itemsNext() {
    this.setFocus('mobile');
    this.code = '';
    this.otpRequested = false;
    this.otpSuccess = false;
  }

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
        this.commonUtil.showSnackBar('Verification OTP sent successfully.');
      })
      .catch((error) => {
        this.otpRequested = false;
        this.commonUtil.showSnackBar(
          'Unable to send verification OTP. Please check you Internet.'
        );
      });
  }

  verify(stepper?) {
    this.verification = true;
    this.confirmationResult
      .confirm(this.code)
      .then((result) => {
        this.commonUtil.showSnackBar('User verified successfully!!');
        this.userData = result.user;
        // next
        if (stepper) {
          stepper.next();
        }
        this.setFocus('customer-name');
      })
      .catch((error) => {
        this.commonUtil.showSnackBar(
          'Incorrect OTP. Please check verification SMS.'
        );
      })
      .finally(() => {
        this.verification = false;
      });
  }

  verifyBack() {
    this.otpRequested = false;
  }

  customerBack() {
    this.code = '';
    this.otpRequested = false;
    this.otpSuccess = false;
  }

  customerNextStep() {
    this.customerNext = true;
    this.setFocus('address-1');
  }

  addressNextStep() {
    this.addressNext = true;
    this.setFocus('place-order-back');
  }

  addressBackStep() {
    this.customerNext = false;
    this.addressNext = false;
  }

  placeOrderBackStep() {
    this.addressNext = false;
  }

  placeOrder() {
    // TODO Show referenece number / send email to customer

    // create or get user - based on mobile no verification

    const order: Order = new Order();
    order.id = this.fbUtil.getId();
    order.vId = uuidv4();
    order.createdTimeUTC = Date.now();

    order.client = this.client;
    order.client.userId = this.userData.uid;
    order.shippingAddress = this.pickup
      ? new Address()
      : this.shippingAddressSame
      ? this.client.address
      : this.shippingAddress;

    order.bizId = this.bizInfo.id;
    order.bizName = 'Lakecity Waters';
    order.bizMob = '+91 - 8877073059';

    const status: OrderStatus = new OrderStatus();
    status.status = Status.New;
    status.time = Date.now();
    order.status.push(status);

    let totalV = 0;
    let totalTaxV = 0;
    // cart items
    this.cartMap.forEach((item) => {
      const i = new Item();

      // TODO
      i.id = '';

      i.name = item.name;
      i.qty = item.qty;
      i.price = item.price;
      i.unit = item.unit;

      // discount & tax
      i.tax = '0';
      i.taxValue = this.commonUtil.getTax(i.price, 0);
      i.total = i.price + i.taxValue;

      totalV += i.total;
      totalTaxV += i.taxValue;
      order.items.push(i);
    });

    order.total = totalV;
    order.totalTaxableValue = totalTaxV;

    const doc = this.fbUtil.toJson(order);

    this.orderRequested = true;
    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + order.bizId + '/' + Constants.ORDERS
      )
      .doc(order.id)
      .set(doc)
      .catch(() =>
        this.commonUtil.showSnackBar(
          'Error occurred, Please check Internet connectivity'
        )
      )
      .then(() =>
        this.fbUtil
          .getInstance()
          .collection(
            Constants.USER + '/' + order.client.userId + '/' + Constants.ORDERS
          )
          .doc(order.id)
          .set(doc)
      )
      .finally(() => {
        this.orderRequested = false;
        window.alert('Order Placed successfuly!!! - ' + uuidv4());
        this.account();
        // TODO replace by resetting all
        location.reload();
      });
  }

  getDate(epoch: number) {
    return this.commonUtil.getFormattedDate(new Date(epoch));
  }

  clearCart() {}

  checkboxClick() {
    // still has previous value
    if (this.shippingAddressSame) {
      this.addressNext = false;
    }
  }

  setFocus(id: string) {
    // const targetElem = document.getElementById(id);
    // setTimeout(function waitTargetElem() {
    //   if (document.body.contains(targetElem)) {
    //     targetElem.focus();
    //   } else {
    //     setTimeout(waitTargetElem, 100);
    //   }
    // }, 100);
  }

  

  increaseOrderLimit() {
    this.limit += 3;
    this.loadOrders();
  }

  deliveryMode(e) {
    if (e.value === 'delivery') {
      this.pickup = false;
    } else {
      this.pickup = true;
    }
  }
}
