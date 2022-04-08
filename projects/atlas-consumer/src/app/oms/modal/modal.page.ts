import { Component } from '@angular/core';
import { AuthService, Client, Constants, FirebaseUtil } from 'atlas-core';
import firebase from 'firebase/app';
import { AppService } from '../../app.service';

@Component({
  selector: 'modal-page',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage {
  otpRequested = false;
  verifying = false;
  mobile: string = '';

  otp_1: '';
  otp_2: '';
  otp_3: '';
  otp_4: '';
  otp_5: '';
  otp_6: '';

  recaptchaVerifier: firebase.auth.RecaptchaVerifier;
  confirmationResult: firebase.auth.ConfirmationResult;

  constructor(private auth: AuthService, private service: AppService, private fbUtil: FirebaseUtil) { }

  otpController(event, next, prev) {
    if (event.target.value.length < 1 && prev) {
      prev.setFocus();
    } else if (next && event.target.value.length > 0) {
      next.setFocus();
    }
  }

  requestOTP() {
    if (!this.otpRequested) {
      this.otpRequested = true;

      if (!this.recaptchaVerifier) {
        this.recaptchaVerifier = this.auth.getRecaptcha('recaptcha-container');
      }

      this.auth
        .verifyUserMobile(this.mobile, this.recaptchaVerifier)
        .then((confirmationResult) => {
          this.confirmationResult = confirmationResult;
        })
        .catch((error) => {
          this.otpRequested = false;
        });
    } else {
      this.verifying = true;
      var code =
        this.otp_1 +
        this.otp_2 +
        this.otp_3 +
        this.otp_4 +
        this.otp_5 +
        this.otp_6;

      this.confirmationResult
        .confirm(code)
        .then((result) => {
          this.createUser(result.user.uid)
          this.service.closeModal('close');
        })
        .catch((error) => { })
        .finally(() => { this.verifying = false; });
    }
  }

  mobileChange() {
    this.otpRequested = false;
  }

  createUser(id) {
    var client = new Client();
    client.id = id;
    client.address.mobile = this.mobile;
    this.fbUtil
      .getInstance()
      .collection(Constants.USER)
      .doc(id)
      .set({ id: id, address: { mobile: this.mobile } }, { merge: true });
  }
}
