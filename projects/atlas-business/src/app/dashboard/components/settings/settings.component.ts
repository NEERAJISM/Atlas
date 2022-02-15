import { Component } from '@angular/core';
import { AuthService } from 'atlas-core';
import firebase from 'firebase/app';
import { AppService } from '../../../app.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
})
export class SettingsDashboardComponent {
  initialized = false;

  user: firebase.User;
  email = '';
  mobile = '';
  emailVerified = true;

  constructor(private auth: AuthService, private app: AppService) {
    this.app.presentLoading();  
    this.init();
  }

  init() {
    this.auth.afAuth.authState.subscribe((user) => {
      this.user = user;
      this.email = user.email;
      this.mobile = user.phoneNumber;
      this.emailVerified = user.emailVerified;
      this.initialized = true;
    });
  }

  verifyEmail(){
    this.user.sendEmailVerification().then(() => {
      this.app.presentToast('Verification email sent to : ' + this.user.email);
    }).catch(() => {
      this.app.presentToast('Error while sending verification email');
    });
  }
}
