import { Component, OnDestroy } from '@angular/core';
import { CommonUtil, Constants, FirebaseUtil, Order, OrderStatus, Status } from 'atlas-core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersDashboardComponent implements OnDestroy {
  new = 0;
  accept = 0;
  progress = 0;
  completed = 0;
  canceled = 0;
  all = 0;

  tabStatus: Status = null;

  allOrders: Order[] = [];
  orders: Order[] = [];
  orderSubscription: Subscription;
  limit = 3;
  value = '';
  timeout?: number;

  url = 'https://material.angular.io/assets/img/examples/shiba2.jpg';

  constructor(private fbUtil: FirebaseUtil, private util: CommonUtil) {
    this.orderSubscription = this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + 'bizId' + '/' + Constants.ORDERS)
      .valueChanges()
      .subscribe(() => this.loadOrders());
  }

  // TODO better filtering to get actual new orders

  loadOrders(isSearch?: boolean) {
    const result: Order[] = [];
    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + 'bizId' + '/' + Constants.ORDERS,
        (ref) => ref.orderBy('createdTimeUTC', 'desc').limit(this.limit)
      )
      .get()
      .forEach((res) =>
        res.forEach((data) => {
          const o = new Order();
          if (data.data()) {
            Object.assign(o, data.data());
            if (!isSearch) {
              result.push(o);
              return;
            }

            if (JSON.stringify(o).toUpperCase().indexOf(this.value.toUpperCase()) != -1) {
              result.push(o);
            }
          }
        })
      )
      .finally(() => this.updateOrders(result));
  }

  updateOrders(result: Order[]) {
    this.allOrders = result;
    this.orders = result;
    this.updateTabs();
  }

  updateTabs() {
    this.all = this.allOrders.length;
    this.new = 0;
    this.accept = 0;
    this.progress = 0;
    this.completed = 0;
    this.canceled = 0;

    this.allOrders.forEach((order) => {
      const status = order.status[order.status.length - 1].status;
      switch (status) {
        case Status.New:
          this.new++;
          break;
        case Status.Accept:
          this.accept++;
          break;
        case Status.Progress:
          this.progress++;
          break;
        case Status.Complete:
          this.completed++;
          break;
        case Status.Cancel:
          this.canceled++;
          break;
      }
    });

    if (this.tabStatus != null) {
      this.orders = this.allOrders.filter(
        (order) =>
          order.status[order.status.length - 1].status === this.tabStatus
      );
    }
  }

  increaseOrderLimit() {
    this.limit += 3;
    this.loadOrders();
  }

  getDate(epoch: number) {
    return this.util.getFormattedDate(new Date(epoch));
  }

  ngOnDestroy(): void {
    this.orderSubscription.unsubscribe();
  }

  tabChange(e) {
    if (e.index === 0) {
      this.tabStatus = null;
      this.orders = this.allOrders;
    } else {
      switch (e.index) {
        case 1:
          this.tabStatus = Status.New;
          break;
        case 2:
          this.tabStatus = Status.Accept;
          break;
        case 3:
          this.tabStatus = Status.Progress;
          break;
        case 4:
          this.tabStatus = Status.Complete;
          break;
        case 5:
          this.tabStatus = Status.Cancel;
          break;
      }
    }
    this.updateTabs();
  }

  updateOrder(index: number, newStatus: string) {
    let order = this.orders[index];

    const status: OrderStatus = new OrderStatus();
    status.status = newStatus as Status;
    status.time = Date.now();
    order.status.push(status);

    const doc = this.fbUtil.toJson(order);
    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + order.bizId + '/' + Constants.ORDERS
      )
      .doc(order.id)
      .set(doc)
      .catch(() =>
        this.util.showSnackBar(
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
        this.updateTabs();
      });
  }

  onInput(): void {
    window.clearTimeout(this.timeout);
    this.timeout = window.setTimeout(() => this.search(), 1000);
  }

  searchClear() {
    this.value = '';
    this.loadOrders();
  }

  search() {
    if (!this.value) {
      this.searchClear();
      return;
    }
    this.loadOrders(true);
  }
}
