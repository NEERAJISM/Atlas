import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FirebaseUtil } from 'atlas-core';

@Component({
  selector: 'remove-client-dialog',
  templateUrl: 'remove.client.component.html',
})
export class RemoveClientComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public fbutil: FirebaseUtil
  ) {}

  submit() {
    this.fbutil
      .getClientRef('bizId')
      .doc(this.data.id)
      .delete()
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }
}
