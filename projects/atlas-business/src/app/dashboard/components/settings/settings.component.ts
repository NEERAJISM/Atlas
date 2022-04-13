import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from '@ionic/angular';
import { AuthService, Business, Constants, FirebaseUtil } from 'atlas-core';
import firebase from 'firebase/app';
import { AppService } from '../../../app.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
})
export class SettingsDashboardComponent {
  @ViewChild('file') file: ElementRef;

  initialized = false;

  user: firebase.User;
  backup: Business = new Business();
  business: Business = new Business();

  emailVerified;
  editMobile = false;
  editProfile = false;
  editBName = false;
  editBYear = false;
  editBGST = false;
  editBPhone = false;
  editBAddress = false;
  editBLocation = false;

  locationSrc: any;

  editIcon = false;
  icon;
  placeholder = 'https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y';
  imgFile;
  blob;

  constructor(private auth: AuthService, private app: AppService, private fbUtil: FirebaseUtil, private sanitizer: DomSanitizer, private alertController: AlertController) {
    this.app.presentLoading();
    this.init();
    this.updateLocationUrl();
  }

  init() {
    this.auth.afAuth.authState.subscribe((user) => {
      if (user) {
        this.user = user;
        this.emailVerified = user.emailVerified;
        this.getBusinessInfo();
      }
    });
  }

