import { NgModule } from '@angular/core';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonUtil } from './common.util';
import { FirebaseUtil } from './firebase.util';
import { SpinnerComponent } from './spinner/spinner.component';
import { SplashComponent } from './splash/splash.component';

@NgModule({
  imports: [
    AngularFirestoreModule.enablePersistence(),
    AngularFireStorageModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
  ],
  declarations: [SplashComponent, SpinnerComponent],
  exports: [SplashComponent, SpinnerComponent],
  providers: [CommonUtil, FirebaseUtil],
})
export class AtlasCoreModule {}
