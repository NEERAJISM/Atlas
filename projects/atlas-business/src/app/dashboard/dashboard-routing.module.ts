import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { MainDashboardComponent } from './components/maindashboard/maindashboard.component';
import { InvoiceDashboardComponent } from './components/invoice/invoice.component';
import { InventoryDashboardComponent } from './components/inventory/inventory.component';
import { CustomersDashboardComponent } from './components/customers/customers.component';
import { SettingsDashboardComponent } from './components/settings/settings.component';
import { SupportDashboardComponent } from './components/support/support.component';
import { EditInvoiceComponent } from './components/invoice/edit/editinvoice.component';
import { OrdersDashboardComponent } from './components/orders/orders.component';
import { ProfileDashboardComponent } from './components/profile/profile.component';

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
        },
        {
            path: 'orders',
            component: OrdersDashboardComponent,
        },
        {
            path: 'invoice',
            component: InvoiceDashboardComponent,
        },
        {
            path: 'invoice/edit',
            component: EditInvoiceComponent,
        },
        {
            path: 'inventory',
            component: InventoryDashboardComponent,
        },
        {
            path: 'customers',
            component: CustomersDashboardComponent,
        },
        {
            path: 'settings',
            component: SettingsDashboardComponent,
        },
        {
            path: 'profile',
            component: ProfileDashboardComponent,
        },
        {
            path: 'support',
            component: SupportDashboardComponent,
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
export class DashboardRoutingModule {}
