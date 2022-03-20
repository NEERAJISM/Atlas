import { Injectable } from '@angular/core';
import { jsPDF, jsPDFOptions } from 'jspdf';

import { HttpClient } from '@angular/common/http';
import { Address, Business, CommonUtil, Constants, Invoice, InvoiceVersion } from 'atlas-core';

@Injectable()
export class InvoiceService {
  invoiceId: string;

  title = 'jspdf-autotable-demo';
  headOwnerAddress = [['']];
  dataOwnerAddress = [[''], [''], [''], ['']];

  headInvoiceDetails = [['Invoice # 1254-5621']];

  dataInvoiceDetails = [
    'Issue Date     : ',
    'Due   Date     : ',
    'Supply Place : ',
    'Supply State  : '
  ];

  invoiceBuyerDefault: string[] = ['Customer Name', 'Billing Address', 'Shipping Address'];

  invoiceItemHead = [
    [
      'No.',
      'Item Description (Unit)',
      'Code',
      'Qty',
      'Price',
      'Amount',
      'Discount',
      'Tax / GST',
      'Total (Inc. Tax)',
    ],
  ];

  bodyTotal = [
    ['Total Amount', ''],
    ['', ''],
    ['Final Amount (Total + Tax)', '']
  ];

  constructor(private http: HttpClient, private util: CommonUtil) { }

  public getBusinessInfo(): Business {
    const b = new Business();
    b.name = 'Krishna Enterprises';
    b.email = '8patidarneeraj@gmail.com';
    b.mobile = '+91 - 8877073059';
    b.phone = '02964 - 230354';

    const a = new Address();
    a.line1 = 'C\\o Balkrishna Patidar';
    a.line2 = 'Gamda Brahmaniya, Sagwara';
    a.district = 'Dungarpur';
    a.state = 'Rajasthan';
    a.pin = 314025;
    b.address = a;

    return b;
  }

  public generatePDF(invoice: Invoice): jsPDF {
    let i: InvoiceVersion = invoice.allVersions[invoice.allVersions.length - 1];

    // Only show a non-draft version as Preview
    if (i.isDraft && invoice.allVersions.length > 1) {
      i = invoice.allVersions[invoice.allVersions.length - 2];
    }


    const options: jsPDFOptions = {};
    options.compress = true;
    const doc: jsPDF = new jsPDF(options);

    // TODO remove all comments
    // Comes from settings Icon - default is colorful backfround with initials
    // Icon / logo creator - font + color or photo
    doc.addImage('../../assets/icons/atlas-small.png', 'PNG', 7, 12, 17, 17);

    const b: Business = this.getBusinessInfo();
    this.headOwnerAddress[0][0] = b.name;

    this.dataOwnerAddress[0][0] = b.address.line1 + ', ' + b.address.line2;
    this.dataOwnerAddress[1][0] = b.address.district + ' (' + b.address.state + ') - ' + b.address.pin;
    this.dataOwnerAddress[2][0] = 'Email : ' + b.email;
    this.dataOwnerAddress[3][0] = 'Tel : ' + b.phone + ', Mob : ' + b.mobile;

    (doc as any).autoTable({
      startY: 9,
      head: this.headOwnerAddress,
      body: this.dataOwnerAddress,
      theme: 'plain',
      margin: { left: 27 },
      headStyles: { fontSize: '12', textColor: '#01579b' },
      styles: {
        cellWidth: 95,
        fontSize: '10',
        cellPadding: { top: 1, right: 1, bottom: 0, left: 1 },
      },
    });

    const dataInvoiceDetails = [];
    dataInvoiceDetails[0] = [];
    dataInvoiceDetails[1] = [];
    dataInvoiceDetails[2] = [];
    dataInvoiceDetails[3] = [];
    dataInvoiceDetails[0][0] = this.dataInvoiceDetails[0] + this.util.getFormattedDate(new Date(i.invoiceDate));
    dataInvoiceDetails[1][0] = this.dataInvoiceDetails[1] + this.util.getFormattedDate(new Date(i.dueDate));
    dataInvoiceDetails[2][0] = this.dataInvoiceDetails[2] + i.supplyPlace;
    dataInvoiceDetails[3][0] = this.dataInvoiceDetails[3] + i.supplyState;

    const headSellerAddress = [];
    headSellerAddress[0] = this.invoiceBuyerDefault;

    const dataSellerAddress = this.getAddressArray();

    dataSellerAddress[0][0] = i.client.name;
    dataSellerAddress[1][0] = 'PAN : ' + (i.client.gst ? i.client.gst : '');
    dataSellerAddress[2][0] = 'Email : ' + (i.client.email ? i.client.email : '');
    dataSellerAddress[3][0] = 'Mobile : ' + (i.client.mobile ? '+91 - ' + i.client.mobile : '');

    dataSellerAddress[0][1] = i.client.address.line1 ? i.client.address.line1 : '';
    dataSellerAddress[1][1] = i.client.address.line2 ? i.client.address.line2 : '';
    dataSellerAddress[2][1] = i.client.address.district + ' - ' + i.client.address.pin;
    dataSellerAddress[3][1] = i.client.address.state;

    if (i.shippingAddressSame) {
      i.shippingAddress.line1 = i.client.address.line1;
      i.shippingAddress.line2 = i.client.address.line2;
      i.shippingAddress.pin = i.client.address.pin;
      i.shippingAddress.district = i.client.address.district;
      i.shippingAddress.state = i.client.address.state;
      i.shippingAddress.location = i.client.address.location;
    }
    dataSellerAddress[0][2] = i.shippingAddress.line1 ? i.shippingAddress.line1 : '';
    dataSellerAddress[1][2] = i.shippingAddress.line2 ? i.shippingAddress.line2 : '';
    dataSellerAddress[2][2] = i.shippingAddress.district + ' - ' + i.shippingAddress.pin;
    dataSellerAddress[3][2] = i.shippingAddress.state;

    (doc as any).autoTable({
      startY: 9,
      head: this.headInvoiceDetails,
      body: dataInvoiceDetails,
      theme: 'plain',
      margin: { left: 150 },
      headStyles: { fontSize: '12', textColor: '#01579b' },
      styles: {
        cellWidth: 95,
        fontSize: '10',
        cellPadding: { top: 1, right: 1, bottom: 0, left: 1 },
      },
    });

    doc.line(10, 42, 85, 42);
    doc.text('TAX INVOICE', 90, 44);
    doc.line(130, 42, 200, 42);

    (doc as any).autoTable({
      startY: 50,
      head: headSellerAddress,
      body: dataSellerAddress,
      theme: 'plain',
      margin: { left: 7, right: 7 },
      headStyles: { fontSize: '11', textColor: '#01579b' },
      styles: {
        fontSize: '10',
        cellPadding: { top: 1, right: 1, bottom: 0, left: 1 },
      },
    });

    (doc as any).autoTable({
      startY: 80,
      head: this.invoiceItemHead,
      body: this.generateItemData(i),
      theme: 'striped',
      margin: { left: 8, right: 8 },
      headStyles: { fontSize: '10' },
      styles: { fontSize: '9' },
    });

    let finalY = (doc as any).lastAutoTable.finalY;

    this.bodyTotal[0][1] = String(i.totalTaxableValue);

    if (i.supplyState === i.shippingAddress.state) {
      this.bodyTotal[1][0] = Constants.TAX_STRING_SGST;
    } else {
      this.bodyTotal[1][0] = Constants.TAX_STRING_IGST;
    }
    this.bodyTotal[1][1] = String(i.totalTax);

    const tot = Math.floor(i.total);
    const dec = Math.floor((i.total - tot) * 100);
    this.bodyTotal[2][1] = i.total + '\n' + this.inWords(tot) + 'Rupees ' + (dec > 0 ? this.inWords(dec) + 'Paise ' : '');

    (doc as any).autoTable({
      startY: finalY + 5,
      body: this.bodyTotal,
      theme: 'plain',
      styles: {
        cellWidth: 'wrap',
        fontStyle: 'bold',
        fontSize: '11',
        halign: 'right',
      },
    });

    finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(12);
    doc.line(145, finalY + 20, 195, finalY + 20);
    doc.text('Authorized Signature', 150, finalY + 30);

    // Footer
    doc.setFontSize(9);
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let j = 1; j <= pageCount; j++) {
      doc.setPage(j);
      doc.text('Powered by Atlas®', 10, 290);
      doc.text('Page ' + j + ' of ' + pageCount, 180, 290);
    }

