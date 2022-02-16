import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import {
  AuthService,
  Cart,
  CartItem,
  Constants,
  FirebaseUtil,
  Product,
  Profile,
} from 'atlas-core';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { ModalPage } from './modal/modal.page';

@Component({
  selector: 'app-oms',
  templateUrl: './oms.component.html',
})
export class OmsComponent implements OnInit, OnDestroy {
  display = true;
  profile: Profile;

  items: Product[] = [];

  search: string = '';
  displayMap: Map<number, boolean> = new Map();
  unitDisplayMap: Map<number, number> = new Map();

  cartSize = 0;
  cartMap: Map<string, Map<string, number>> = new Map();

  uid: string;

  // subscriptions
  subscriptions: Subscription[] = [];

  isDesktop = false;

  constructor(
    private router: Router,
    public modalController: ModalController,
    private service: AppService,
    private location: Location,
    private fbUtil: FirebaseUtil,
    private authService: AuthService
  ) {
    this.isDesktop = service.isDesktop;

    this.init();
    this.profile = this.service.getProfile();

    this.subscriptions.push(
      this.authService.getUserId().subscribe((user) => {
        if (!user) {
          setTimeout(() => this.presentModal(), 700);
        } else {
          this.uid = user.uid;
          this.initForUser();
        }
      })
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.service.modalCloseEvent.subscribe((s) => {
        if (s === 'close') {
          this.modalController.dismiss();
          this.initForUser();
        } else if (s === 'back') {
          this.location.back();
        }
      })
    );

    this.subscriptions.push(
      this.service.cartUpdatedEvent.subscribe((s) => {
        this.initForUser();
      })
    );
  }

  ngOnDestroy(): void {
    this.modalController.dismiss();
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  initForUser() {
    this.fbUtil
      .getInstance()
      .collection(Constants.USER + '/' + this.uid + '/' + Constants.CART)
      .doc('bizId')
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          this.cartSize = 0;
          const cart = new Cart();
          Object.assign(cart, doc.data());
          cart.items.forEach((item) => {
            this.cartSize++;
            if (!this.cartMap.has(item.itemId)) {
              this.cartMap.set(item.itemId, new Map());
            }
            var m = this.cartMap.get(item.itemId);
            m.set(item.unit, item.qty);
          });
        }
      });
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPage,
      backdropDismiss: false,
    });
    return await modal.present();
  }

  init() {
    this.items = this.service.getItems();

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
    this.router.navigateByUrl('/checkout');
  }

  account() {
    this.router.navigateByUrl('/account');
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
      .collection(Constants.USER + '/' + this.uid + '/' + Constants.CART)
      .doc('bizId')
      .set(doc);
  }

  home() {
    this.service.go('');
  }
}
