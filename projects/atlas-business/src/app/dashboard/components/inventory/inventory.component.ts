import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FirebaseUtil, Product } from 'atlas-core';
import { Subscription } from 'rxjs';
import { NewProductComponent } from './new/new.product.component';
import { RemoveProductComponent } from './remove/remove.product.component';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryDashboardComponent implements AfterViewInit, OnDestroy {
  showSpinner = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  product: Product;
  subscription: Subscription;
  dialogSubscription: Subscription;
  dataSource: MatTableDataSource<Product>;
  displayedColumns: string[] = [
    'name',
    'serial',
    'unit',
    'gst',
    'price',
    'stock',
    'desc',
    'actions'
  ];

  constructor(public fbutil: FirebaseUtil, public dialog: MatDialog) {
    this.dataSource = new MatTableDataSource();
    this.subscribeToUpdates();
    this.dialogSubscription = this.dialog.afterAllClosed.subscribe(() => this.fetchProducts());
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.dialogSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  subscribeToUpdates() {
    this.subscription = this.fbutil
      .getProductRef('bizId')
      .snapshotChanges()
      .subscribe(() => {
        this.fetchProducts();
      });
  }

  fetchProducts() {
    const result: Product[] = [];
    this.fbutil
      .getProductRef('bizId')
      .get()
      .forEach((res) =>
        res.forEach((data) => {
          const p = new Product();
          if (data.data()) {
            Object.assign(p, data.data());
            result.push(p);
          }
        })
      )
      .finally(() => this.update(result));
  }

  update(result: Product[]) {
    this.dataSource = new MatTableDataSource(result);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.showSpinner = false;
  }

  addNewProduct() {
    this.dialog.open(NewProductComponent, {
      position: { top: '20px' },
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editProduct(product: Product) {
    this.dialog.open(NewProductComponent, {
      data: product,
      position: { top: '20px' },
    });
  }

  removeProduct(product: Product) {
    this.dialog.open(RemoveProductComponent, {
      data: {
        id: product.id,
        name: product.name,
      },
    });
  }

  trimDescription(desc: string): string {
    if (desc && desc.length > 150) {
      return desc.substr(0, 150);
    }
    return desc;
  }

  formatGST(gst: string) {
    if (!gst) {
      return '0%';
    }
    return gst.split(' ')[0];
  }
}
