import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AtlasCoreModule } from 'atlas-core';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { IonicModule } from '@ionic/angular';
import { LandingComponent } from './landing/landing.component';
import { AppService } from './app.service';
import { ModalPage } from './landing/modal/modal.page';
import { RegisterComponent } from './register/register.component';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    AtlasCoreModule,
    FormsModule,
    BrowserAnimationsModule,
    DashboardModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    NgbModule,
    IonicModule.forRoot(),
  ],
  declarations: [LandingComponent, AppComponent, ModalPage, RegisterComponent],
  providers: [AppService],
  bootstrap: [AppComponent],
})
export class AppModule {}
