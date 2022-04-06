import { Component, ElementRef, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Address, AuthService, Business, Client, CommonUtil, Constants, FirebaseUtil, Invoice, InvoicePreview, InvoiceVersion, Item, Product, Unit } from 'atlas-core';
import * as firebase from 'firebase';
import 'jspdf-autotable';
import { AppService } from 'projects/atlas-business/src/app/app.service';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { InvoiceService } from '../invoice.service';
import { PdfModal } from './modal/modal.pdf';

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './editinvoice.component.html',
  styleUrls: ['./editinvoice.component.scss'],
})
export class EditInvoiceComponent implements OnDestroy {
  invoice: Invoice = new Invoice();
  preview: InvoicePreview = new InvoicePreview();
  existingInvoice = false;

  isInvoiceDetailValid = false;
  isCustomerDetailValid = false;
  isBillingAddressValid = false;
  isShippingAddressValid = false;
  isItemSummaryValid = false;

  // Invoice Dates
  invoiceDate: Date = new Date();
  dueDate: Date = new Date();
  customDueDate = false;

  business: Business = new Business();
  supplyPlace = '';
  supplyState = '';
  states = Constants.states;

  // Also update "getDueDte" function in this class
  allPaymentTerms: string[] = [
    'Custom Select',
    'Paid',
    'Due in 7 days',
    'Due in 15 days',
    'Due in 30 days',
    'Due in 45 days',
    'Due in 60 days'
  ];

  paymentTerms = this.allPaymentTerms[1];

  // Client Details
  clients: Client[] = [];
  clientsMap: Map<string, Client> = new Map();
  clientControl: FormControl = new FormControl();
  clientObservable: Observable<Client[]>;

  client: Client = new Client();
  shippingAddress: Address = new Address();
  shippingAddressSame = true;

  // Item Summary
  controls: FormControl[] = [];
  observables: Observable<Product[]>[] = [];
  unitControls: FormControl[] = [];
  unitObservables: Observable<Unit[]>[] = [];

  productUnitMap: Map<string, Unit[]> = new Map();
  productGSTMap: Map<string, string> = new Map();
  optionsProduct: Product[] = [];

  readonly optionsTax = Constants.optionsTax;

  items: Item[] = [];
  data = [];

  totalAmount = 0;
  totalTax = 0;
  total = 0;

  bizId = '';
  invoiceCreated = false;
  subscription: Subscription;

