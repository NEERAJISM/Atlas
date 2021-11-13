import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { AtlasCoreModule } from 'atlas-core';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';
import { SearchComponent } from './search/search.component';

@NgModule({
  imports: [
    AtlasCoreModule,
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatBadgeModule,
    MatStepperModule,
    MatInputModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatTabsModule,
    MatRadioModule,
    MatAutocompleteModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  declarations: [AppComponent, ProfileComponent, SearchComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
