import { Injectable, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument
} from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { Constants } from '../constants';
import { CommonUtil } from './common.util';

@Injectable()
export class AuthService {
  userData: firebase.User;

  constructor(
    public afs: AngularFirestore,
    public afAuth: AngularFireAuth,
    public ngZone: NgZone,
    public util: CommonUtil
  ) {
    this.authSubscription();
  }

  getUserId() {
    return this.afAuth.user;
  }

  authSubscription() {
    this.afAuth.authState.subscribe((user) => {
      this.userData = user;
    });
  }

  checkIfAlreadyRegistered(email: string) {
    return this.afAuth
      .fetchSignInMethodsForEmail(email)
      .then((x) => {
        return x.length == 0 ? Constants.SUCCESS : Constants.FAILURE;
      })
      .catch((error) => {
        return error.code;
      });
  }

  signIn(email, password) {
    return this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((result) => {
        return Constants.SUCCESS;
      })
      .catch((error) => {
        return error.code;
      });
  }

  signUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        result.user.sendEmailVerification();
        return Constants.SUCCESS;
      })
      .catch((error) => {
        return error.code;
      });
  }

  forgotPassword(passwordResetEmail: string) {
    return this.afAuth.sendPasswordResetEmail(passwordResetEmail);
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
    this.userData = undefined;
    return this.afAuth.signOut();
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
