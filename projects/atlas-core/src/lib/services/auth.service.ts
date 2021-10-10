import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { Constants } from '../constants';
import { CommonUtil } from './common.util';

@Injectable()
export class AuthService {
  userData: firebase.User;

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
    public util: CommonUtil
  ) {
    this.authSubscription();
  }

  authSubscription() {
    this.afAuth.authState.subscribe((user) => {
      this.userData = user;
      if (!this.userData) {
        this.router.navigateByUrl('');
      }
    });
  }

  signIn(email, password) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        this.accessDashboard();
        return Constants.SUCCESS;
        // this.setUserData(result.user);
      })
      .catch((error) => {
        return error.code;
      });
  }

  // Sign up with email/password
  signUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        this.accessDashboard();
        this.verifyEmail(result.user);
        return Constants.SUCCESS;
        // this.setUserData(result.user);
      })
      .catch((error) => {
        return error.code;
      });
  }

  accessDashboard() {
    this.ngZone.run(() => {
      this.router.navigateByUrl('/dashboard');
    });
  }

  verifyEmail(user?: firebase.User) {
    user
      .sendEmailVerification()
      .then(() =>
        this.util.showSnackBar(
          'Verification email sent to the registerd email-id',
          5000
        )
      )
      .catch(() =>
        this.util.showSnackBar(
          'Error while sending verification email, Please retry from Settings',
          5000
        )
      );
  }

  forgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() =>
        this.util.showSnackBar(
          'Password reset email sent, check your inbox.',
          5000
        )
      )
      .catch((error) =>
        this.util.showSnackBar(
          'Error while sending password reset email - ' + error.message,
          5000
        )
      );
  }

  get isLoggedIn(): boolean {
    return this.userData && this.userData !== null;
  }

  setUserData(user: firebase.User) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

  signOut() {
    this.storeUser(null);
    return this.afAuth.signOut().finally(() => this.router.navigateByUrl(''));
  }

  storeUser(user: firebase.User) {
    this.userData = user;
    if (user && user != null) {
      localStorage.setItem('user', JSON.stringify(this.userData));
    } else {
      localStorage.removeItem('user');
    }
  }

  getRecaptcha(id: string) {
    return new firebase.auth.RecaptchaVerifier(id, {
      size: 'invisible',
      callback: () => {
        console.log('captcha auto-resolved. sending verfication code...');
      },
    });
  }

  verifyUserMobile(mobile: string, verifier: firebase.auth.RecaptchaVerifier) {
    return this.afAuth.signInWithPhoneNumber('+91' + mobile, verifier);
  }
}
