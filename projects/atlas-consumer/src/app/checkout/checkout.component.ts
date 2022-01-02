import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AppService } from '../app.service';
import { ModalPage } from '../oms/modal/modal.page';
import { Location } from '@angular/common';
import { Profile } from 'atlas-core';

@Component({
  selector: 'app-account',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  profile: Profile;

  constructor(
    public modalController: ModalController,
    private service: AppService,
    private location: Location
  ) {
    // setTimeout(() => this.presentModal(), 700);
    this.profile = this.service.getProfile();
  }

  ngOnInit(): void {
    this.service.modalCloseEvent.subscribe((s) => {
      if (s === 'close') {
        this.modalController.dismiss();
      } else if (s === 'back') {
        this.location.back();
      }
    });
  }

  ngOnDestroy(): void {
    this.modalController.dismiss();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: ModalPage,
      backdropDismiss: false,
    });
    return await modal.present();
  }
}
