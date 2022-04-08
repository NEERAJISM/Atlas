import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AlertController,
  ModalController
} from '@ionic/angular';
import {
  Address,
  AuthService,
  Cart,
  CartItem,
  Client,
  CommonUtil,
  Constants,
  FirebaseUtil,
  Item,
  Order,
  OrderStatus,
  Product,
  Profile,
  Status,
  Unit
} from 'atlas-core';
import * as firebase from 'firebase';
import { v4 as uuidv4 } from 'uuid';
import { AppService } from '../app.service';

@Component({
  selector: 'app-account',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  icon = '';
  profile: Profile = new Profile();
  client = new Client();

  items: Map<string, Product> = new Map();
  units: Map<string, Unit> = new Map();
  imgMap: Map<string, string> = new Map();

  cartItems: CartItem[] = [];

  edit_address = false;
  shippingAddressSame = true;
  shippingAddress: Address = new Address();
  billingAddress: Address = new Address();

  total = 0;
  isDesktop = false;

  bizId = '';

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    public service: AppService,
    private authService: AuthService,
    private location: Location,
    private fbUtil: FirebaseUtil,
    private commonUtil: CommonUtil
  ) {
    this.isDesktop = service.isDesktop;
    this.service.presentLoading();
    this.init();
  }

  init() {
    var profileName = this.location.path().substring(1).split('/')[0];
    this.fbUtil
      .getInstance()
      .collection(Constants.PROFILE)
      .doc(profileName)
      .get()
      .subscribe((doc) => {
        if (!doc.exists) {
          this.service.presentToast('No Profile found for - ' + profileName);
          this.service.go('');
          return;
        }
        this.bizId = (doc.data() as any).id;
        this.getProfile();
        this.getItems();
        this.initUser();
      });
  }

  getProfile() {
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
      });
  }

  getItems() {
    this.fbUtil
      .getProductRef(this.bizId)
      .get()
      .forEach((res) =>
        res.forEach((data) => {
          if (data.data()) {
            const p = new Product();
            Object.assign(p, data.data());
            this.items.set(p.id, p);
            this.downloadProductImage(p.id);
          }
        })
      ).then(() => {
        this.service.dismissLoading();
      });
  }

  downloadProductImage(id) {
    this.fbUtil.downloadImage(Constants.PRODUCT + '/' + this.bizId + '/' + id + '/1.png')
      .subscribe((url) => {
        this.imgMap.set(id, url);
      });
  }

  initUser() {
    this.authService.getUserId().subscribe((user) => {
      if (!user) {
        this.home();
      } else {
        this.client.id = user.uid;
        this.client.address.mobile = user.phoneNumber;
        this.shippingAddress = this.client.address;
        this.initForUser();
      }
    });
  }

  async presentToast() {
    this.service.presentToast('Your order has been placed succesfully.');
  }

  async presentAlert() {
    if (!this.isValidAddress()) {
      this.service.presentToast('Please enter valid address details!')
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Please confirm your order.',
      buttons: [
        {
          text: 'Confirm',
          handler: () => {
            this.placeOrder();
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

  isValidAddress() {
    return (
      this.shippingAddress.name &&
      this.shippingAddress.mobile &&
      this.shippingAddress.mobile.length > 9 &&
      this.shippingAddress.line1 &&
      this.shippingAddress.pin &&
      this.shippingAddress.pin.toString().length > 5 &&
      this.shippingAddress.district &&
      this.shippingAddress.state &&
      (this.shippingAddressSame ||
        (this.billingAddress.name &&
          this.billingAddress.mobile &&
          this.billingAddress.mobile.length > 9 &&
          this.billingAddress.line1 &&
          this.billingAddress.pin &&
          this.billingAddress.pin.toString().length > 5 &&
          this.billingAddress.district &&
          this.billingAddress.state))
    );
  }

  ngOnInit(): void {
    this.service.modalCloseEvent.subscribe((s) => {
      if (s === 'close') {
        this.modalController.dismiss();
      } else if (s === 'back') {
        this.location.back();
      }
    });
  }

  ngOnDestroy(): void {
    this.modalController.dismiss();
  }

  home() {
    this.service.go('');
  }

  back() {
    this.service.goBack();
  }

  initForUser() {
    this.fbUtil
      .getInstance()
      .collection(Constants.USER + '/' + this.client.id + '/' + Constants.CART)
      .doc(this.bizId)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          var cart = new Cart();
          Object.assign(cart, doc.data());
          this.mapUnits(cart.items);
        }
      });

    this.fbUtil
      .getInstance()
      .collection(Constants.USER)
      .doc(this.client.id)
      .get()
      .subscribe(doc => {
        if (doc.exists) {
          Object.assign(this.client, doc.data());
          Object.assign(this.shippingAddress, this.client.address);
        }
      });
  }

  mapUnits(items: CartItem[]) {
    items.forEach((item) => {
      var unit = this.items.get(item.itemId).units.find((unit) => item.unit === unit.unit);

      if (!unit) {
        return;
      }
      this.cartItems.push(item);
      this.units.set(item.itemId + '-' + item.unit, unit);
    });

    if (this.cartItems.length < items.length) {
      this.syncCart();
    } else {
      this.calcTotal();
    }
  }

  getDate(epoch: number) {
    return this.commonUtil.getFormattedDate(new Date(epoch));
  }

  removeFromCart(i: number) {
    this.cartItems.splice(i, 1);
    this.syncCart();
  }

  syncCart() {
    this.calcTotal();
    var cart = new Cart();
    cart.items = this.cartItems;
    this.fbUtil
      .getInstance()
      .collection(Constants.USER + '/' + this.client.id + '/' + Constants.CART)
      .doc(this.bizId)
      .set(this.fbUtil.toJson(cart))
      .finally(() => this.service.cartUpdated(''));
  }

  editAddress() {
    this.edit_address = true;
  }

  saveAddress() {
    this.edit_address = false;
  }

  checkbox() {
    this.billingAddress = { ...this.shippingAddress };
  }

  calcTotal() {
    this.total = 0;
    this.cartItems.forEach((item) => {
      this.total +=
        this.units.get(item.itemId + '-' + item.unit).price * item.qty;
    });
  }

  updateItem(i: number, add: boolean) {
    add ? this.cartItems[i].qty++ : this.cartItems[i].qty--;
    if (this.cartItems[i].qty < 1) {
      this.removeFromCart(i);
      return;
    }
    this.syncCart();
  }

  placeOrder() {
    // TODO Show referenece number / send email to customer
    this.service.presentLoading();

    const order: Order = new Order();
    order.id = this.fbUtil.getId();
    order.vId = uuidv4();
    order.createdTimeUTC = Date.now();

    order.client = this.client;
    order.shippingAddress = this.shippingAddress;
    order.billingAddress = this.shippingAddressSame
      ? this.shippingAddress
      : this.billingAddress;

    order.bizId = this.bizId;

    const status: OrderStatus = new OrderStatus();
    status.status = Status.New;
    status.time = Date.now();
    order.status.push(status);

    let totalV = 0;
    let totalTaxV = 0;
    // cart items
    this.cartItems.forEach((item) => {
      const i = new Item();

      var itemRef = this.items.get(item.itemId);
      i.id = itemRef.id;
      i.name = itemRef.name;
      i.qty = item.qty;
      i.price = this.units.get(i.id + '-' + item.unit).price;
      i.unit = item.unit;

      // TODO update discount & tax
      i.tax = '0';
      i.taxValue = 0;
      i.total = i.price * i.qty + i.taxValue;

      totalV += i.total;
      totalTaxV += i.taxValue;
      order.items.push(i);
    });

    order.total = totalV;
    order.totalTaxableValue = totalTaxV;

    const doc = this.fbUtil.toJson(order);

    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + order.bizId + '/' + Constants.ORDERS
      )
      .doc(order.id)
      .set(doc)
      .then(() =>
        this.fbUtil
          .getInstance()
          .collection(
            Constants.USER + '/' + order.client.id + '/' + Constants.ORDERS
          )
          .doc(order.id)
          .set(doc)
      )
      .then(() => {
        this.presentToast();
        this.cartItems = [];
        this.syncCart();
        this.updateClient();
        this.updateOrderStats(order.total);
        this.service.go('/account');
      })
      .catch(() => this.service.presentToast('Error occurred, Please check Internet connectivity'))
      .finally(() => this.service.dismissLoading());
  }

  updateOrderStats(total){
    var date = new Date().toLocaleDateString().split('/').reverse().join('');
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.bizId + '/' + Constants.STATS)
      .doc(date)
      .set({
        date: Number(date),
        orders: firebase.default.firestore.FieldValue.increment(1), 
        revenue: firebase.default.firestore.FieldValue.increment(total) 
      }, { merge: true });
  }

  account() {
    this.service.go('/account');
  }

  updateClient() {
    this.client.address = this.shippingAddressSame ? this.shippingAddress : this.billingAddress;
    this.fbUtil
      .getInstance()
      .collection(Constants.USER)
      .doc(this.client.id)
      .set(this.fbUtil.toJson(this.client), { merge: true });
  }
}
