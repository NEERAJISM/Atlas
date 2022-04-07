import { NgModule } from '@angular/core';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { CustomersDashboardComponent } from './components/customers/customers.component';
import { InventoryDashboardComponent } from './components/inventory/inventory.component';
import { EditInvoiceComponent } from './components/invoice/edit/editinvoice.component';
import { InvoiceDashboardComponent } from './components/invoice/invoice.component';
import { MainDashboardComponent } from './components/maindashboard/maindashboard.component';
import { OrdersDashboardComponent } from './components/orders/orders.component';
import { ProfileDashboardComponent } from './components/profile/profile.component';
import { SettingsDashboardComponent } from './components/settings/settings.component';
import { SupportDashboardComponent } from './components/support/support.component';
import { DashboardComponent } from './dashboard.component';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['']);

const aboutRoutes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            {
                path: '',
                redirectTo: 'main',
                pathMatch: 'full'
            },
            {
                path: 'main',
                component: MainDashboardComponent,
                canActivate: [AngularFireAuthGuard],
                data: { authGuardPipe: redirectUnauthorizedToLogin },
            },
            {
                path: 'orders',
                component: OrdersDashboardComponent,
                canActivate: [AngularFireAuthGuard],
                data: { authGuardPipe: redirectUnauthorizedToLogin },
            },
            {
                path: 'invoice',
                component: InvoiceDashboardComponent,
                canActivate: [AngularFireAuthGuard],
                data: { authGuardPipe: redirectUnauthorizedToLogin },
            },
            {
                path: 'invoice/edit',
                component: EditInvoiceComponent,
                canActivate: [AngularFireAuthGuard],
                data: { authGuardPipe: redirectUnauthorizedToLogin },
            },
            {
                path: 'inventory',
                component: InventoryDashboardComponent,
                canActivate: [AngularFireAuthGuard],
                data: { authGuardPipe: redirectUnauthorizedToLogin },
            },
            {
                path: 'customers',
                component: CustomersDashboardComponent,
                canActivate: [AngularFireAuthGuard],
                data: { authGuardPipe: redirectUnauthorizedToLogin },
            },
            {
                path: 'settings',
                component: SettingsDashboardComponent,
                canActivate: [AngularFireAuthGuard],
                data: { authGuardPipe: redirectUnauthorizedToLogin },
            },
            {
                path: 'profile',
                component: ProfileDashboardComponent,
                canActivate: [AngularFireAuthGuard],
                data: { authGuardPipe: redirectUnauthorizedToLogin },
            },
            {
                path: 'support',
                component: SupportDashboardComponent,
                canActivate: [AngularFireAuthGuard],
                data: { authGuardPipe: redirectUnauthorizedToLogin },
            },
            {
                path: '**',
                redirectTo: 'main',
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(aboutRoutes)],
    exports: [RouterModule]
})
export class DashboardRoutingModule { }
