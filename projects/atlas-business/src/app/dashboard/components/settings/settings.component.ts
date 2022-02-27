import { Component } from '@angular/core';
import { AuthService, Business, Constants, FirebaseUtil } from 'atlas-core';
import firebase from 'firebase/app';
import { AppService } from '../../../app.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
})
export class SettingsDashboardComponent {
  initialized = false;

  user: firebase.User;
  business: Business = new Business();
  profileOld = '';

  emailVerified = true;
  editMobile = false;
  editProfile = false;
  editBName = false;
  editBYear = false;
  editBGST = false;
  editBPIN = false;

  constructor(private auth: AuthService, private app: AppService, private fbUtil: FirebaseUtil) {
    this.app.presentLoading();  
    this.init();
  }

  init() {
    this.auth.afAuth.authState.subscribe((user) => {
      if(user) {
        this.user = user;
        this.emailVerified = user.emailVerified;
        this.getBusinessInfo();
      }
    });
  }

  getBusinessInfo(){
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.user.uid+ '/' + Constants.INFO)
      .doc(this.user.uid)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          Object.assign(this.business, doc.data());
        }
        this.initialized = true;
        this.app.dismissLoading();
      });

  }

  verifyEmail(){
    this.user.sendEmailVerification().then(() => {
      this.app.presentToast('Verification email sent to : ' + this.user.email);
    }).catch(() => {
      this.app.presentToast('Error while sending verification email');
    });
  }

  editMob(){
    if(this.editMobile) {
      this.updateBusinessInfo();
    }
    this.editMobile = !this.editMobile;
  }

  edit_Profile(){
    if(this.editProfile) {
      this.updateBusinessInfo();
      if(!this.business.profile || this.business.profile.length < 6 || !Constants.usernameRegEx.test(this.business.profile)) {
        this.app.presentToast("Please enter a valid username - min 6 characters, special char '.' or '_'");
        this.business.profile = this.profileOld;
        return;
      }
    }

    this.profileOld = this.business.profile;
    this.editProfile = !this.editProfile;
  }

  edit_BName(){
    if(this.editBName) {
      this.updateBusinessInfo();
    }
    this.editBName = !this.editBName;
  }

  edit_BYear(){
    if(this.editBYear) {
      this.updateBusinessInfo();
    }
    this.editBYear = !this.editBYear;
  }

  edit_BGST(){
    if(this.editBGST) {
      this.updateBusinessInfo();
    }
    this.editBGST = !this.editBGST;
  }

  edit_BPIN(){
    if(this.editBPIN) {
      this.updateBusinessInfo();
    }
    this.editBPIN = !this.editBPIN;
  }

  updateBusinessInfo(){
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.business.id + '/' + Constants.INFO)
      .doc(this.business.id)
      .set(this.fbUtil.toJson(this.business))
      .catch(() =>
        this.app.presentToast(
          'Error occurred, Please check Internet connectivity'
        )
      );
  }

}