    return doc;
  }

  getAddressArray(): string[][] {
    const a = [];
    for (let i = 0; i < 4; i++) {
      a[i] = [];
    }
    return a;
  }

  inWords(num: string | number) {
    if ((num = num.toString()).length > 9) { return ''; }
    const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (!n) { return ''; } let str = '';
    str += (Number(n[1]) !== 0) ? (a[n[1]] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
    str += (Number(n[1]) !== 0) ? (a[n[2]] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
    str += (Number(n[3]) !== 0) ? (a[n[3]] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
    str += (Number(n[4]) !== 0) ? (a[n[4]] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
    str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str;
  }

  generateItemData(i: InvoiceVersion) {
    const dataArr = [];
    let counter = 1;

    i.items.forEach((item) => {
      const dataItem = [];

      dataItem.push(counter);
      dataItem.push(item.name + '\n(' + item.unit + ')');
      dataItem.push(item.id);
      dataItem.push(item.qty);
      dataItem.push(item.price);

      const a = item.price * item.qty;
      dataItem.push(a);
      dataItem.push(item.discount);

      // Trimming off other value after total tax
      dataItem.push(item.taxValue + '\n(' + item.tax.substring(0, 3).trim() + ')');

      dataItem.push(item.total);

      dataArr.push(dataItem);
      counter++;
    });

    return dataArr;
  }

  sendEmail(){
    let key = '0445ED7941A25CD2AED36FA0FAEA2712BAB7B62980D56AE2F742E3C63EF77F7D9F6A3C3146CF23234632CCE713C2CE44';

    let url = 'https://api.elasticemail.com/v2/email/send?apikey=' + key +
    '&from=neerajism@cse.ism.ac.in&fromName=Neeraj&subject=ElasticEmailTest1&msgTo=mymailboxmark2@gmail.com&bodyHtml=<h3>This is a test email using Elastic</h3>&isTransactional=true';


    let url2 = 'https://api.elasticemail.com/v2/sms/send?apikey=' + key + '&to=+918877073059&body=SMS from Elastic Email';
    //8patidarneeraj@gmail.com
    //mymailboxmark2@gmail.com

    this.http.post(url, {responseType: 'json'})
      .subscribe(r => console.log(r));


  }
}
