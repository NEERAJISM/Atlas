import { Component } from '@angular/core';
import { CommonUtil, Constants, FirebaseUtil, Order } from 'atlas-core';
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
  orderSubscription: Subscription;

  constructor(public fbUtil: FirebaseUtil, private commonUtil : CommonUtil, private app: AppService) {
    this.isDesktop = app.isDesktop;
    this.loadOrders();
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

  increaseOrderLimit() {
    this.limit += 3;
    this.loadOrders();
  }

  getDate(epoch: number) {
    return this.commonUtil.getFormattedDate(new Date(epoch));
  }
}
