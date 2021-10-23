import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'invoice-preview-dialog',
  templateUrl: 'invoice.preview.component.html',
})
export class InvoicePreviewComponent {
  constructor(public dialogRef: MatDialogRef<InvoicePreviewComponent>, @Inject(MAT_DIALOG_DATA) public data) { }

  doAction() {
    this.dialogRef.close({ event: 'Save' });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }
}
