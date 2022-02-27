import { Component, Input, OnInit } from '@angular/core';
import { AuthService, Constants, FirebaseUtil, Full, Profile } from 'atlas-core';
import { AppService } from 'projects/atlas-business/src/app/app.service';

@Component({
  selector: 'page-edit-modal',
  templateUrl: './modal.page-edit.html',
})
export class PageEditModal implements OnInit {
  @Input() mode: string = '';

  isHome = false;
  isContact = false;
  isOther = false;
  
  bizId = '';
  pageTitle = 'Home';

  full: Full = new Full();

  url = 'assets/images/profile/white.jpg';
  imgFile;
  blob;

  profile2: Profile = new Profile();

  constructor(private appService: AppService, private fbUtil: FirebaseUtil, private auth: AuthService) {
    this.appService.presentLoading();
    this.init();
  }

  ngOnInit(): void {
    if(this.mode === 'Home') {
      this.isHome = true;
    } else if (this.mode === 'Contact') {
      this.isContact = true;
    } else {
      this.isOther = true;
    }
  }

  init() {
    this.auth.afAuth.authState.subscribe((user) => {
      if(user) {
        this.bizId = user.uid;
        this.getProfile();
      }
    });
  }

  getProfile() {
    this.fbUtil
      .downloadImage(Constants.PROFILE, this.bizId)
      .subscribe((url) => {
        this.url = url;
        this.appService.dismissLoading();
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
          Object.assign(this.profile2, doc.data());
          this.full = this.profile2.home;
        }
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
    if (!this.pageTitle || this.pageTitle.trim().length == 0) {
      this.appService.presentToast('Please enter the page title');
      return;
    }

    this.appService.presentLoading();

    // create
    this.profile2.home = this.full;
    this.fbUtil
      .getInstance()
      .collection(
        Constants.BUSINESS + '/' + this.bizId + '/' + Constants.PROFILE
      )
      .doc(this.bizId)
      .set(this.fbUtil.toJson(this.profile2))
      .then(() => {
        // upload back ground
        if (this.blob) {
          this.fbUtil.uploadImage(this.blob, Constants.PROFILE, this.bizId);
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
}
