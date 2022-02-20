import { Component } from '@angular/core';
import { AuthService, Business, Constants, FirebaseUtil } from 'atlas-core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  isDesktop = true;
  step = 1;
  inProgress = false;

  first = '';
  last = '';

  name = '';
  email = '';
  profile = '';
  pass = '';
  pass2 = '';

  showPassword = false;

  constructor(
    private auth: AuthService,
    private app: AppService,
    private fbUtil: FirebaseUtil
  ) {
    this.isDesktop = app.isDesktop;
  }

  next() {
    if (this.step == 3) {
      this.checkIfAlreadyRegistered();
      return;
    }

    if (this.step == 4) {
      this.register();
      return;
    }
    this.step++;
  }

  back() {
    this.step--;
  }

  togglePasswordText() {
    this.showPassword = !this.showPassword;
  }

  checkEmail() {
    return !this.email || !Constants.mailRegEx.test(this.email);
  }

  checkPassword() {
    return this.pass.length < 8 || this.pass != this.pass2;
  }

  checkIfAlreadyRegistered() {
    this.inProgress = true;
    this.auth
      .checkIfAlreadyRegistered(this.email)
      .then((x) => {
        if (Constants.SUCCESS === x) {
          this.step++;
        } else {
          this.app.presentToast(
            Constants.FAILURE === x
              ? 'This Email is already registered!'
              : 'Error occurred  - ' + FirebaseUtil.errorCodeToMessageMapper(x)
          );
        }
      })
      .finally(() => (this.inProgress = false));
  }

  register() {
    this.inProgress = true;
    this.auth
      .signUp(this.email, this.pass)
      .then((x) => {
        if (Constants.SUCCESS === x[0]) {
          this.setupBusiness(x[1]);
        } else {
          this.app.presentToast(
            'Error occurred  - ' + FirebaseUtil.errorCodeToMessageMapper(x[0])
          );
        }
      })
      .finally(() => (this.inProgress = false));
  }

  setupBusiness(id: string) {
    const business = new Business();
    business.id = id;
    business.paid = false;
    business.profile = this.profile;
    business.name = this.name;
    business.email = this.email;

    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + business.id + '/' + Constants.INFO)
      .doc(business.id)
      .set(this.fbUtil.toJson(business))
      .then(() => {
          this.app.presentToast('Business Registered Successfully');
          this.app.go('/dashboard');
      })
      .catch(() =>
        this.app.presentToast(
          'Error occurred, Please check Internet connectivity'
        )
      );
  }
}
