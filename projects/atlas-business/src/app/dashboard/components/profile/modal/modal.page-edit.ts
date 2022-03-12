import { Component, Input, OnInit } from '@angular/core';
import {
  Constants,
  Contact,
  FirebaseUtil,
  Full,
  Info,
  Page,
  Profile,
  Slide,
  Slides,
  Team,
  Text,
  Type,
  Video,
} from 'atlas-core';
import { AppService } from 'projects/atlas-business/src/app/app.service';

class Img {
  url;
  blob;
}

@Component({
  selector: 'page-edit-modal',
  templateUrl: './modal.page-edit.html',
})
export class PageEditModal implements OnInit {
  @Input() mode: string;
  @Input() profile: Profile;
  @Input() page: Page;

  isHome = false;
  isContact = false;
  isNew = false;
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

  reader = new FileReader();
  currentSlide: number = 0;
  slideImgFile;
  slideImgs: Img[] = [];
  imgMap: Map<string, string> = new Map();
  xhr = new XMLHttpRequest();

  constructor(
    private appService: AppService,
    private fbUtil: FirebaseUtil,
  ) {}

  ngOnInit(): void {
    this.appService.presentLoading();

    if (this.mode === 'Home') {
      this.isHome = true;
      this.pageType = Type.Full.toString();
      this.getImages();
      this.full = this.profile.home;
    } else if (this.mode === 'Contact') {
      this.isContact = true;
      this.pageType = Type.Contact.toString();
      this.appService.dismissLoading();
    } else if (this.mode === 'Edit') {
      this.isEdit = true;
      this.mapPage();
      this.getImages();
    } else {
      this.isNew = true;
      this.slideImgs.push(new Img());
      this.pageType = Type.Full.toString();
      this.appService.dismissLoading();
    }
  }

  mapPage() {
    this.pageType = this.page.type.toString();
    this.pageTitle = this.page.title;

    switch (this.page.type) {
      case Type.Full:
        Object.assign(this.full, this.page);
        break;
      case Type.Info:
        Object.assign(this.info, this.page);
        break;
      case Type.Text:
        Object.assign(this.text, this.page);
        break;
      case Type.Slides:
        this.slides = JSON.parse(JSON.stringify(this.page)); // becase it has list of objects
        break;
      case Type.Team:
        Object.assign(this.team, this.page);
        break;
      case Type.Video:
        Object.assign(this.video, this.page);
        break;
      case Type.Contact:
        Object.assign(this.contact, this.page);
        break;
    }
  }

