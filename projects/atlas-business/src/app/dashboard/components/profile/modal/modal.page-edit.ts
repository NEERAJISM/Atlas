import { Component, Input, OnInit } from '@angular/core';
import {
  Constants,
  Contact,
  FirebaseUtil,
  Full,
  Info,
  Profile,
  Slides,
  Team,
  Type,
  Text,
  Video,
} from 'atlas-core';
import { AppService } from 'projects/atlas-business/src/app/app.service';

@Component({
  selector: 'page-edit-modal',
  templateUrl: './modal.page-edit.html',
})
export class PageEditModal implements OnInit {
  @Input() mode: string;
  @Input() profile: Profile;
  @Input() iType: string;
  @Input() iText: Text;
  @Input() iInfo: Info;

  isHome = false;
  isContact = false;
  isOther = false;
  isEdit = false;

  pageTitle = '';
  pageType = '';
  contact = new Contact();
  full = new Full();
  info = new Info();
  slides = new Slides();
  team = new Team();
  text = new Text();
  video = new Video();

  //form
  fullUrl = 'assets/images/profile/white.jpg';
  fullImgFile;
  fullBlob;

  infoUrl = 'assets/images/profile/white.jpg';
  infoImgFile;
  infoBlob;

  constructor(private appService: AppService, private fbUtil: FirebaseUtil) {
    this.appService.presentLoading();
  }

  ngOnInit(): void {
    if (this.mode === 'Home') {
      this.isHome = true;
    } else if (this.mode === 'Contact') {
      this.isContact = true;
    } else {
      this.isOther = true;
    }

    this.iType
      ? (this.pageType = this.iType)
      : (this.pageType = Type.Full.toString());

    this.full = this.profile.home;
    this.isHome ? this.getProfile() : this.appService.dismissLoading();
  }

  getProfile() {
    this.fbUtil
      .downloadImage(Constants.PROFILE + '/' + this.profile.id + '/home')
      .subscribe((url) => {
        this.fullUrl = url;
        this.appService.dismissLoading();
      });
  }

  onFileChangedFull(event) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }

    if (files[0].size > 5000000) {
      this.fullImgFile = '';
      this.appService.presentToast('Please select a file less than 5MB');
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.fullImgFile = '';
      this.appService.presentToast(
        'Image format not supported, use either jpg/jpeg/png'
      );
      return;
    }

    this.fullUrl = URL.createObjectURL(files[0]);
    this.fullBlob = files[0];
  }

  onFileChangedInfo(event) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }

    if (files[0].size > 5000000) {
      this.infoImgFile = '';
      this.appService.presentToast('Please select a file less than 5MB');
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.infoImgFile = '';
      this.appService.presentToast(
        'Image format not supported, use either jpg/jpeg/png'
      );
      return;
    }

    this.infoUrl = URL.createObjectURL(files[0]);
    this.infoBlob = files[0];
  }

  publish() {
    if (this.isOther && (!this.pageTitle || this.pageTitle.trim().length == 0)) {
      this.appService.presentToast('Please enter the page title');
      return;
    }

    // check if no change
    if (this.isEdit) {
      switch (this.pageType) {
        case 'Full':
          if (this.equalFull(this.full, this.profile.home)) {
            this.appService.closeModalProfile('success');
            return;
          }
          break;
        case 'Info':
          if (this.equalInfo(this.info, this.iInfo)) {
            this.appService.closeModalProfile('success');
            return;
          }
          break;
        case 'Text':
          if (this.equalText(this.text, this.iText)) {
            this.appService.closeModalProfile('success');
            return;
          }
          break;
      }
    }

    this.appService.presentLoading();

    if (this.isHome || this.isContact) {
      this.updateProfile();
      return;
    }

    if (this.isOther) {
      var page;
      var upload;
      switch (this.pageType) {
        case 'Full':
          page = this.full;
          break;
        case 'Text':
          page = this.text;
          break;
        case 'Info':
          page = this.info;
          upload = this.infoBlob;
          break;
      }

      page.id = this.fbUtil.getId();
      page.title = this.pageTitle;
      this.fbUtil
        .getInstance()
        .collection(
          Constants.BUSINESS + '/' + this.profile.id + '/' + Constants.PAGES
        )
        .doc(page.id)
        .set(this.fbUtil.toJson(page))
        .then(() => {
          // upload image
          if (upload) {
            this.fbUtil.uploadImage(
              upload,
              Constants.PAGES + '/' + this.profile.id + '/' + page.id
            );
          }

          // update profile index
          this.profile.pages.push(page.id);
          this.fbUtil
            .getInstance()
            .collection(
              Constants.BUSINESS +
                '/' +
                this.profile.id +
                '/' +
                Constants.PROFILE
            )
            .doc(this.profile.id)
            .update({ pages: this.profile.pages });
        })
        .catch(() =>
          this.appService.presentToast(
            'Error occurred, Please check Internet connectivity'
          )
        )
        .finally(() => {
          this.appService.dismissLoading();
          this.appService.closeModalProfile('success');
        });
    }
  }

  updateProfile() {
    this.profile.home = this.full;
    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + this.profile.id + '/' + Constants.PROFILE
      )
      .doc(this.profile.id)
      .set(this.fbUtil.toJson(this.profile))
      .then(() => {
        // upload back ground
        if (this.fullBlob) {
          this.fbUtil.uploadImage(
            this.fullBlob,
            Constants.PROFILE + '/' + this.profile.id + '/home'
          );
        }
      })
      .catch(() =>
        this.appService.presentToast(
          'Error occurred, Please check Internet connectivity'
        )
      )
      .finally(() => {
        this.appService.dismissLoading();
        this.appService.closeModalProfile('success');
      });
  }

  equalFull(object1: Full, object2: Full): boolean {
    return (
      object1.title === object2.title &&
      object1.fullTitle === object2.fullTitle &&
      object1.fullTitleColor === object2.fullTitleColor &&
      object1.fullTitleX === object2.fullTitleX &&
      object1.fullTitleY === object2.fullTitleY &&
      object1.fullTitleW === object2.fullTitleW &&
      object1.fullTitleFont === object2.fullTitleFont
    );
  }

  equalInfo(object1: Info, object2: Info): boolean {
    return (
      object1.title === object2.title &&
      object1.reverse === object2.reverse &&
      object1.info === object2.info &&
      object1.align === object2.align &&
      object1.color === object2.color &&
      object1.font === object2.font
    );
  }

  equalText(object1: Text, object2: Text): boolean {
    return (
      object1.title === object2.title &&
      object1.heading === object2.heading &&
      object1.headingColor === object2.headingColor &&
      object1.headingFont === object2.headingFont &&
      object1.paragraph === object2.paragraph &&
      object1.paragraphColor === object2.paragraphColor &&
      object1.paragraphStyle === object2.paragraphStyle
    );
  }
}
