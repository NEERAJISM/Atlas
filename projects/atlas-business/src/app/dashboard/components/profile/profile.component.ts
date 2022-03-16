import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController } from '@ionic/angular';
import {
  AuthService,
  CommonUtil,
  Constants,
  FirebaseUtil,
  Page,
  Profile,
  Slides,
  Type,
} from 'atlas-core';
import { AppService } from '../../../app.service';
import { PageEditModal } from './modal/modal.page-edit';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileDashboardComponent implements OnInit {
  @ViewChild('profile') iframe: ElementRef;
  @ViewChild('file') file: ElementRef;
  @ViewChild('tColor') tColor: ElementRef;
  @ViewChild('fColor') fColor: ElementRef;

  //TODO Remove
  url = 'http://localhost:49792';
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

  // pages
  pages: Page[] = [];
  pageIds: string[] = [];
  pagesMap: Map<String, Page> = new Map();

  constructor(
    private sanitizer: DomSanitizer,
    private modalController: ModalController,
    private service: AppService,
    private fbUtil: FirebaseUtil,
    private auth: AuthService,
    private util: CommonUtil
  ) {
    this.service.presentLoading();
    this.init();
  }

  ngOnInit(): void {
    this.controllerSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      this.url
    );
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
        this.reload(false, true);
        this.modalController.dismiss();
        this.getPages();
      }
    });
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
          this.pageIds = this.bizProfile.pages;
        }
        // get pages
        this.getPages();
      });
  }

  getPages() {
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.bizId + '/' + Constants.PAGES)
      .get()
      .forEach((doc) => {
        doc.docs.forEach((i) => {
          if (i.data()) {
            var page = this.util.getPage((i.data() as Page).type);
            this.pagesMap.set(
              (i.data() as Page).id,
              Object.assign(page, i.data())
            );
          }
        });

        // sort
        this.pages = [];
        this.bizProfile.pages.forEach((id) => {
          this.pages.push(this.pagesMap.get(id));
        });
        this.service.dismissLoading();
      });
  }

  async presentModal(mode?: string, page?: Page) {
    const modal = await this.modalController.create({
      component: PageEditModal,
      cssClass: 'page-edit-modal',
      componentProps: {
        mode: mode,
        profile: this.bizProfile,
        page: page
      },
    });
    return await modal.present();
  }

  reload(order?: boolean, delay?: boolean) {
    if (!delay) {
      this.iframe.nativeElement.src = this.url + (order ? '/order' : '');
      return;
    }

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
            this.reload(false, true);
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

    if (this.editColor) {
      this.tColor.nativeElement.click();
    }
  }

  edit_FontColor() {
    if (
      this.editFontColor &&
      this.bizProfile.fontColor !== this.backupProfile.fontColor
    ) {
      this.updateProfile();
    }
    this.editFontColor = !this.editFontColor;

    if (this.editFontColor) {
      this.fColor.nativeElement.click();
    }
  }

  onItemReorder(event) {
    const itemMove = this.pageIds.splice(event.detail.from, 1)[0];
    this.pageIds.splice(event.detail.to, 0, itemMove);
    event.detail.complete();

    // update order in profile
    this.service.presentLoading();
    this.updatePageOrder();

    // refresh
    this.reload(false, true);
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
        this.reload(false, true);
        this.service.dismissLoading();
      });
  }

  onFileChanged(event) {
    const files = event.target.files;
    if (files.length === 0) {
      this.editIcon = false;
      return;
    }

    if (files[0].size > 200000) {
      this.imgFile = '';
      this.service.presentToast('Please select a file less than 200KB');
      this.editIcon = false;
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.imgFile = '';
      this.service.presentToast(
        'Image format not supported, use either jpg/jpeg/png'
      );
      this.editIcon = false;
      return;
    }

    this.blob = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (e) => {
      this.icon = reader.result;
    };
  }

  deletePage(id) {
    this.service.presentLoading();

    // update profile
    var index = this.pageIds.indexOf(id);
    this.pageIds.splice(index, 1);
    this.updatePageOrder();

    // delete page
    this.pages.splice(index, 1);
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.bizId + '/' + Constants.PAGES)
      .doc(id)
      .delete();

    // update Map
    var tmp = this.pagesMap.get(id);
    this.pagesMap.delete(id);

    // delete images
    if (tmp.type === Type.Slides) {
      (tmp as Slides).slides.forEach((slide) => {
        this.fbUtil.deleteImage(
          Constants.PAGES + '/' + this.bizId + '/' + tmp.id + '/' + slide.id
        );
      });
    } else {
      this.fbUtil.deleteImage(Constants.PAGES + '/' + this.bizId + '/' + id);
    }

    // reload + init
    this.reload(false, true);
  }

  updatePageOrder() {
    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + this.bizId + '/' + Constants.PROFILE
      )
      .doc(this.bizId)
      .update({ pages: this.pageIds })
      .catch(() =>
        this.service.presentToast(
          'Error occurred, Please check Internet connectivity'
        )
      )
      .finally(() => {
        this.service.dismissLoading();
      });
  }
}
