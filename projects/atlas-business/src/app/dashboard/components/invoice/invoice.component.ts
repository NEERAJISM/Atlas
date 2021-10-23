import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CommonUtil, FirebaseUtil, Invoice, InvoicePreview } from 'atlas-core';
import { Subscription } from 'rxjs';
import { InvoicePreviewComponent } from './edit/preview/invoice.preview.component';
import { InvoiceService } from './invoice.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
})
export class InvoiceDashboardComponent implements AfterViewInit, OnDestroy {
  showSpinner = true;

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

  constructor(
    private fbutil: FirebaseUtil,
    private router: Router,
    private invoiceService: InvoiceService,
    private dialog: MatDialog,
    private util: CommonUtil) {
    this.dataSource = new MatTableDataSource();
    this.subscribeToUpdates();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  subscribeToUpdates() {
    this.subscription = this.fbutil
      .getInvoicePreviewRef('bizId')
      .snapshotChanges()
      .subscribe(() => {
        this.fetchInvoicePreviews();
      });
  }

  fetchInvoicePreviews() {
    const result: InvoicePreview[] = [];
    this.fbutil
      .getInvoicePreviewRef('bizId')
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

    this.showSpinner = false;
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
    this.fbutil.getInvoiceRef('bizId').doc(id).get().forEach((invoice) => {
      if (invoice.exists) {
        const i: Invoice = new Invoice();
        Object.assign(i, invoice.data());
        this.openPreviewDialog(i);
      }
    }).catch(e => {
      this.util.showSnackBar('Error while loading invoice data!');
      console.log(e);
    });
  }

  openPreviewDialog(invoice: Invoice) {
    const invoicePdf = this.invoiceService.generatePDF(invoice);
    const pdf: ArrayBuffer = invoicePdf.output('arraybuffer');
    const dialogRef = this.dialog.open(InvoicePreviewComponent, {
      data: pdf,
      position: { top: '20px' },
    });
  }

  mail(id: string) {
    this.invoiceService.sendEmail();
  }

  download(id: string) {
    this.fbutil.getInvoiceRef('bizId').doc(id).get().forEach((invoice) => {
      if (invoice.exists) {
        const i: Invoice = new Invoice();
        Object.assign(i, invoice.data());
        this.invoiceService.generatePDF(i).save('atlas.pdf');
      }
    }).catch(e => {
      this.util.showSnackBar('Error while loading invoice data!');
      console.log(e);
    });
  }

  print(id: string) {
    this.fbutil.getInvoiceRef('bizId').doc(id).get().forEach((invoice) => {
      if (invoice.exists) {
        const i: Invoice = new Invoice();
        Object.assign(i, invoice.data());
        this.invoiceService.generatePDF(i).output('dataurlnewwindow').open();
      }
    }).catch(e => {
      this.util.showSnackBar('Error while loading invoice data!');
      console.log(e);
    });
  }
}
