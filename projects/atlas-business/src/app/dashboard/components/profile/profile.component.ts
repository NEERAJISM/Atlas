import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import { AuthService, Constants, FirebaseUtil, Profile } from 'atlas-core';
import { AppService } from '../../../app.service';
import { PageEditModal } from './modal/modal.page-edit';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileDashboardComponent implements OnInit {
  @ViewChild('profile') iframe: ElementRef;

  //TODO Remove
  url = 'http://localhost:49332';
  controllerSrc: any;

  bizId = '';
  backupProfile = new Profile();
  bizProfile = new Profile();

  editTitle = false;
  editColor = false;
  editFontColor = false;

  home = "true";

  constructor(
    private sanitizer: DomSanitizer,
    private modalController: ModalController,
    private service: AppService,
    private fbUtil: FirebaseUtil,
    private auth: AuthService
  ) {
    this.service.presentLoading();
    //this.presentModal();
    this.init();
  }

  init() {
    this.auth.afAuth.authState.subscribe((user) => {
      if(user) {
        this.bizId = user.uid;
        this.getProfile();
      }
    });

    this.service.modalProfileCloseEvent.subscribe((s) => {
      if (s === 'success') {
        this.reload();
        this.modalController.dismiss();
      }
    });
  }

  ngOnInit(): void {
    this.controllerSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.url
    );
  }

  getProfile() {
    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + this.bizId + '/' + Constants.PROFILE
      )
      .doc(this.bizId)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          Object.assign(this.bizProfile, doc.data());
          Object.assign(this.backupProfile, doc.data());
        }    
        this.service.dismissLoading();
      });
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: PageEditModal,
      cssClass: 'page-edit-modal',
      componentProps: {
        'mode': 'Home'
      }
    });
    return await modal.present();
  }

  reload(order?: boolean) {
    this.iframe.nativeElement.src = this.url + ( order ? '/order': '');
  }

  edit_Title() {
    if(this.editTitle) {
      if(!this.bizProfile.title) {
        this.service.presentToast('Please enter a valid Company Name!');
        return;
      }
  
      if(this.bizProfile.title !== this.backupProfile.title) {
        this.updateProfile();
      }
    }
    this.editTitle = !this.editTitle;
  }

  edit_Color() {
    if(this.editColor && this.bizProfile.color !== this.backupProfile.color) {
        this.updateProfile();
    }
    this.editColor = !this.editColor;
  }

  edit_FontColor() {
    if(this.editFontColor && this.bizProfile.fontColor !== this.backupProfile.fontColor) {
        this.updateProfile();
    }
    this.editFontColor = !this.editFontColor;
  }

  onItemReorder(ev) {
    ev.detail.complete();
  }

  updateProfile() {
    this.service.presentLoading();

    //TODO add is valid check on data to be uploaded

    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + this.bizId + '/' + Constants.PROFILE
      )
      .doc(this.bizId)
      .set(this.fbUtil.toJson(this.bizProfile))
      .catch(() =>
        this.service.presentToast(
          'Error occurred, Please check Internet connectivity'
        )
      )
      .finally(() => {
        this.reload();
        this.service.dismissLoading();
      });
  }
}
