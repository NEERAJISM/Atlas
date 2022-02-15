import { Component } from '@angular/core';
import { AppService } from '../app.service';

export interface MenuItem {
  name: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  title = 'atlas-dashboard';
  isDesktop = false;

  showFiller = false;
  showMenuName = false;

  menu: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: 'fas fa-chart-pie',
      link: '/dashboard/main',
    },
    {
      name: 'Business Profile',
      icon: 'fas fa-globe-americas',
      link: '/dashboard/profile',
    },
    {
      name: 'Orders',
      icon: 'fas fa-dolly',
      link: '/dashboard/orders',
    },
    {
      name: 'Biiling / Invoice',
      icon: 'fas fa-receipt ps-1',
      link: '/dashboard/invoice',
    },
    {
      name: 'Inventory',
      icon: 'fab fa-buffer ps-1',
      link: '/dashboard/inventory',
    },
    {
      name: 'Customer',
      icon: 'fas fa-users',
      link: '/dashboard/customers',
    },
    {
      name: '  Tax / GST',
      icon: 'fas fa-cog ps-1',
      link: '/dashboard/settings',
    },
    {
      name: 'Help / Support',
      icon: 'fas fa-headset',
      link: '/dashboard/support',
    },
  ];

  constructor(private service: AppService) {
    this.isDesktop = service.isDesktop;
  }

  go(url: string) {
    this.service.go(url);
  }

  toggleMenu() {
    this.showMenuName = !this.showMenuName;
  }
}
