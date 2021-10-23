import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseUtil } from 'atlas-core';

@Component({
  selector: 'remove-product-dialog',
  templateUrl: 'remove.product.component.html',
})
export class RemoveProductComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public fbutil: FirebaseUtil
  ) {}

  submit() {
    this.fbutil
      .getProductRef('bizId')
      .doc(this.data.id)
      .delete()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }
}
