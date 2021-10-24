import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './services/auth.service';
import { CommonUtil } from './services/common.util';
import { FirebaseUtil } from './services/firebase.util';
import { SpinnerComponent } from './spinner/spinner.component';
import { SplashComponent } from './splash/splash.component';

@NgModule({
  imports: [
    AngularFireAuthModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireStorageModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  declarations: [SplashComponent, SpinnerComponent],
  exports: [SplashComponent, SpinnerComponent],
  providers: [CommonUtil, AuthService, FirebaseUtil],
})
export class AtlasCoreModule {}
