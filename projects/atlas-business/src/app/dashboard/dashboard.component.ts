import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

export interface MenuItem {
  name: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],

  animations: [
    trigger('openClose', [
      state('open', style({})),
      state('closed', style({})),
      transition('open => closed', [animate('1s')]),
      transition('closed => open', [animate('0.5s')]),
    ]),
  ],
})
export class DashboardComponent implements OnInit {
  title = 'atlas-dashboard';

  showFiller = false;
  showMenuName = false;

  menu: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: 'fas fa-chart-pie mr-2',
      link: '/dashboard/main',
    },
    {
      name: 'Orders',
      icon: 'fas fa-dolly mr-2',
      link: '/dashboard/orders',
    },
    {
      name: 'Biiling / Invoice',
      icon: 'fas fa-receipt pl-1 mr-2',
      link: '/dashboard/invoice',
    },
    {
      name: 'Inventory',
      icon: 'fab fa-buffer pl-1 mr-2',
      link: '/dashboard/inventory',
    },
    {
      name: 'Customer',
      icon: 'fas fa-users mr-2',
      link: '/dashboard/customers',
    },
    {
      name: '  Tax / GST',
      icon: 'fas fa-rupee-sign mr-2 ml-1',
      link: '/dashboard/tax',
    },
    {
      name: 'Business Profile',
      icon: 'fas fa-globe-americas mr-2 ml-1',
      link: '/dashboard/profile',
    },
    {
      name: 'Help / Support',
      icon: 'fas fa-headset mr-2',
      link: '/dashboard/support',
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {}

  toggleMenu() {
    this.showMenuName = !this.showMenuName;
  }
}
