import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Address, AuthService, Client, Constants, FirebaseUtil } from 'atlas-core';

@Component({
  selector: 'new-client-dialog',
  templateUrl: 'new.client.component.html',
  styleUrls: ['./new.client.component.scss'],
})
export class NewClientComponent {
  client: Client;
  states = Constants.states;

  action = 'Add Client';
  bizId = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public fbutil: FirebaseUtil,
    private auth: AuthService
  ) {
    if (data) {
      this.client = data;
      this.action = 'Update Client';
    } else {
      this.client = new Client();
      this.client.address = new Address();
    }

    this.auth.afAuth.authState.subscribe((user) => {
      if (user) {
        this.bizId = user.uid;
      }
    });
  }

  submit() {
    this.client.id =
      this.client.id && this.client.id.length > 0
        ? this.client.id
        : this.fbutil.getId();

    this.fbutil
      .getClientRef(this.bizId)
      .doc(this.client.id)
      .set(this.fbutil.toJson(this.client))
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }
}
