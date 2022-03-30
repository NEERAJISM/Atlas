import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Client, FirebaseUtil } from 'atlas-core';
import { Subscription } from 'rxjs';
import { AppService } from '../../../app.service';
import { NewClientComponent } from './new/new.client.component';
import { RemoveClientComponent } from './remove/remove.client.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersDashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  client: Client;
  dataSource: MatTableDataSource<Client>;
  subscription: Subscription;
  dialogSubscription: Subscription;
  displayedColumns: string[] = [
    'name',
    'id',
    'mobile',
    'email',
    'address',
    'district',
    'state',
    'actions',
  ];

  constructor(public fbutil: FirebaseUtil, public dialog: MatDialog, private service: AppService) {
    this.service.presentLoading();
    this.dataSource = new MatTableDataSource();
    this.subscribeToUpdates();
    this.dialogSubscription = this.dialog.afterAllClosed.subscribe(() => this.fetchClients());
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
      .getClientRef('bizId')
      .snapshotChanges()
      .subscribe(() => {
        this.fetchClients();
      });
  }

  fetchClients() {
    const result: Client[] = [];
    this.fbutil
      .getClientRef('bizId')
      .get()
      .forEach((res) =>
        res.forEach((data) => {
          const c = new Client();
          if (data.data()) {
            Object.assign(c, data.data());
            result.push(c);
          }
        })
      )
      .finally(() => this.update(result));
  }

  update(result: Client[]) {
    this.dataSource = new MatTableDataSource(result);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.service.dismissLoading();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  combineAdress(client: Client): string {
    let result = '';
    if (client.address.line1 && client.address.line1.length > 0) {
      result += client.address.line1;
      result += ', ';
    }

    if (client.address.line2 && client.address.line2.length > 0) {
      result += client.address.line2;
      result += ' - ';
    }

    if (client.address.pin) {
      result += client.address.pin;
    }
    return result;
  }

  addNewClient() {
    this.dialog.open(NewClientComponent, {
      position: { top: '20px' },
    });
  }

  editClient(client: Client) {
    this.dialog.open(NewClientComponent, {
      data: client,
      position: { top: '20px' },
    });
  }

  removeClient(client: Client) {
    this.dialog.open(RemoveClientComponent, {
      data: {
        id: client.id,
        name: client.name,
      },
    });
  }
}
