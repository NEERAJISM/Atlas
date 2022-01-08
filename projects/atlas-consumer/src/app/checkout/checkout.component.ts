import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AlertController,
  ModalController,
  ToastController,
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
  Unit,
} from 'atlas-core';
import { v4 as uuidv4 } from 'uuid';
import { AppService } from '../app.service';
import { ModalPage } from '../oms/modal/modal.page';

@Component({
  selector: 'app-account',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  profile: Profile;
  client = new Client();

  items: Map<string, Product> = new Map();
  units: Map<string, Unit> = new Map();

  cartItems: CartItem[] = [];
  orderRequested = false;

  edit_address = false;
  shippingAddressSame = true;
  shippingAddress: Address = new Address();
  billingAddress: Address = new Address();

  total = 0;
  isDesktop = false;

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    public toastController: ToastController,
    private service: AppService,
    private authService: AuthService,
    private location: Location,
    private fbUtil: FirebaseUtil,
    private commonUtil: CommonUtil
  ) {
    if (window.innerWidth > 1000) {
      this.isDesktop = true;
    }
    this.getClient();
    this.profile = this.service.getProfile();
    this.mapItems(this.service.getItems());

    this.authService.getUserId().subscribe((user) => {
      if (!user) {
        setTimeout(() => this.presentModal(), 700);
      } else {
        this.client.id = user.uid;
        this.initForUser();
      }
    });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      position: this.isDesktop ? 'top' : 'bottom',
      message: 'Your order has been placed succesfully.',
      duration: 3000,
    });
    toast.present();
  }

  async presentAlert() {
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

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPage,
      backdropDismiss: false,
    });
    return await modal.present();
  }

  getClient() {
    this.shippingAddress.name = 'Neeraj Patidar';
    this.shippingAddress.mobile = '8877073059';
    this.shippingAddress.email = 'abc@gmail.com';
    this.shippingAddress.line1 =
      'c/o Balkrishna Patidar, Patidar basti, Gamda Brahmaniya';
    this.shippingAddress.line2 = 'Sagwara';
    this.shippingAddress.district = 'Dungarpur';
    this.shippingAddress.state = 'Rajasthan';
    this.shippingAddress.pin = 314025;
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
      .doc('bizId')
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          var cart = new Cart();
          Object.assign(cart, doc.data());
          this.cartItems = cart.items;
          this.mapUnits();
          this.calcTotal();
        }
      });
  }

  mapItems(allItems: Product[]) {
    allItems.forEach((product) => {
      this.items.set(product.id, product);
    });
  }

  mapUnits() {
    this.cartItems.forEach((item) => {
      this.units.set(
        item.itemId + '-' + item.unit,
        this.items
          .get(item.itemId)
          .units.find((unit) => item.unit === unit.unit)
      );
    });
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
    const doc = this.fbUtil.toJson(cart);
    this.fbUtil
      .getInstance()
      .collection(Constants.USER + '/' + this.client.id + '/' + Constants.CART)
      .doc('bizId')
      .set(doc);
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

    // create or get user - based on mobile no verification

    const order: Order = new Order();
    order.id = this.fbUtil.getId();
    order.vId = uuidv4();
    order.createdTimeUTC = Date.now();

    order.client = this.client;
    order.shippingAddress = this.shippingAddress;
    order.billingAddress = this.shippingAddressSame
      ? this.shippingAddress
      : this.billingAddress;

    order.bizId = 'bizId';
    order.bizName = 'Lakecity Waters';
    order.bizMob = '+91 - 8877073059';

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

      // discount & tax
      i.tax = '0';
      i.taxValue = 0;
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
        this.service.go('/account');
      })
      .catch(() =>
        this.commonUtil.showSnackBar(
          'Error occurred, Please check Internet connectivity'
        )
      )
      .finally(() => {
        this.orderRequested = false;
      });
  }
}
