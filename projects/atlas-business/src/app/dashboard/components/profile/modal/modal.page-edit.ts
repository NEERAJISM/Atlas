import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  Constants,
  FirebaseUtil,
  Full,
  Info,
  Member,
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
  isNew = false;
  isEdit = false;

  pageTitle = '';
  pageType = '';
  full = new Full();
  info = new Info();
  slides = new Slides();
  team = new Team();
  text = new Text();
  video = new Video();

  default = 'assets/images/white.jpg';

  //form
  fullUrl = this.default;
  fullImgFile;
  fullBlob;

  infoUrl = this.default;
  infoImgFile;
  infoBlob;

  reader = new FileReader();
  currentSlide: number = 0;
  slideImgFile;
  slideImgs: Img[] = [];

  currentMember: number = 0;
  memberImgFile;
  memberImgs: Img[] = [];

  imgMap: Map<string, string> = new Map();

  ytbUrl;
  isValidUrl = false;

  isDesktop = true;

  constructor(
    private appService: AppService,
    private fbUtil: FirebaseUtil,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.isDesktop = this.appService.isDesktop;
    this.appService.presentLoading();

    if (this.mode === 'Home') {
      this.isHome = true;
      this.pageType = Type.Full.toString();
      this.getImages();
      Object.assign(this.full, this.profile.home);
    } else if (this.mode === 'Edit') {
      this.isEdit = true;
      this.mapPage();
      this.getImages();
    } else {
      this.isNew = true;
      this.slideImgs.push(new Img());
      this.memberImgs.push(new Img());
      this.pageType = Type.Full.toString();
      this.appService.dismissLoading();
      this.changeIframe('https://www.youtube-nocookie.com/embed');
    }
  }

  back(){
    this.appService.closeModalProfile('close');
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
        this.slides = JSON.parse(JSON.stringify(this.page)); // because it has list of objects
        break;
      case Type.Team:
        this.team = JSON.parse(JSON.stringify(this.page)); // because it has list of objects
        break;
      case Type.Video:
        Object.assign(this.video, this.page);
        this.urlUpdate();
        break;
    }
  }

  getImages() {
    if (this.pageType === Type.Text.toString() || this.pageType === Type.Video.toString()) {
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

    if (this.pageType === Type.Team.toString()) {
      var counter = 0;
      this.team.members.forEach((member) => {
        this.memberImgs.push(new Img());
        counter++;

        this.fbUtil
          .downloadImage(
            Constants.PAGES +
            '/' +
            this.profile.id +
            '/' +
            this.team.id +
            '/' +
            member.id
          )
          .subscribe((url) => {
            this.imgMap.set(member.id, url);
            if (counter === this.team.members.length) {
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
        if (this.pageType === Type.Full.toString()) {
          this.fullUrl = url;
        } else {
          this.infoUrl = url;
        }
        this.appService.dismissLoading();
      },
      error => {this.appService.dismissLoading();}
      );
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

  onFileChangedMember(event) {
    const files = event.target.files;
    if (files.length === 0) {
      return;
    }

    if (files[0].size > 5000000) {
      this.memberImgFile = '';
      this.appService.presentToast('Please select a file less than 5MB');
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) === null) {
      this.memberImgFile = '';
      this.appService.presentToast(
        'Image format not supported, use either jpg/jpeg/png'
      );
      return;
    }

    this.memberImgs[this.currentMember].url = URL.createObjectURL(files[0]);
    this.memberImgs[this.currentMember].blob = files[0];

    this.reader.readAsDataURL(files[0]);
    this.reader.onload = (e) => {
      this.memberImgs[this.currentMember].url = this.reader.result;
    };
  }

  publish() {

    // Validations
    if (!this.isHome && (!this.pageTitle || this.pageTitle.trim().length === 0)) {
      this.appService.presentToast('Please enter the page title');
      return;
    } else if (this.pageType === Type.Full.toString() && this.fullUrl === this.default) {
      this.appService.presentToast('Please select a background image');
      return;
    } else if (this.pageType === Type.Info.toString() && this.infoUrl === this.default) {
      this.appService.presentToast('Please select a background image');
      return;
    } else if (this.pageType === Type.Text.toString() && (!this.text.heading)) {
      this.appService.presentToast('Please provide heading');
      return;
    } else if (this.pageType === Type.Slides.toString()) {
      for (let i = 0; i < this.slides.slides.length; i++) {
        if (!this.slideImgs[i].url && !this.imgMap.has(this.slides.slides[i].id)) {
          this.currentSlide = i;
          this.appService.presentToast('Please slelect an image for slide ' + (i + 1));
          return;
        }
      }
    } else if (this.pageType === Type.Team.toString()) {
      for (let i = 0; i < this.team.members.length; i++) {
        if (!this.memberImgs[i].url && !this.imgMap.has(this.team.members[i].id)) {
          this.currentMember = i;
          this.appService.presentToast('Please slelect an image for Member ' + (i + 1));
          return;
        }
      }
    } else if (this.pageType === Type.Video.toString() && !this.isValidUrl) {
      this.appService.presentToast('Please enter a valid video URL from YouTube!!');
      return;
    }

    // duplicate check
    if (this.isHome || (this.isEdit && this.pageTitle === this.page.title)) {
      switch (this.pageType) {
        case 'Full':
          if (this.equalFull(this.full, this.isHome ? this.profile.home : this.page as Full)) {
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
        case 'Team':
          if (this.equalTeam(this.team, this.page as Team)) {
            this.appService.closeModalProfile('success');
            return;
          }
          break;
        case 'Video':
          if (
            this.video.url === (this.page as Video).url &&
            this.video.videoTitle === (this.page as Video).videoTitle
          ) {
            this.appService.closeModalProfile('success');
            return;
          }
          break;
      }
    }

    this.appService.presentLoading();
    if (this.isHome) {
      this.updateProfile();
      return;
    }

    var page;
    var upload;
    switch (this.pageType) {
      case 'Full':
        page = this.full;
        upload = this.fullBlob;
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
      case 'Video':
        page = this.video;
        break;
      case 'Team':
        page = this.team;
        break;
    }

    if (this.isNew) {
      page.id = this.fbUtil.getId();
    }

    page.title = this.pageTitle;
    this.updateSlideImages();
    this.updateTeamImages();

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

  updateSlideImages() {
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

  updateTeamImages() {
    if (this.pageType !== Type.Team) {
      return;
    }

    this.memberImgs.forEach((img, i) => {
      if (!img.url) {
        return;
      }

      if (!this.team.members[i].id) {
        this.team.members[i].id = this.fbUtil.getId();
      }

      this.fbUtil.uploadImage(
        img.blob,
        Constants.PAGES +
        '/' +
        this.profile.id +
        '/' +
        this.team.id +
        '/' +
        this.team.members[i].id
      );
    });

    // cleanup deleted images
    if (this.isEdit) {
      var newMembers = [];
      this.team.members.forEach((member) => {
        newMembers.push(member.id);
      });

      (this.page as Team).members.forEach((currentMember) => {
        if (newMembers.indexOf(currentMember.id) === -1) {
          this.fbUtil.deleteImage(
            Constants.PAGES +
            '/' +
            this.profile.id +
            '/' +
            this.team.id +
            '/' +
            currentMember.id
          );
        }
      });
    }
  }

  updateProfile() {
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.profile.id + '/' + Constants.PROFILE)
      .doc(this.profile.id)
      .update({ home: this.fbUtil.toJson(this.full) })
      .then(() => {
        // upload back ground
        if (this.fullBlob) {
          this.fbUtil.uploadImage(this.fullBlob, Constants.PROFILE + '/' + this.profile.id + '/home');
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
      object1.fullTitleFont === object2.fullTitleFont &&
      !this.fullBlob
    );
  }

  equalInfo(object1: Info, object2: Info): boolean {
    return (
      object1.reverse === object2.reverse &&
      object1.info === object2.info &&
      object1.align === object2.align &&
      object1.color === object2.color &&
      object1.font === object2.font &&
      !this.infoBlob
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

  equalTeam(object1: Team, object2: Team): boolean {
    if (object1.members.length != object2.members.length) {
      return false;
    }

    for (var i = 0; i < object1.members.length; i++) {
      if (
        object1.members[i].name !== object2.members[i].name ||
        object1.members[i].designation !== object2.members[i].designation ||
        object1.members[i].details !== object2.members[i].details ||
        this.memberImgs[i].url
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

  addMember() {
    if (this.team.members.length > 20) {
      this.appService.presentToast('Cannot add more that 20 members!!');
      return;
    }

    this.team.members.push(new Member());
    this.memberImgs.push(new Img());

    this.currentMember = this.team.members.length - 1;
  }

  removeSlide() {
    const index = this.currentSlide;
    this.currentSlide = 0;

    this.slides.slides.splice(index, 1);
    this.slideImgs.splice(index, 1);
  }

  removeMember() {
    const index = this.currentMember;
    this.currentMember = 0;

    this.team.members.splice(index, 1);
    this.memberImgs.splice(index, 1);
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

  moveRightMember() {
    if (this.currentMember < this.team.members.length - 1) {
      const index: number = Number(this.currentMember);

      [this.team.members[index], this.team.members[index + 1]] = [
        this.team.members[index + 1],
        this.team.members[index],
      ];

      [this.memberImgs[index], this.memberImgs[index + 1]] = [
        this.memberImgs[index + 1],
        this.memberImgs[index],
      ];

      this.currentMember++;
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

  moveLeftMember() {
    if (this.currentMember > 0) {
      const index: number = Number(this.currentMember);

      [this.team.members[index - 1], this.team.members[index]] = [
        this.team.members[index],
        this.team.members[index - 1],
      ];

      [this.memberImgs[index - 1], this.memberImgs[index]] = [
        this.memberImgs[index],
        this.memberImgs[index - 1],
      ];

      this.currentMember--;
    }
  }

  load() {
    if (this.isEdit) {
      this.appService.presentLoading();
      setTimeout(() => this.appService.dismissLoading(), 2000);
    }
  }

  urlUpdate() {
    var match = this.video.url.match(Constants.ytbRegEx);
    if (match && match.length > 1 && match[1].length === 11) {
      this.isValidUrl = true;
      this.changeIframe('https://www.youtube-nocookie.com/embed/' + match[1]);
    } else {
      this.isValidUrl = false;
      this.changeIframe('https://www.youtube-nocookie.com/embed/');
    }
  }

  changeIframe(url) {
    this.ytbUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
