import { NgModule } from '@angular/core';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { Constants } from 'atlas-core';
import { AccountComponent } from './account/account.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OmsComponent } from './oms/oms.component';
import { ProfileComponent } from './profile/profile.component';
import { SearchComponent } from './search/search.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);
const customDomain = window.location.host !== Constants.ATLAS_DOMAIN;

const routes: Routes = [
  {
    path: '',
    component: customDomain ? ProfileComponent : SearchComponent
  },
  {
    path:  customDomain ? 'order' : ':id/order',
    component: OmsComponent,
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: customDomain ? 'checkout' : ':id/checkout',
    component: CheckoutComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: ':id',
    component: ProfileComponent,
  },
  {
    // Always keep this in the END
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