  getImages() {
    if (this.pageType === Type.Text.toString()) {
      this.appService.dismissLoading();
      return;
    }

    if (this.pageType === Type.Slides.toString()) {
      var counter = 0;
      this.slides.slides.forEach((slide) => {
        this.slideImgs.push(new Img());
        counter++;

        this.fbUtil
          .downloadImage(
            Constants.PAGES +
              '/' +
              this.profile.id +
              '/' +
              this.slides.id +
              '/' +
              slide.id
          )
          .subscribe((url) => {
            this.imgMap.set(slide.id, url);
            if (counter === this.slides.slides.length) {
              this.appService.dismissLoading();
            }
          });
      });
      return;
    }

    this.fbUtil
      .downloadImage(
        (this.isHome ? Constants.PROFILE : Constants.PAGES) +
          '/' +
          this.profile.id +
          '/' +
          (this.isHome ? 'home' : this.page.id)
      )
      .subscribe((url) => {
        if (this.isHome) {
          this.fullUrl = url;
        } else {
          this.infoUrl = url;
        }
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

  onFileChangedSlide(event) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }

    if (files[0].size > 5000000) {
      this.slideImgFile = '';
      this.appService.presentToast('Please select a file less than 5MB');
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.slideImgFile = '';
      this.appService.presentToast(
        'Image format not supported, use either jpg/jpeg/png'
      );
      return;
    }

    this.slideImgs[this.currentSlide].url = URL.createObjectURL(files[0]);
    this.slideImgs[this.currentSlide].blob = files[0];

    this.reader.readAsDataURL(files[0]);
    this.reader.onload = (e) => {
      this.slideImgs[this.currentSlide].url = this.reader.result;
    };
  }

  publish() {
    if (
      (this.isNew || this.isEdit) &&
      (!this.pageTitle || this.pageTitle.trim().length == 0)
    ) {
      this.appService.presentToast('Please enter the page title');
      return;
    }

    if (this.pageType === Type.Slides.toString()) {
      for (let i = 0; i < this.slides.slides.length; i++) {
        if (
          !this.slideImgs[i].url &&
          !this.imgMap.has(this.slides.slides[i].id)
        ) {
          this.currentSlide = i;
          this.appService.presentToast(
            'Please slelect an image for slide ' + (i + 1)
          );
          return;
        }
      }
    }

    if (!this.isNew && this.pageTitle === this.page.title) {
      switch (this.pageType) {
        case 'Full':
          if (this.equalFull(this.full, this.profile.home)) {
            this.appService.closeModalProfile('success');
            return;
          }
          break;
        case 'Info':
          if (this.equalInfo(this.info, this.page as Info)) {
            this.appService.closeModalProfile('success');
            return;
          }
          break;
        case 'Text':
          if (this.equalText(this.text, this.page as Text)) {
            this.appService.closeModalProfile('success');
            return;
          }
          break;
        case 'Slides':
          if (this.equalSlides(this.slides, this.page as Slides)) {
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
      case 'Slides':
        page = this.slides;
        break;
    }

    if (this.isNew) {
      page.id = this.fbUtil.getId();
    }

    page.title = this.pageTitle;
    this.updateImages();

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

        // update profile index - only  New
        if (this.isNew) {
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

  updateImages() {
    if (this.pageType !== Type.Slides) {
      return;
    }

    this.slideImgs.forEach((img, i) => {
      if (!img.url) {
        return;
      }

      if (!this.slides.slides[i].id) {
        this.slides.slides[i].id = this.fbUtil.getId();
      }

      this.fbUtil.uploadImage(
        img.blob,
        Constants.PAGES +
          '/' +
          this.profile.id +
          '/' +
          this.slides.id +
          '/' +
          this.slides.slides[i].id
      );
    });

    // cleanup deleted images
    if (this.isEdit) {
      var newSlides = [];
      this.slides.slides.forEach((slide) => {
        newSlides.push(slide.id);
      });

      (this.page as Slides).slides.forEach((currentSlide) => {
        if (newSlides.indexOf(currentSlide.id) === -1) {
          this.fbUtil.deleteImage(
            Constants.PAGES +
              '/' +
              this.profile.id +
              '/' +
              this.slides.id +
              '/' +
              currentSlide.id
          );
        }
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
      object1.reverse === object2.reverse &&
      object1.info === object2.info &&
      object1.align === object2.align &&
      object1.color === object2.color &&
      object1.font === object2.font
    );
  }

  equalText(object1: Text, object2: Text): boolean {
    return (
      object1.heading === object2.heading &&
      object1.headingColor === object2.headingColor &&
      object1.headingFont === object2.headingFont &&
      object1.paragraph === object2.paragraph &&
      object1.paragraphColor === object2.paragraphColor &&
      object1.paragraphStyle === object2.paragraphStyle
    );
  }

  equalSlides(object1: Slides, object2: Slides): boolean {
    if (object1.slides.length != object2.slides.length) {
      return false;
    }

    for (var i = 0; i < object1.slides.length; i++) {
      if (
        object1.slides[i].title !== object2.slides[i].title ||
        object1.slides[i].description !== object2.slides[i].description ||
        this.slideImgs[i].url
      ) {
        return false;
      }
    }
    return true;
  }

  addSlide() {
    if (this.slides.slides.length > 20) {
      this.appService.presentToast('Cannot add more that 20 slides!!');
      return;
    }

    this.slides.slides.push(new Slide());
    this.slideImgs.push(new Img());

    this.currentSlide = this.slides.slides.length - 1;
  }

  removeSlide() {
    const index = this.currentSlide;
    this.currentSlide = 0;

    this.slides.slides.splice(index, 1);
    this.slideImgs.splice(index, 1);
  }

  moveRight() {
    if (this.currentSlide < this.slides.slides.length - 1) {
      const index: number = Number(this.currentSlide);

      [this.slides.slides[index], this.slides.slides[index + 1]] = [
        this.slides.slides[index + 1],
        this.slides.slides[index],
      ];

      [this.slideImgs[index], this.slideImgs[index + 1]] = [
        this.slideImgs[index + 1],
        this.slideImgs[index],
      ];

      this.currentSlide++;
    }
  }

  moveLeft() {
    if (this.currentSlide > 0) {
      const index: number = Number(this.currentSlide);

      [this.slides.slides[index - 1], this.slides.slides[index]] = [
        this.slides.slides[index],
        this.slides.slides[index - 1],
      ];

      [this.slideImgs[index - 1], this.slideImgs[index]] = [
        this.slideImgs[index],
        this.slideImgs[index - 1],
      ];

      this.currentSlide--;
    }
  }

  loadImage() {
    if (this.isEdit) {
      this.appService.presentLoading();
      setTimeout(() => this.appService.dismissLoading(), 2000);
    }
  }
}
