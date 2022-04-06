import { Component } from '@angular/core';
import { AuthService, CommonUtil, Constants, FirebaseUtil, Order } from 'atlas-core';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
})
export class AccountComponent {
  limit = 5;
  isDesktop = false;

  orders: Order[] = [];
  imgMap: Map<string, string> = new Map();
  orderSubscription: Subscription;

  uid = '';
  constructor(public fbUtil: FirebaseUtil, private commonUtil : CommonUtil, private auth: AuthService, public app: AppService) {
    this.app.presentLoading();
    this.isDesktop = app.isDesktop;
    this.initUser();
  }

  initUser() {
    this.auth.getUserId().subscribe((user) => {
      if (!user) {
        this.app.dismissLoading();
        this.app.go('');
      } else {
        this.uid = user.uid;
        this.loadOrders();
      }
    });
  }

  loadOrders() {
    const result: Order[] = [];
    this.fbUtil
      .getInstance()
      .collection(
        Constants.USER +
          '/' +
          this.uid+
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
    this.orders.forEach(order => {
      order.items.forEach(item => {
        this.downloadProductImage(order.bizId, item.id);
      });
    });
    this.app.dismissLoading();
  }

  downloadProductImage(bizId, id) {
    this.fbUtil.downloadImage(Constants.PRODUCT + '/' + bizId + '/' + id + '/1.png')
      .subscribe((url) => {
        this.imgMap.set(id, url);
      });
  }

  increaseOrderLimit() {
    this.limit += 3;
    this.loadOrders();
  }

  getDate(epoch: number) {
    return this.commonUtil.getFormattedDate(new Date(epoch));
  }
}
