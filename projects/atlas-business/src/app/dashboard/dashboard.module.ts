import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { ChartsModule } from 'ng2-charts';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import {MatTabsModule} from '@angular/material/tabs';

import { DashboardComponent } from './dashboard.component';
import { DashboardHeaderComponent } from './header/header.component';
import { LogoutDialogComponent } from './header/header.component';

import { DashboardRoutingModule } from './dashboard-routing.module';

import { MainDashboardComponent } from './components/maindashboard/maindashboard.component';
import { InvoiceDashboardComponent } from './components/invoice/invoice.component';
import { EditInvoiceComponent } from './components/invoice/edit/editinvoice.component';
import { InventoryDashboardComponent } from './components/inventory/inventory.component';
import { CustomersDashboardComponent } from './components/customers/customers.component';
import { SettingsDashboardComponent } from './components/settings/settings.component';
import { SupportDashboardComponent } from './components/support/support.component';
import { NewClientComponent } from './components/customers/new/new.client.component';
import { RemoveClientComponent } from './components/customers/remove/remove.client.component';
import { NewProductComponent } from './components/inventory/new/new.product.component';
import { RemoveProductComponent } from './components/inventory/remove/remove.product.component';
import { InvoiceService } from './components/invoice/invoice.service';
import { OrdersDashboardComponent } from './components/orders/orders.component';
import { AtlasCoreModule } from 'atlas-core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { IonicModule } from '@ionic/angular';
import { AppService } from '../app.service';
import { ProfileDashboardComponent } from './components/profile/profile.component';
import { PageEditModal } from './components/profile/modal/modal.page-edit';
import { PdfModal } from './components/invoice/edit/modal/modal.pdf';

@NgModule({
  imports: [
    AtlasCoreModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ChartsModule,
    DashboardRoutingModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    PdfViewerModule,
    IonicModule.forRoot()
  ],
  declarations: [
    DashboardComponent,
    DashboardHeaderComponent,
    LogoutDialogComponent,
    MainDashboardComponent,
    InvoiceDashboardComponent,
    EditInvoiceComponent,
    InventoryDashboardComponent,
    CustomersDashboardComponent,
    SettingsDashboardComponent,
    OrdersDashboardComponent,
    SupportDashboardComponent,
    NewClientComponent,
    RemoveClientComponent,
    NewProductComponent,
    RemoveProductComponent,
    ProfileDashboardComponent,
    PageEditModal,
    PdfModal
  ],
  exports: [
    DashboardComponent,
    DashboardHeaderComponent,
    LogoutDialogComponent,
    MainDashboardComponent,
    InvoiceDashboardComponent,
    EditInvoiceComponent,
    InventoryDashboardComponent,
    CustomersDashboardComponent,
    SettingsDashboardComponent,
    SupportDashboardComponent,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    InvoiceService, AppService  ]
})
export class DashboardModule { }
