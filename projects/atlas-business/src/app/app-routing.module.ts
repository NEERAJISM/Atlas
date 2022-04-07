import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplashComponent } from 'atlas-core';
import { LandingComponent } from './landing/landing.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  // TODO default goto page + secure all links
  {
    path: '',
    component: LandingComponent,
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent,
    pathMatch: 'full'
  },
  {
    path: 'splash',
    component: SplashComponent,
  },  
  {
    path: 'dashboard',
    loadChildren: () => import(`./dashboard/dashboard-routing.module`).then(m => m.DashboardRoutingModule),
  },
  {
    // Always keep this in the END
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
