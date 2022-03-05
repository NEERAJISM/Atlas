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
  url = 'assets/images/profile/white.jpg';
  imgFile;
  blob;

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
      : (this.pageType = Type.Text.toString());

    this.full = this.profile.home;
    this.isHome ? this.getProfile() : this.appService.dismissLoading();
  }

  getProfile() {
    this.fbUtil
      .downloadImage(Constants.PROFILE + '/' + this.profile.id + '/home')
      .subscribe((url) => {
        this.url = url;
        this.appService.dismissLoading();
      });
  }

  onFileChanged(event) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }

    if (files[0].size > 5000000) {
      this.imgFile = '';
      this.appService.presentToast('Please select a file less than 5MB');
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.imgFile = '';
      this.appService.presentToast(
        'Image format not supported, use either jpg/jpeg/png'
      );
      return;
    }

    this.url = URL.createObjectURL(files[0]);
    this.blob = files[0];
  }

  publish() {
    // TODO for Edit only if there's any change from exiting
    if (
      this.isOther &&
      (!this.pageTitle || this.pageTitle.trim().length == 0)
    ) {
      this.appService.presentToast('Please enter the page title');
      return;
    }

    // check if no change
    if(this.isEdit) {

    switch (this.pageType) {
      case 'Full':
        if (this.equalFull(this.full, this.profile.home)) {
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
      switch (this.pageType) {
        case 'Full':
          break;
        case 'Text':
          page = this.text;
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
            .update({ pages: this.profile.pages});
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
        if (this.blob) {
          this.fbUtil.uploadImage(
            this.blob,
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
