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
  @ViewChild('file') file: ElementRef;

  //TODO Remove
  url = 'http://localhost:49332';
  controllerSrc: any;

  bizId = '';
  backupProfile = new Profile();
  bizProfile = new Profile();

  editTitle = false;
  editIcon = false;
  editColor = false;
  editFontColor = false;

  home = 'true';

  icon;
  placeholder =
    'https://gravatar.com/avatar/dba6bae8c566f9d4041fb9cd9ada7741?d=identicon&f=y';
  imgFile;
  blob;

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
      if (user) {
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
      .downloadImage(Constants.PROFILE + '/' + this.bizId + '/icon')
      .subscribe((url) => {
        this.icon = url;
      });

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
        mode: 'Home',
      },
    });
    return await modal.present();
  }

  reload(order?: boolean) {
    setTimeout(
      () =>
        (this.iframe.nativeElement.src = this.url + (order ? '/order' : '')),
      2000
    );
  }

  edit_Title() {
    if (this.editTitle) {
      if (!this.bizProfile.title) {
        this.service.presentToast('Please enter a valid Company Name!');
        return;
      }

      if (this.bizProfile.title !== this.backupProfile.title) {
        this.updateProfile();
      }
    }
    this.editTitle = !this.editTitle;
  }

  edit_Icon() {
    if (this.editIcon) {
      if (this.blob) {
        this.service.presentLoading();
        this.fbUtil
          .uploadImage(
            this.blob,
            Constants.PROFILE + '/' + this.bizId + '/icon'
          )
          .then(() => {
            this.service.dismissLoading();
            this.reload();
          });
      }
    } else {
      this.file.nativeElement.click();
    }
    this.editIcon = !this.editIcon;
  }

  edit_Color() {
    if (this.editColor && this.bizProfile.color !== this.backupProfile.color) {
      this.updateProfile();
    }
    this.editColor = !this.editColor;
  }

  edit_FontColor() {
    if (
      this.editFontColor &&
      this.bizProfile.fontColor !== this.backupProfile.fontColor
    ) {
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

  onFileChanged(event) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }

    if (files[0].size > 200000) {
      this.imgFile = '';
      this.service.presentToast('Please select a file less than 200KB');
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.imgFile = '';
      this.service.presentToast(
        'Image format not supported, use either jpg/jpeg/png'
      );
      return;
    }

    this.blob = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (e) => {
      this.icon = reader.result;
    };
  }
}