  constructor(
    private router: Router,
    private modalController: ModalController,
    private fbutil: FirebaseUtil,
    private util: CommonUtil,
    private elRef: ElementRef,
    private invoiceService: InvoiceService,
    private app: AppService,
    private auth: AuthService
  ) {
    this.app.presentLoading();
    this.auth.afAuth.authState.subscribe((user) => {
      if (user) {
        this.bizId = user.uid;
        this.init();
      }
    });
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  init() {
    this.getBusinessInfo();
    this.fetchClients();
    this.fetchProducts();

    this.subscription = this.app.modalPdfCloseEvent.subscribe((s) => {
      if (!this.invoiceCreated && s === 'Save') {
        this.invoiceCreated = true;
        this.createAndSaveInvoice();
      }

      this.modalController.getTop().then(x => {
        if(x) {
          this.modalController.dismiss();
        }
      });
    });
  }

  fetchInvoice() {
    if (!this.invoiceService.invoiceId || this.invoiceService.invoiceId.length === 0) {
      this.addItem();
      this.app.dismissLoading();
      return;
    }

    this.existingInvoice = true;
    this.fbutil.getInvoiceRef(this.bizId)
      .doc(this.invoiceService.invoiceId).get().forEach((invoice) => {
        if (invoice.exists) {
          Object.assign(this.invoice, invoice.data());
          if (this.invoice.allVersions && this.invoice.allVersions.length > 0) {
            this.updateFieldsForExistingInvoice(this.invoice.allVersions[this.invoice.allVersions.length - 1]);
          }
        }
      }).catch(e => {
        this.addItem();
        this.app.presentToast('Error while loading invoice data!');
        this.app.dismissLoading();
      });
  }

  updateFieldsForExistingInvoice(i: InvoiceVersion) {
    this.dueDate = new Date(i.dueDate);
    this.invoiceDate = new Date(i.invoiceDate);
    this.supplyState = i.supplyState;
    this.supplyPlace = i.supplyPlace;
    this.paymentTerms = i.paymentTerms;
    this.customDueDate = (i.paymentTerms === this.allPaymentTerms[0]);

    this.client.address.name = i.client.address.name;
    this.client.pan = i.client.pan;
    this.client.gst = i.client.gst;
    this.client.address.mobile = i.client.address.mobile;
    this.client.address.email = i.client.address.email;

    this.client.address.line1 = i.client.address.line1;
    this.client.address.line2 = i.client.address.line2;
    this.client.address.pin = i.client.address.pin;
    this.client.address.district = i.client.address.district;
    this.client.address.state = i.client.address.state;
    this.client.address.location = i.client.address.location;

    this.shippingAddress.line1 = i.shippingAddress.line1;
    this.shippingAddress.line2 = i.shippingAddress.line2;
    this.shippingAddress.pin = i.shippingAddress.pin;
    this.shippingAddress.district = i.shippingAddress.district;
    this.shippingAddress.state = i.shippingAddress.state;
    this.shippingAddress.location = i.shippingAddress.location;

    this.shippingAddressSame = i.shippingAddressSame;
    this.isShippingAddressValid = true;

    if (i.items) {
      for (const j of i.items) {
        this.addFormControl();
      }
      this.items = i.items;
    }

    this.total = i.total;
    this.totalTax = i.totalTax;
    this.totalAmount = i.totalTaxableValue;

    this.app.dismissLoading();
  }

  fetchClients() {
    const result: Client[] = [];
    this.fbutil
      .getClientRef(this.bizId)
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
      .finally(() => this.updateClients(result));
  }

  clientNameChange(event: string) {
    if (event && this.clientsMap.has(event.toLowerCase())) {
      const c: Client = this.clientsMap.get(event.toLowerCase());

      this.client.address.name = c.address.name;
      this.client.pan = c.pan;
      this.client.gst = c.gst;
      this.client.address.mobile = c.address.mobile;
      this.client.address.email = c.address.email;

      this.client.address.line1 = c.address.line1;
      this.client.address.line2 = c.address.line2;
      this.client.address.pin = c.address.pin;
      this.client.address.district = c.address.district;
      this.client.address.state = c.address.state;
      this.client.address.location = c.address.location;
    } else {
      this.client = new Client();
      this.client.address.name = event;
    }
    this.customerDetailChange();
  }

  updateClients(c: Client[]) {
    this.clients = c;
    c.forEach(client => this.clientsMap.set(client.address.name.toLowerCase(), client));

    this.clientControl.valueChanges.subscribe((value) => {
      if (typeof value === 'string') {
        this.client.address.name = value;
      }
    });

    this.clientObservable = this.clientControl.valueChanges.pipe(
      startWith(''),
      map((value) =>
        this.clients.filter((option) =>
          option.address.name
            .toLowerCase()
            .includes(
              typeof value === 'string'
                ? value.toLowerCase()
                : value.name.toLowerCase()
            )
        )
      )
    );
  }

  fetchProducts() {
    const result: Product[] = [];
    this.fbutil
      .getProductRef(this.bizId)
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
      .finally(() => {
        this.updateProducts(result);
        this.fetchInvoice();
      });
  }

  updateProducts(p: Product[]) {
    this.optionsProduct = p;
    this.productUnitMap.clear();
    this.productGSTMap.clear();
    p.forEach((product) => {
      this.productUnitMap.set(product.name.toLowerCase(), product.units);
      this.productGSTMap.set(product.name.toLowerCase(), product.gst);
    });
  }

  goBackToInvoiceComponent() {
    this.router.navigateByUrl('/dashboard/invoice');
  }

  addItem() {
    if (this.validateItems()) {
      const item = new Item();
      item.qty = 1;
      item.discount = 0;
      item.tax = Constants.optionsTax[0];
      this.items.push(item);
      this.addFormControl();
      this.isItemSummaryValid = false;
      setTimeout(() => { this.elRef.nativeElement.parentElement.scrollTop = this.elRef.nativeElement.parentElement.scrollHeight; }, 100);
    } else {
      this.app.presentToast('Please enter valid values');
    }
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.controls.splice(index, 1);
    this.observables.splice(index, 1);
    this.unitObservables.splice(index, 1);
    this.unitControls.splice(index, 1);
    this.itemChange();
  }

  addFormControl() {
    const myControl = new FormControl();
    const unitControl = new FormControl();
    const filteredOptions: Observable<Product[]> = myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(this.optionsProduct, value))
    );

