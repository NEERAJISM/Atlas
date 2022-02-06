import { Component } from '@angular/core';
import { AuthService, Constants, FirebaseUtil } from 'atlas-core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  step = 1;
  inProgress = false;

  first = 'Neeraj';
  last = 'Patidar';

  name = 'ABC';
  email = '8patidarneeraj@gmail.com';
  pass = '';
  pass2 = '';

  showPassword = false;

  constructor(private auth: AuthService, private app: AppService) {}

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
        if (Constants.SUCCESS === x) {
          this.app.presentToast('User Registered Successfully');
        } else {
          this.app.presentToast(
            'Error occurred  - ' + FirebaseUtil.errorCodeToMessageMapper(x)
          );
        }
      })
      .finally(() => (this.inProgress = false));
  }
}
