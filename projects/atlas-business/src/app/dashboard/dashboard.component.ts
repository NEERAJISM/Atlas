import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService, Business, Constants, FirebaseUtil } from 'atlas-core';
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

  business = new Business();

  menu: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: 'fas fa-chart-pie',
      link: '/dashboard/main',
    },
    {
      name: 'Business Profile',
      icon: 'fas fa-store',
      link: '/dashboard/profile',
    },
    {
      name: 'Orders',
      icon: 'fas fa-dolly',
      link: '/dashboard/orders',
    },
    {
      name: 'Biiling / Invoice',
      icon: 'fas fa-receipt pl-1',
      link: '/dashboard/invoice',
    },
    {
      name: 'Inventory',
      icon: 'fab fa-buffer pl-1',
      link: '/dashboard/inventory',
    },
    {
      name: 'Customer',
      icon: 'fas fa-users',
      link: '/dashboard/customers',
    },
    {
      name: '  Tax / GST',
      icon: 'fas fa-cog pl-1',
      link: '/dashboard/settings',
    },
    {
      name: 'Help / Support',
      icon: 'fas fa-headset',
      link: '/dashboard/support',
    },
  ];

  constructor(private service: AppService, private alertController: AlertController, private auth: AuthService, private fbUtil: FirebaseUtil) {
    this.isDesktop = service.isDesktop;
    this.init();
  }

  init() {
    this.auth.afAuth.authState.subscribe((user) => {
      if (user) {
        this.getProfile(user.uid);
      }
    });
  }

  go(url: string) {
    this.service.go(url);
  }

  toggleMenu() {
    this.showMenuName = !this.showMenuName;
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmation',
      message: 'Please confirm if you want to sign out.',
      buttons: [
        {
          text: 'Signout',
          handler: () => {
            this.auth.signOut().then(() => this.service.go(''));
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });
    await alert.present();
  }

  getProfile(id) {
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + id + '/' + Constants.INFO)
      .doc(id)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          Object.assign(this.business, doc.data());
        }
      });
  }
}
