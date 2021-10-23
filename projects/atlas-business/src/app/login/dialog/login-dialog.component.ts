import { AfterViewInit, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroupDirective, NgForm, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService, Constants, FirebaseUtil } from 'atlas-core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export class MismatchValidator {
  static mismatch(otherInputControl: AbstractControl): ValidatorFn {
    return (inputControl: AbstractControl): { [key: string]: boolean } | null => {
      if (inputControl.value !== undefined
        && inputControl.value.trim() !== ''
        && inputControl.value !== otherInputControl.value) {
        return { mismatch: true };
      }
      return null;
    };
  }
}

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent implements AfterViewInit {
  matcher = new MyErrorStateMatcher();
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  hide = true;
  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6)
  ]);

  hide2 = true;
  passwordFormControl2 = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    MismatchValidator.mismatch(this.passwordFormControl)
  ]);

  email: string;
  pass: string;
  pass2: string;
  isForgotPassword = false;

  isRegister = false;

  hasError = false;
  error = '';

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: boolean,
    private cdr: ChangeDetectorRef,
    private auth: AuthService
  ) {
    if (data) {
      this.onClickRegister();
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  onClickLogin() {
    this.hasError = false;

    if (!this.email || this.email.length === 0 || this.emailFormControl.hasError('email')) {
      this.hasError = true;
      this.error = 'Invalid Email Address!';
      return;
    }

    if (this.isForgotPassword) {
      this.auth.forgotPassword(this.email);
      return;
    }

    if (!this.pass || this.pass.length < 6) {
      this.hasError = true;
      this.error = 'Invalid Password!';
      return;
    }

    if (!this.isRegister) {
      this.auth.signIn(this.email, this.pass)
        .then((x) => {
          if (Constants.SUCCESS === x) {
            this.dialogRef.close();
          } else {
            this.hasError = true;
            this.error = FirebaseUtil.errorCodeToMessageMapper(x);
          }
        });
      return;
    }

    if (this.pass !== this.pass2) {
      this.hasError = true;
      this.error = 'Passwords do not match!';
      return;
    }

    if (this.isRegister) {
      this.auth.signUp(this.email, this.pass)
        .then((x) => {
          if (Constants.SUCCESS === x) {
            this.dialogRef.close();
          } else {
            this.hasError = true;
            this.error = FirebaseUtil.errorCodeToMessageMapper(x);
          }
        });
    }
  }

  onClickRegister() {
    this.isRegister = true;
    this.hasError = false;
  }

  forgotPassword() {
    this.isForgotPassword = true;
    this.hasError = false;
  }

  backToLogin() {
    this.isForgotPassword = false;
    this.isRegister = false;
    this.hasError = false;
  }

  passChange() {
    this.passwordFormControl2.updateValueAndValidity();
  }
}