  getBusinessInfo() {
    this.fbUtil
      .downloadImage(Constants.PROFILE + '/' + this.user.uid + '/icon')
      .subscribe((url) => {
        this.icon = url;
      });

    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.user.uid + '/' + Constants.INFO)
      .doc(this.user.uid)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          Object.assign(this.business, doc.data());
          this.backup = JSON.parse(JSON.stringify(doc.data()));
          this.updateLocation();
        }
        this.initialized = true;
        this.app.dismissLoading();
      });
  }

  updateLocation() {
    if (this.business.address.location && this.business.address.location.includes('src=')) {
      var tags = this.business.address.location.split(' ');
      tags.filter(tag => tag.startsWith('src=')).find(src => this.updateLocationUrl(src.slice(5, src.length - 1)));
    } else {
      this.updateLocationUrl();
    }
  }

  updateLocationUrl(url?: string): void {
    this.locationSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      url ? url : 'https://www.google.com/maps/embed'
    );
  }

  verifyEmail() {
    this.user.sendEmailVerification().then(() => {
      this.app.presentToast('Verification email sent to : ' + this.user.email);
    }).catch(() => {
      this.app.presentToast('Error while sending verification email');
    });
  }

  async resetPassword() {
    const alert = await this.alertController.create({
      header: 'Update Password',
      inputs: [
        {
          name: 'current',
          type: 'password',
          placeholder: "Current Password"
        },
        {
          name: 'new1',
          type: 'password',
          placeholder: "New Password (min 8 length)"
        },
        {
          name: 'new2',
          type: 'text',
          placeholder: "Confirm New Password"
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Update Password',
          handler: (alertData) => {
            if (alertData.current === alertData.new1) {
              this.app.presentToast("Please enter a different new password");
              return false;
            }

            if (!alertData.new1 || alertData.new1.trim().length < 8) {
              this.app.presentToast('Please enter a valid new password!');
              return false;
            }

            if (alertData.new1 !== alertData.new2) {
              this.app.presentToast("New Passwords don't match");
              return false;
            }

            this.app.presentLoading();
            this.auth.resetPassword(alertData.current, alertData.new1)
              .then((x) => {
                if(x === Constants.SUCCESS) {
                  this.app.presentToast("Password changed successfully!");
                  alert.dismiss();
                } else if( x === "Invalid") {
                  this.app.presentToast("Please Enter a valid current password");
                } else {
                  this.app.presentToast("Error occurred");
                }
              })
              .finally(() => {
                this.app.dismissLoading();
              });
            return false;
          },
        },
      ],
    });
    await alert.present();
  }

  editMob() {
    if (this.editMobile) {
      if (this.business.address.mobile === this.backup.address.mobile) {
        this.editProfile = false;
        return;
      }

      if (this.business.address.mobile.trim().length !== 10) {
        this.app.presentToast('Invalid Mobile number!!');
        this.business.address.mobile = this.backup.address.mobile;
        return;
      }
      this.updateBusinessInfo({ 'address.mobile': this.business.address.mobile });
    }
    this.editMobile = !this.editMobile;
  }

  edit_Profile() {
    if (this.editProfile) {
      if (this.business.profile === this.backup.profile) {
        this.editProfile = false;
        return;
      }

      if (!this.business.profile || this.business.profile.length < 6 || !Constants.usernameRegEx.test(this.business.profile)) {
        this.app.presentToast("Please enter a valid username - min 6 characters, only letter, number or '-'");
        this.business.profile = this.backup.profile;
        return;
      }

      // check if name exists
      this.fbUtil
        .getInstance()
        .collection(Constants.PROFILE)
        .doc(this.business.profile)
        .get()
        .subscribe((doc) => {
          if (doc.exists) {
            this.app.presentToast("This username is not available!");
            return;
          }
          this.updateBusinessInfo({ profile: this.business.profile });
          this.app.updateProfile(this.business.id, this.business.profile, this.backup.profile);
          this.editProfile = false;
        },
          error => {
            this.app.presentToast("This username is not available!");
            return;
          });
    }

    if (!this.editProfile) {
      this.editProfile = true;
    }
  }

  edit_BName() {
    if (this.editBName) {
      if (this.business.name === this.backup.name) {
        this.editProfile = false;
        return;
      }

      if (this.business.name.trim().length === 0) {
        this.app.presentToast('Invalid Name!!');
        this.business.name = this.backup.name;
        return;
      }
      this.updateBusinessInfo({ name: this.business.name });
    }
    this.editBName = !this.editBName;
  }

  edit_BYear() {
    if (this.editBYear) {
      if (this.business.year === this.backup.year) {
        this.editProfile = false;
        return;
      }

      if (this.business.year.toString().length !== 4) {
        this.app.presentToast('Invalid year!!');
        this.business.year = this.backup.year;
        return;
      }
      this.updateBusinessInfo({ year: this.business.year });
    }
    this.editBYear = !this.editBYear;
  }

  edit_BGST() {
    if (this.editBGST) {
      if (this.business.gst === this.backup.gst) {
        this.editProfile = false;
        return;
      }

      if (this.business.gst.trim().length !== 15) {
        this.app.presentToast('Invalid GST Number!!');
        this.business.gst = this.backup.gst;
        return;
      }
      this.updateBusinessInfo({ gst: this.business.gst });
    }
    this.editBGST = !this.editBGST;
  }

  edit_BPhone() {
    if (this.editBPhone) {
      if (this.business.address.phone === this.backup.address.phone) {
        this.editProfile = false;
        return;
      }

      if (this.business.address.phone.trim().length === 0) {
        this.app.presentToast('Invalid Phone Number!!');
        this.business.address.phone = this.backup.address.phone;
        return;
      }
      this.updateBusinessInfo({ 'address.phone': this.business.address.phone });
    }
    this.editBPhone = !this.editBPhone;
  }

  edit_BAddress() {
    if (this.editBAddress) {

      if (
        this.business.address.line1 === this.backup.address.line1 &&
        this.business.address.line2 === this.backup.address.line2 &&
        this.business.address.pin === this.backup.address.pin &&
        this.business.address.district === this.backup.address.district &&
        this.business.address.state === this.backup.address.state
      ) {
        this.editProfile = false;
        return;
      }

      if (
        this.business.address.line1.trim().length === 0 ||
        this.business.address.pin.toString().trim().length !== 6 ||
        this.business.address.district.trim().length === 0 ||
        this.business.address.state.trim().length === 0
      ) {
        this.app.presentToast('Invalid Address!!');
        this.business.address.line1 = this.backup.address.line1;
        this.business.address.line2 = this.backup.address.line2;
        this.business.address.pin = this.backup.address.pin;
        this.business.address.district = this.backup.address.district;
        this.business.address.state = this.backup.address.state;
        return;
      }
      this.updateBusinessInfo({
        'address.line1': this.business.address.line1,
        'address.line2': this.business.address.line2,
        'address.pin': this.business.address.pin,
        'address.district': this.business.address.district,
        'address.state': this.business.address.state
      });
    }
    this.editBAddress = !this.editBAddress;
  }

  edit_BLocation() {
    if (this.editBLocation) {
      if (this.business.address.location === this.backup.address.location) {
        this.editProfile = false;
        return;
      }

      if (this.business.address.location.trim().length === 0) {
        this.app.presentToast('Invalid Location!!');
        this.business.address.location = this.backup.address.location;
        return;
      }
      this.updateBusinessInfo({ 'address.location': this.business.address.location });
      this.updateLocation();
    }
    this.editBLocation = !this.editBLocation;
  }

  updateBusinessInfo(update) {
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.business.id + '/' + Constants.INFO)
      .doc(this.business.id)
      .update(update)
      .then(() => this.backup = JSON.parse(JSON.stringify(this.business)))
      .catch(() =>
        this.app.presentToast(
          'Error occurred, Please check Internet connectivity'
        )
      );
  }

  onFileChanged(event) {
    const files = event.target.files;
    if (files.length === 0) {
      this.editIcon = false;
      return;
    }

    if (files[0].size > 200000) {
      this.imgFile = '';
      this.app.presentToast('Please select a file less than 200KB');
      this.editIcon = false;
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.imgFile = '';
      this.app.presentToast(
        'Image format not supported, use either jpg/jpeg/png'
      );
      this.editIcon = false;
      return;
    }

    this.blob = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (e) => {
      this.icon = reader.result;
    };
  }

  edit_Icon() {
    if (this.editIcon) {
      if (this.blob) {
        this.app.presentLoading();
        this.fbUtil
          .uploadImage(
            this.blob,
            Constants.PROFILE + '/' + this.user.uid + '/icon'
          )
          .then(() => {
            this.app.dismissLoading();
          });
      }
    } else {
      this.file.nativeElement.click();
    }
    this.editIcon = !this.editIcon;
  }
}
