import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService, FirebaseUtil } from 'atlas-core';

@Component({
  selector: 'remove-product-dialog',
  templateUrl: 'remove.product.component.html',
})
export class RemoveProductComponent {
  bizId = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public fbutil: FirebaseUtil,
    private auth: AuthService
  ) {
    this.auth.afAuth.authState.subscribe((user) => {
      if (user) {
        this.bizId = user.uid;
      }
    });
  }

  submit() {
    this.fbutil
      .getProductRef(this.bizId)
      .doc(this.data.id)
      .delete()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }
}
