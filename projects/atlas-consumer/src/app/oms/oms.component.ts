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

  items: Map<string, Product> = new Map();
  imgMap: Map<string, string> = new Map();

  search: string = '';
  displayMap: Map<string, boolean> = new Map();
  unitDisplayMap: Map<string, number> = new Map();

  cartSize = 0;
  cartMap: Map<string, Map<string, number>> = new Map();

  uid: string = '';

  // subscriptions
  subscriptions: Subscription[] = [];

  isDesktop = false;
  profileName = '';
  bizId = '';

  constructor(
    private router: Router,
    public modalController: ModalController,
    private service: AppService,
    private location: Location,
    private fbUtil: FirebaseUtil,
    private authService: AuthService
  ) {
    this.isDesktop = service.isDesktop;
    this.service.presentLoading();

    this.profile = this.service.getProfile();

    this.init();
  }

  init() {
    this.profileName = this.location.path().substring(1).split('/')[0];
    this.fbUtil
      .getInstance()
      .collection(Constants.PROFILE)
      .doc(this.profileName)
      .get()
      .subscribe((doc) => {
        if (!doc.exists) {
          this.service.presentToast('No Profile found for - ' + this.profileName);
          this.router.navigateByUrl('');
          return;
        }
        this.bizId = (doc.data() as any).id;
        this.getItems();
        this.initUser();
      });
  }

  initUser(){
    this.subscriptions.push(
      this.authService.getUserId().subscribe((user) => {
        this.service.dismissLoading();
        if (user) {
          this.uid = user.uid;
          this.initForUser();
        }
      })
    );
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
        for (let i of this.items.values()) {
          this.unitDisplayMap.set(i.id, 0);
          this.displayMap.set(i.id, true);
        }
      });
  }

  downloadProductImage(id) {
    this.fbUtil.downloadImage(Constants.PRODUCT + '/' + this.bizId + '/' + id + '/1.png')
      .subscribe((url) => {
        this.imgMap.set(id, url);
      });
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
    if (!this.uid || !this.bizId) {
      return;
    }

    this.fbUtil
      .getInstance()
      .collection(Constants.USER + '/' + this.uid + '/' + Constants.CART)
      .doc(this.bizId)
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

  addToCart(id: string) {
    if (!this.uid) {
      this.presentModal();
      return;
    }

    var u = this.items.get(id).units[this.unitDisplayMap.get(id)];
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

  removeFromCart(id: string) {
    var u = this.items.get(id).units[this.unitDisplayMap.get(id)];

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

  selectionChange(event, id: string) {
    this.unitDisplayMap.set(id, this.items.get(id).units.indexOf(event.detail.value));
    for (let index in this.items.get(id).units) {
      var u = this.items.get(id).units[index];
      if (u.unit === event.detail.value) {
        this.unitDisplayMap.set(id, Number(index));
        return;
      }
    }
  }

  updateSearchResults() {
    this.items.forEach((item) => {
      this.displayMap.set(
        item.id,
        item.name.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      );
    });
  }

  routeToCheckout() {
    this.router.navigateByUrl(this.profileName + '/checkout');
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
      .doc(this.bizId)
      .set(doc);
  }

  home() {
    this.service.go('');
  }
}
