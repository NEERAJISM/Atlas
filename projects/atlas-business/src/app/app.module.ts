import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AtlasCoreModule } from 'atlas-core';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { LandingComponent } from './landing/landing.component';
import { ModalPage } from './landing/modal/modal.page';
import { RegisterComponent } from './register/register.component';
import { TermsComponent } from './terms/terms.component';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    AtlasCoreModule,
    FormsModule,
    BrowserAnimationsModule,
    DashboardModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    NgbModule,
    IonicModule.forRoot(),
  ],
  declarations: [LandingComponent, AppComponent, ModalPage, RegisterComponent, TermsComponent],
  providers: [AppService],
  bootstrap: [AppComponent],
})
export class AppModule { }
