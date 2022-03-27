import { Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import {
  Business, CommonUtil,
  Constants,
  FirebaseUtil, Page, Profile,
  Slides,
  Team,
  Type, Video
} from 'atlas-core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('footer') footer: any;

  // Business
  bizInfo: Business;

  url = 'assets/images/profile/white.jpg';
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

  landingFont = '70px';
  isDesktop = false;

  // **** Assets for Custom web  *****

  service1 = 'assets/images/profile/service-1.jpg';
  service2 = 'assets/images/profile/service-2.jpg';
  service3 = 'assets/images/profile/service-3.jpg';

  project1 = 'assets/images/profile/project-1.jpg';
  project2 = 'assets/images/profile/project-2.jpg';
  project3 = 'assets/images/profile/project-3.jpg';

  rameshji = 'assets/images/profile/rameshji.jpg';
  aashika = 'assets/images/profile/aashika.jpg';
  deepikaji = 'assets/images/profile/deepikaji.jpg';
  chirag = 'assets/images/profile/chirag.jpg';
  logo = 'assets/images/profile/logo.jpg';

  // **************
  business: Business = new Business();
  profile: Profile = new Profile();
  pagesMap: Map<string, Page> = new Map();
  pages = [];
  displayPages = [];

  home = true;
  hashes: string[] = []
  menus: string[] = []
  menuPages: Map<number, any[]> = new Map();

  bizId = 'bA3Y7HgRrbNGfgisuXCKTtSeYLk2';

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
    private sanitizer: DomSanitizer
  ) {
    if (window.innerWidth > 1000) {
      this.landingFont = '120px';
      this.isDesktop = true;
    }

    this.getBusiness();
    this.getProfile();
    this.updateLocationUrl();
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
        if (doc.data()) {
          Object.assign(this.profile, doc.data());
        }
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
        if (name.length > 1 && name.startsWith('#')) {
          name = name.substring(1);
          this.header(name, this.hashes.indexOf(name) + 1);
        } else {
          this.displayPages = this.pages;
        }
        this.downloadImages();
      });
  }

  urlUpdate(url: string): SafeResourceUrl {
    var match = url.match(Constants.ytbRegEx);
    if (match && match.length > 1 && match[1].length == 11) {
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

            if (this.imgMap.size == counter) {
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

              if (this.imgMap.size == counter) {
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

              if (this.imgMap.size == counter) {
                this.complete = true;
              }
            });
        });
      }
    });
  }
  routeToOrder() {
    this.router.navigateByUrl('/order');
  }
  async presentToast() {
    this.appService.presentToast(
      "Thanks. Your query has been registerd. we'll reachout to you."
    );
  }

  header(menu: string, index?: number) {
    this.location.replaceState('#' + menu.split(' ').map(x => x.trim()).join(''));

    if (index) {
      this.home = false;
      this.displayPages = this.menuPages.get(index);
    } else if ("contact" !== menu) {
      this.home = true;
      this.displayPages = this.pages;
    }

    this.content.scrollToPoint(0, (!index && "contact" === menu) ? this.footer.nativeElement.offsetTop : 0, 1000);
  }
}
