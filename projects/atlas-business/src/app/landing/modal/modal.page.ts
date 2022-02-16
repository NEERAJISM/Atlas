import { Component } from '@angular/core';
import { AuthService, Constants, FirebaseUtil } from 'atlas-core';
import { AppService } from '../../app.service';

@Component({
  selector: 'modal-page',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage {
  isDesktop = false;

  verifying = false;
  forgotPassword = false;

  email = '';
  pass = '';

  constructor(private auth: AuthService, private service: AppService) {
    this.isDesktop = service.isDesktop;
  }

  forgot() {
    this.forgotPassword = !this.forgotPassword;
  }

  submit() {
    if (!this.email || !Constants.mailRegEx.test(this.email)) {
      this.service.presentToast('Please enter a valid email address!');
      return;
    }

    if (!this.forgotPassword && this.pass.length < 6) {
      this.service.presentToast('Please enter a valid password!');
      return;
    }

    this.verifying = true;
    if (!this.forgotPassword) {
      this.auth.signIn(this.email, this.pass).then((x) => {
        if (Constants.SUCCESS === x) {
          this.service.closeModal('success');
        } else {
          this.service.presentToast(
            'Error occurred  - ' + FirebaseUtil.errorCodeToMessageMapper(x)
          );
        }
        this.verifying = false;
      });
    } else {
      this.auth
        .forgotPassword(this.email)
        .then(() =>
          this.service.presentToast(
            'Password reset email sent, check your inbox.'
          )
        )
        .catch((error) =>
          this.service.presentToast(
            'Error while sending password reset email - ' + error.message
          )
        )
        .finally(() => {
          this.verifying = false;
        });
    }
  }
}
