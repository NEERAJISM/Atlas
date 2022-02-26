import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { AppService } from '../../../app.service';
import { PageEditModal } from './modal/modal.page-edit';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileDashboardComponent implements OnInit {
@ViewChild('profile') iframe : ElementRef;

  //TODO Remove
  url = 'http://localhost:61586';
  controllerSrc: any;

  title = 'Lakecity';
  editTitle = false;

  constructor(private sanitizer: DomSanitizer, public modalController: ModalController, private service: AppService){
    this.presentModal();

    this.service.modalProfileCloseEvent.subscribe((s) => {
      if (s === 'success') {
        this.reload();
        this.modalController.dismiss();
      }
    })
  }

  ngOnInit(): void {
    this.controllerSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  async presentModal() {
    

    const modal = await this.modalController.create({
      component: PageEditModal,
      cssClass: 'page-edit-modal',
    });
    return await modal.present();
  }

  reload(){
    this.iframe.nativeElement.src = this.iframe.nativeElement.src;
  }

  edit_Title(){
    this.editTitle = !this.editTitle;
  }

  onItemReorder(ev) {
    ev.detail.complete();
}
}
