import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IonContent, ModalController } from '@ionic/angular';
import {
  Business, CommonUtil,
  Constants,
  FirebaseUtil, Page, Profile,
  Slides,
  Team,
  Type, Video
} from 'atlas-core';
import { AppService } from '../app.service';
import { SlideModal } from './modal/modal.slide';
import * as firebase from 'firebase';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('footer') footer: any;

  // Business
  bizInfo: Business;

  url = 'assets/images/white.jpg';
  icon = '';

  // slider config

  sliderConfig = {
    spaceBetween: 5,
    centeredSlides: false,
    slidesPerView: 3,
    autoplay: true,
  };

  sliderConfigTeam = {
    spaceBetween: 5,
    centeredSlides: false,
    slidesPerView: 4,
    autoplay: true,
  };

  mobileView = false;

  business: Business = new Business();
  profile: Profile = new Profile();
  pagesMap: Map<string, Page> = new Map();
  pages = [];
  displayPages = [];
  hasProducts = false;

  home = true;
  hashes: string[] = []
  menus: string[] = []
  menuPages: Map<number, any[]> = new Map();

  bizId = '';
  profileName = '';
  initialized = false;

  imgMap: Map<string, string> = new Map();
  complete = false;

  ytbUrl: Map<string, SafeResourceUrl> = new Map();
  locationSrc: any;

  constructor(
    private location: Location,
    private router: Router,
    private fbUtil: FirebaseUtil,
    private appService: AppService,
    private util: CommonUtil,
    private sanitizer: DomSanitizer,
    private modalController: ModalController
  ) {
    if (appService.isMobileView()) {
      this.setupMobileView();
    }
    this.init();
    this.updateLocationUrl();
  }

  setupMobileView(){
    this.mobileView = true;
    this.sliderConfig.slidesPerView = 1;
    this.sliderConfigTeam.slidesPerView = 1;
  }

  init() {
    if (this.appService.isCustomDomain()) {
      this.appService.presentLoading();
      this.fbUtil
        .getInstance()
        .collection(Constants.DOMAIN)
        .doc(window.location.host)
        .get()
        .subscribe((doc) => {
          this.appService.dismissLoading();
          if (!doc.exists) {
            this.appService.presentToast('No Profile found!');
            return;
          }

          this.bizId = (doc.data() as any).id;
          this.getBusinessInfo();
        });
    } else {
      // if atlas url - try to get profile
      this.profileName = this.location.path().substring(1);
      if (!this.profileName) {
        this.router.navigateByUrl('search');
        return;
      }

      this.appService.presentLoading();
      this.fbUtil
        .getInstance()
        .collection(Constants.PROFILE)
        .doc(this.profileName)
        .get()
        .subscribe((doc) => {
          this.appService.dismissLoading();
          if (!doc.exists) {
            this.appService.presentToast('No Profile found for - ' + this.profileName);
            this.router.navigateByUrl('search');
            return;
          }

          this.bizId = (doc.data() as any).id;
          this.getBusinessInfo();
        });
    }
  }

  getBusinessInfo(){
    this.getBusiness();
    this.getProfile();
    this.getItems()
    this.updateLocationUrl();
  }

  async presentSlideModal(img: string, title: string, desc: string) {
    const modal = await this.modalController.create({
      component: SlideModal,
      cssClass: 'page-edit-modal',
      componentProps: {
        img: img,
        title: title,
        desc: desc
      },
    });
    return await modal.present();
  }

  getBusiness() {
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.bizId + '/' + Constants.INFO)
      .doc(this.bizId)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          Object.assign(this.business, doc.data());
          this.updateLocation();
        }
      });
  }

  updateLocation() {
    if (this.business.address.location && this.business.address.location.includes('src=')) {
      var tags = this.business.address.location.split(' ');
      tags.filter(tag => tag.startsWith('src=')).find(src => this.updateLocationUrl(src.slice(5, src.length - 1)));
    } else {
      this.updateLocationUrl();
    }
  }

  updateLocationUrl(url?: string): void {
    this.locationSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      url ? url : 'https://www.google.com/maps/embed'
    );
  }

  getProfile() {
    this.fbUtil
      .downloadImage(Constants.PROFILE + '/' + this.bizId + '/home')
      .subscribe((url) => {
        this.url = url;
      });

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
        Object.assign(this.profile, doc.data());
        this.initialized = true;
        this.getPages();
        this.updateViews();
      });
  }

  getItems() {
    this.fbUtil
      .getProductRef(this.bizId)
      .get()
      .forEach((res) =>
        res.forEach((data) => {
          if (data.data()) {
            this.hasProducts = true;
          }
        })
      );
  }

  updateViews() {
    var date = new Date().toLocaleDateString().split('/').reverse().join('');
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + this.bizId + '/' + Constants.STATS)
      .doc(date)
      .set({
        date: Number(date),
        views: firebase.default.firestore.FieldValue.increment(1)
      }, { merge: true });
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

            if (page.type === Type.Video) {
              this.ytbUrl.set(page.id, this.urlUpdate((page as Video).url));
            }
          }
        });

        // sort + menu
        var menu = '';
        var newMenu = false;

        this.profile.pages.forEach((id) => {
          var page = this.pagesMap.get(id);
          this.pages.push(page);

          if (page.type === Type.Menu) {
            menu = page.title;
            newMenu = true;
          } else {
            if (newMenu) {
              newMenu = false;
              this.menus.push(menu);
              this.hashes.push(menu.split(' ').map(x => x.trim()).join(''));
              this.menuPages.set(this.menus.length, []);
            }
            if (this.menus.length > 0) {
              this.menuPages.get(this.menus.length).push(page);
            }
          }
        });


        // set header
        var name = this.location.path(true);
        if (name.length > 1 && name.indexOf('#') !== -1) {
          name = name.substring(name.indexOf('#') + 1);
          this.header(name, this.hashes.indexOf(name) + 1);
        } else {
          this.displayPages = this.pages;
        }
        this.downloadImages();
      });
  }

  urlUpdate(url: string): SafeResourceUrl {
    var match = url.match(Constants.ytbRegEx);
    if (match && match.length > 1 && match[1].length === 11) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://www.youtube-nocookie.com/embed/' + match[1]
      );
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube-nocookie.com/embed/'
    );
  }

  downloadImages() {
    var counter = 0;
    this.pagesMap.forEach((v, k) => {
      if (v.type === Type.Full || v.type === Type.Info) {
        counter++;
        this.fbUtil
          .downloadImage(Constants.PAGES + '/' + this.profile.id + '/' + k)
          .subscribe((url) => {
            this.imgMap.set(k, url);

            if (this.imgMap.size === counter) {
              this.complete = true;
            }
          });
      } else if (v.type === Type.Slides) {
        (v as Slides).slides.forEach((slide) => {
          counter++;
          this.fbUtil
            .downloadImage(
              Constants.PAGES + '/' + this.profile.id + '/' + k + '/' + slide.id
            )
            .subscribe((url) => {
              this.imgMap.set(slide.id, url);

              if (this.imgMap.size === counter) {
                this.complete = true;
              }
            });
        });
      } else if (v.type === Type.Team) {
        (v as Team).members.forEach((member) => {
          counter++;
          this.fbUtil
            .downloadImage(
              Constants.PAGES + '/' + this.profile.id + '/' + k + '/' + member.id
            )
            .subscribe((url) => {
              this.imgMap.set(member.id, url);

              if (this.imgMap.size === counter) {
                this.complete = true;
              }
            });
        });
      }
    });
  }
  routeToOrder() {
    this.router.navigateByUrl(this.profileName + '/order');
  }
  async presentToast() {
    this.appService.presentToast(
      "Thanks. Your query has been registerd. we'll reachout to you."
    );
  }

  header(menu: string, index?: number) {
    this.location.replaceState(this.profileName + '#' + menu.split(' ').map(x => x.trim()).join(''));

    if (index) {
      this.home = false;
      this.displayPages = this.menuPages.get(index);
    } else if ("contact" !== menu) {
      this.home = true;
      this.displayPages = this.pages;
    } else if (this.mobileView) {
      this.home = false;
      this.displayPages = [];
    }

    this.content.scrollToPoint(0, (!index && "contact" === menu) ? this.footer.nativeElement.offsetTop : 0, 1000);
  }
}
