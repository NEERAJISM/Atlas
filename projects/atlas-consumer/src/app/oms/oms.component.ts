import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import {
  Cart,
  CartItem,
  Constants,
  FirebaseUtil,
  Product,
  Unit
} from 'atlas-core';
import firebase from 'firebase/app';
import { AppService } from '../app.service';
import { ModalPage } from './modal/modal.page';

@Component({
  selector: 'app-oms',
  templateUrl: './oms.component.html',
})
export class OmsComponent implements OnInit, OnDestroy {
  display = true;

  profile_icon = 'assets/images/profile/mc/mc-logo.png';

  items: Product[] = [];

  search: string = '';
  displayMap: Map<number, boolean> = new Map();
  unitDisplayMap: Map<number, number> = new Map();

  cartSize = 0;
  cartMap: Map<string, Map<string, number>> = new Map();

  user: firebase.User;

  constructor(
    private router: Router,
    public modalController: ModalController,
    private service: AppService,
    private location: Location,
    private fbUtil: FirebaseUtil
  ) {
    setTimeout(() => this.presentModal(), 700);
    this.init();
  }

  ngOnInit(): void {
    this.service.modalCloseEvent.subscribe((s) => {
      if (s === 'close') {
        this.modalController.dismiss();
        this.user = this.service.getUser();
        this.initForUser();
      } else if (s === 'back') {
        this.location.back();
      }
    });
  }

  initForUser() {
    this.fbUtil
      .getInstance()
      .collection(Constants.USER + '/' + this.user.uid + '/' + Constants.CART)
      .doc(this.user.uid)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          const cart = new Cart();
          Object.assign(cart, doc.data());
          cart.items.forEach((item) => {
            if (!this.cartMap.has(item.itemId)) {
              this.cartMap.set(item.itemId, new Map());
              this.cartSize++;
            }
            var m = this.cartMap.get(item.itemId);
            m.set(item.unit, item.qty);
          });
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

    this.items.push(product1);
    this.items.push(product2);
    this.items.push(product3);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);
    this.items.push(product4);

    for (let i = 0; i <= this.items.length; i++) {
      this.unitDisplayMap.set(i, 0);
      this.displayMap.set(i, true);
    }
  }

  addToCart(i: number) {
    var id = this.items[i].id;
    var u = this.items[i].units[this.unitDisplayMap.get(i)];

    if (this.cartMap.has(id) && this.cartMap.get(id).has(u.unit)) {
      this.cartMap.get(id).set(u.unit, this.cartMap.get(id).get(u.unit) + 1);
    } else {
      var m = this.cartMap.has(id)
        ? this.cartMap.get(id)
        : new Map<string, number>();
      m.set(u.unit, 1);
      this.cartMap.set(id, m);
      this.cartSize++;
    }
    this.updateCart();
  }

  removeFromCart(i: number) {
    var id = this.items[i].id;
    var u = this.items[i].units[this.unitDisplayMap.get(i)];

    this.cartMap.get(id).set(u.unit, this.cartMap.get(id).get(u.unit) - 1);
    if (this.cartMap.get(id).get(u.unit) === 0) {
      this.cartMap.get(id).delete(u.unit);
      this.cartSize--;
      if (this.cartMap.get(id).size === 0) {
        this.cartMap.delete(id);
      }
    }
    this.updateCart();
  }

  selectionChange(event, i: number) {
    this.unitDisplayMap.set(i, this.items[i].units.indexOf(event.detail.value));
    for (let index in this.items[i].units) {
      var u = this.items[i].units[index];
      if (u.unit === event.detail.value) {
        this.unitDisplayMap.set(i, Number(index));
        return;
      }
    }
  }

  updateSearchResults() {
    this.items.forEach((item, i) => {
      this.displayMap.set(
        i,
        item.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      );
    });
  }

  routeToCheckout() {
    if (this.cartMap.size > 0) {
      this.router.navigateByUrl('/checkout');
    }
  }

  updateCart() {
    var cart = new Cart();
    this.cartMap.forEach((v, k) => {
      v.forEach((v1, k1) => {
        var i = new CartItem();
        i.itemId = k;
        i.qty = v1;
        i.unit = k1;
        cart.items.push(i);
      });
    });

    const doc = this.fbUtil.toJson(cart);
    this.fbUtil
      .getInstance()
      .collection(Constants.USER + '/' + this.user.uid + '/' + Constants.CART)
      .doc(this.user.uid)
      .set(doc);
  }
}