    this.controls.push(myControl);
    this.observables.push(filteredOptions);
    this.unitObservables.push(undefined);
    this.unitControls.push(unitControl);
  }

  productSelected(value: string, index: number) {
    if (value) {
      const units: Unit[] = this.productUnitMap.get(value.toLowerCase());

      const filteredOptions: Observable<Unit[]> = this.unitControls[
        index
      ].valueChanges.pipe(
        startWith(''),
        map((v) => this._filterUnit(units, v))
      );

      this.unitObservables[index] = filteredOptions;

      // Added validaton to have atleast 1 unit
      this.items[index].unit = units[0].unit;
      this.items[index].price = units[0].price;
      this.items[index].tax = this.productGSTMap.get(value.toLowerCase());
    }
  }

  unitSelected(value: string, index: number) {
    const item = this.items[index];
    this.productUnitMap.get(item.name.toLowerCase()).forEach((unit) => {
      if (unit.unit === value) {
        item.price = unit.price;
      }
    });
  }

  private _filter(list: any[], value: string): Product[] {
    return list.filter((option) =>
      option.name.toLowerCase().includes(value.toLowerCase())
    );
  }

  private _filterUnit(list: any[], value: string): Unit[] {
    return list.filter((option) =>
      option.unit.toLowerCase().includes(value.toLowerCase())
    );
  }

  calculate(item: Item): number {
    this.itemChange();
    item.taxValue = 0;
    item.total = this.util.roundOff(Math.abs(item.qty) * Math.abs(item.price) - Math.abs(item.discount));

    const index = Constants.optionsTax.indexOf(item.tax);
    if (index !== -1) {
      item.taxValue = this.util.getTax(item.total, Constants.optionsTaxValue[index]);
    }

    item.total = this.util.roundOff(item.total + item.taxValue);
    return item.taxValue;
  }

  calculateTotalTax(): number {
    let total = 0;
    this.items.forEach((item) => {
      if (item.taxValue) {
        total = this.util.roundOff(total + item.taxValue);
      }
    });
    return total;
  }

  calculateTotal(): number {
    let total = 0;
    this.items.forEach((item) => {
      if (item.total) {
        total = this.util.roundOff(total + item.total);
      }
    });
    return total;
  }

  validateItems(): boolean {
    for (const item of this.items) {
      if (
        item.name &&
        item.unit &&
        item.price &&
        item.qty
      ) {
        continue;
      } else {
        return false;
      }
    }
    return true;
  }

  isValidInvoice(): boolean {
    if (
      this.invoiceDate &&
      this.dueDate &&
      this.supplyState.length > 0 &&
      this.supplyPlace.length > 0 &&
      this.client &&
      this.client.address.name &&
      this.client.address.name.length > 0 &&
      this.client.address.mobile &&
      this.client.address &&
      this.client.address.line1 &&
      this.client.address.line1.length > 0 &&
      this.client.address.district &&
      this.client.address.district.length > 0 &&
      this.client.address.state &&
      this.client.address.state.length > 0 &&
      this.client.address.pin &&
      this.items.length > 0
    ) {
      return this.validateItems();
    }
    return false;
  }

  async openPreviewDialog() {
    if (!this.isValidInvoice()) {
      this.app.presentToast('Missing fields required to generate invoice!');
      return;
    }

    this.updateInvoice(false);
    const invoice = this.invoiceService.generatePDF(this.invoice, this.business);
    const pdf: ArrayBuffer = invoice.output('arraybuffer');

    const modal = await this.modalController.create({
      component: PdfModal,
      cssClass: 'pdf-modal',
      componentProps: {
        data: pdf,
        isEdit: true
      },
    });
    return await modal.present();
  }

  saveAsDraft() {
    this.updateInvoice(true);
    this.createAndSaveInvoice();
  }

  updateInvoice(saveAsDraft: boolean) {
    const timestamp = Date.now();

    let version: InvoiceVersion;
    if (this.existingInvoice && this.invoice.allVersions.length > 0) {
      version = this.invoice.allVersions[this.invoice.allVersions.length - 1];

      if (!version.isDraft) {
        version = new InvoiceVersion();
        version.createdTimeUtc = timestamp;
        this.invoice.allVersions.push(version);
      }
    } else {
      this.invoice.id = this.fbutil.getId();

      version = new InvoiceVersion();
      version.createdTimeUtc = timestamp;
      this.invoice.allVersions.push(version);
    }

    version.isDraft = saveAsDraft;
    version.lastUpdatedTimeUtc = timestamp;

    version.invoiceDate = this.invoiceDate.toDateString();
    version.dueDate = this.dueDate.toDateString();
    version.supplyState = this.supplyState;
    version.supplyPlace = this.supplyPlace;
    version.paymentTerms = this.paymentTerms;

    version.client = this.client;
    version.shippingAddress = this.shippingAddress;
    version.shippingAddressSame = this.shippingAddressSame;
    version.items = this.items;

    this.generateItemTotal();
    version.totalTaxableValue = this.totalAmount;
    version.totalTax = this.totalTax;
    version.total = this.total;

    this.preview.id = this.invoice.id;
    this.preview.invoiceNo = this.invoice.invoiceNo;
    this.preview.isDraft = saveAsDraft;
    this.preview.client = version.client.address.name;
    this.preview.address = version.client.address.district + ', ' + version.client.address.state + ' - ' + version.client.address.pin;
    this.preview.amount = version.total;
    this.preview.invoiceDate = version.invoiceDate;
    this.preview.dueDate = version.dueDate;
    this.preview.lastUpdatedTimeUtc = timestamp;
  }

  createAndSaveInvoice() {
    this.app.presentLoading();

    if(this.existingInvoice) {
      this.uploadInvoice();
      return;
    }

    // invoice number get + increment
    this.fbutil.getInstance()
      .collection(Constants.BUSINESS)
      .doc(this.bizId)
      .get()
      .subscribe((doc) => {
        if (doc.exists) {
          var invoiceNo = (doc.data() as any).invoiceNo;
          this.invoice.invoiceNo = invoiceNo;
          this.preview.invoiceNo = this.invoice.invoiceNo;
          this.incrementCounter();
          this.uploadInvoice();
        }
      });
  }

  incrementCounter(){
    this.fbutil
    .getInstance()
    .collection(Constants.BUSINESS)
    .doc(this.bizId)
    .update({ invoiceNo: firebase.default.firestore.FieldValue.increment(1) });
  }

  uploadInvoice() {
    this.fbutil.getInvoicePreviewRef(this.bizId)
      .doc(this.preview.id)
      .set(this.fbutil.toJson(this.preview));

    this.fbutil
      .getInvoiceRef(this.bizId)
      .doc(this.invoice.id)
      .set(this.fbutil.toJson(this.invoice))
      .then(() => {
        this.app.dismissLoading();
        this.goBackToInvoiceComponent();
      })
      .catch((e) => {
        this.app.presentToast('Error while saving data');
      });
  }

  getClientOptionText(option: Client) {
    return option ? option.address.name : '';
  }

  getAddressOptionText(option: Address) {
    return option ? option.line1 : '';
  }

  checkDueDate() {
    if (
      !this.dueDate ||
      this.dueDate.getFullYear() < this.invoiceDate.getFullYear() ||
      this.dueDate.getMonth() < this.invoiceDate.getMonth() ||
      this.dueDate.getDate() < this.invoiceDate.getDate()
    ) {
      this.dueDate = this.getDueDate();
    }
  }

  generateItemTotal() {
    this.totalAmount = 0;
    this.totalTax = 0;
    this.total = 0;

    this.items.forEach((item) => {
      const a = item.price * item.qty;
      this.totalAmount += (a - item.discount);
      this.totalTax += item.taxValue;
      this.total += item.total;
    });
  }

  isValidAddress(address: Address): boolean {
    return (
      address.line1 && address.line1.length > 0 &&
      address.line2 && address.line2.length > 0 &&
      address.district && address.district.length > 0 &&
      address.state && address.state.length > 0 &&
      address.pin
    ) ? true : false;
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
          this.supplyPlace = this.business.address.district;
          this.supplyState = this.business.address.state;
          this.isInvoiceDetailValid = (this.supplyPlace && this.supplyState) ? true : false;
        }
      });
  }

  supplyPlaceChange() {
    if (this.supplyPlace) {
      this.isInvoiceDetailValid = true;
    } else {
      this.isInvoiceDetailValid = false;
    }
  }

  customerDetailChange() {
    if (this.client.address.name && this.client.address.mobile) {
      this.isCustomerDetailValid = true;
    } else {
      this.isCustomerDetailValid = false;
    }
    this.billingAddressChange();
  }

  billingAddressChange() {
    if (this.client.address.line1 && this.client.address.pin && this.client.address.district && this.client.address.state) {
      this.isBillingAddressValid = true;
    } else {
      this.isBillingAddressValid = false;
    }
  }

  shippingAddressChange() {
    if (this.shippingAddress.line1 && this.shippingAddress.pin && this.shippingAddress.district && this.shippingAddress.state) {
      this.isItemSummaryValid = true;
    } else {
      this.isItemSummaryValid = false;
    }
  }

  itemChange() {
    for (const item of this.items) {
      if (
        item.name &&
        item.unit &&
        item.price != null && item.price >= 0 &&
        item.qty
      ) {
        continue;
      } else {
        this.isItemSummaryValid = false;
        return;
      }
    }
    this.isItemSummaryValid = (this.items.length === 0) ? false : true;
  }

  paymentStatusChange() {
    this.customDueDate = (this.paymentTerms === this.allPaymentTerms[0]);
    this.dueDate = this.getDueDate();
  }

  getDueDate() {
    let days = 0;
    switch (this.paymentTerms) {
      case this.allPaymentTerms[2]:
        days = 7;
        break;
      case this.allPaymentTerms[3]:
        days = 15;
        break;
      case this.allPaymentTerms[4]:
        days = 30;
        break;
      case this.allPaymentTerms[5]:
        days = 45;
        break;
      case this.allPaymentTerms[6]:
        days = 60;
        break;
    }

    const result = new Date(this.invoiceDate);
    result.setDate(result.getDate() + days);
    return result;
  }
}
