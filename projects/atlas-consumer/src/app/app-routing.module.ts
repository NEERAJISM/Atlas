import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OmsComponent } from './oms/oms.component';
import { ProfileComponent } from './profile/profile.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'order',
    component: OmsComponent,
  },
  {
    path: 'account',
    component: AccountComponent,
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
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
export class AppRoutingModule {}
