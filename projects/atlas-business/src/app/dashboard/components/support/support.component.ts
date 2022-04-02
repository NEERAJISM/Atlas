import { Component } from '@angular/core';
import { AuthService, Business, Constants, FirebaseUtil } from 'atlas-core';
import { AppService } from '../../../app.service';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
})
export class SupportDashboardComponent {

  delim = '~#~';
  title = '';
  desc = ''

  isInitialized = false;
  business = new Business();

  scriptURL =
    'https://script.google.com/macros/s/AKfycbykzEyyhN5PSN_1Ppoc_CUoJj6m1bPGmn0BzZ0SzUjW7QcxlRA-EskVvyU7PcNNqWmf/exec';

  constructor(private service: AppService, private fbUtil: FirebaseUtil, private auth: AuthService) {
    this.init();
  }

  init() {
    this.auth.afAuth.authState.subscribe((user) => {
      if (user) {
        this.getBusiness(user.uid);
      }
    });
  }

  getBusiness(id) {
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + id + '/' + Constants.INFO)
      .doc(id)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          Object.assign(this.business, doc.data());
          this.isInitialized = true;
        }
      });
  }

  submit() {
    this.title = this.title.trim();
    this.desc = this.desc.trim();

    if (!this.title) {
      this.service.presentToast('Please enter title of your query!');
      return;
    }

    if (!this.desc || this.desc.length < 20) {
      this.service.presentToast('Please enter a valid description (min length 20)!');
      return;
    }

    var input = {
      Detail$:
        this.business.name +
        this.delim +
        this.business.address.mobile +
        this.delim +
        this.business.address.email +
        this.delim +
        this.title +
        this.delim +
        this.desc +
        '^^',
    };

    this.service.presentLoading();
    fetch(this.scriptURL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(input),
    })
      .then((response) =>
        this.service.presentToast(
          "Your query has been raised. We'll get back you soon!"
        )
      )
      .catch((error) =>
        this.service.presentToast(
          'Error occurred, Please check your internet connection!'
        )
      )
      .finally(() => {
        this.service.dismissLoading();
        setTimeout(() => window.location.reload(), 3000);
      });
  }

}
