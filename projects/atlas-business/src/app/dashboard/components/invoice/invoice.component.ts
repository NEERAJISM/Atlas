import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AuthService, Business, Constants, FirebaseUtil, Invoice, InvoicePreview } from 'atlas-core';
import { Subscription } from 'rxjs';
import { AppService } from '../../../app.service';
import { PdfModal } from './edit/modal/modal.pdf';
import { InvoiceService } from './invoice.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceDashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  invoice: InvoicePreview;
  dataSource: MatTableDataSource<InvoicePreview>;
  subscription: Subscription;
  displayedColumns: string[] = [
    'invoiceNo',
    'client',
    'address',
    'amount',
    'invoiceDate',
    'dueDate',
    'lastUpdate',
    'actions',
  ];

  bizId = '';
  business: Business = new Business();

  constructor(
    private modalController: ModalController,
    private fbutil: FirebaseUtil,
    private app: AppService,
    private auth: AuthService,
    private router: Router,
    private invoiceService: InvoiceService) {
    this.app.presentLoading();
    this.dataSource = new MatTableDataSource();

    this.auth.afAuth.authState.subscribe((user) => {
      if (user) {
        this.bizId = user.uid;
        this.getBusinessInfo();
        this.subscribeToUpdates();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  getBusinessInfo() {
    this.fbutil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.bizId + '/' + Constants.INFO)
      .doc(this.bizId)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          Object.assign(this.business, doc.data());
        }
      });
  }

  subscribeToUpdates() {
    this.subscription = this.fbutil
      .getInvoicePreviewRef(this.bizId)
      .snapshotChanges()
      .subscribe(() => {
        this.fetchInvoicePreviews();
      });
  }

  fetchInvoicePreviews() {
    const result: InvoicePreview[] = [];
    this.fbutil
      .getInvoicePreviewRef(this.bizId)
      .get()
      .forEach((res) =>
        res.forEach((data) => {
          const c = new InvoicePreview();
          if (data.data()) {
            Object.assign(c, data.data());
            result.push(c);
          }
        })
      )
      .finally(() => this.update(result));
  }

  update(result: InvoicePreview[]) {
    this.dataSource = new MatTableDataSource(result);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.app.dismissLoading();
  }

  loadNewInvoiceComponent(id: string) {
    this.invoiceService.invoiceId = id;
    this.router.navigateByUrl('/dashboard/invoice/edit');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getDateString(date: number) {
    const d = new Date(date);
    return d.toLocaleString();
  }

  edit(id: string) {
    this.loadNewInvoiceComponent(id);
  }

  preview(id: string) {
    this.fbutil.getInvoiceRef(this.bizId).doc(id).get().forEach((invoice) => {
      if (invoice.exists) {
        const i: Invoice = new Invoice();
        Object.assign(i, invoice.data());
        this.presentPdfModal(i)
      }
    }).catch(e => {
      this.app.presentToast('Error while loading invoice data!');
    });
  }

  async presentPdfModal(invoice: Invoice) {
    const invoicePdf = this.invoiceService.generatePDF(invoice, this.business);
    const pdf: ArrayBuffer = invoicePdf.output('arraybuffer');
    const modal = await this.modalController.create({
      component: PdfModal,
      cssClass: 'pdf-modal',
      componentProps: {
        data: pdf,
        isEdit: false
      },
    });
    return await modal.present();
  }

  mail(id: string) {
    this.invoiceService.sendEmail();
  }

  download(id: string) {
    this.fbutil.getInvoiceRef(this.bizId).doc(id).get().forEach((invoice) => {
      if (invoice.exists) {
        const i: Invoice = new Invoice();
        Object.assign(i, invoice.data());
        this.invoiceService.generatePDF(i, this.business).save('atlas.pdf');
      }
    }).catch(e => {
      this.app.presentToast('Error while loading invoice data!');
    });
  }

  print(id: string) {
    this.fbutil.getInvoiceRef(this.bizId).doc(id).get().forEach((invoice) => {
      if (invoice.exists) {
        const i: Invoice = new Invoice();
        Object.assign(i, invoice.data());
        this.invoiceService.generatePDF(i, this.business).output('dataurlnewwindow').open();
      }
    }).catch(e => {
      this.app.presentToast('Error while loading invoice data!');
    });
  }
}
