import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Business, CommonUtil, Constants, FirebaseUtil } from 'atlas-core';
import { Observable } from 'rxjs';
import { AppService } from '../app.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  value: string = '';

  isDesktop = false;
  displayLoc = false;
  location = '';
  pincode: string = '';
  rateControl = new FormControl('', [Validators.max(100), Validators.min(0)]);

  filteredOptions: Observable<string[]>;

  query = '';
  searchQuery = '';
  businesses: Business[] = [];
  imgMap: Map<string, string> = new Map();

  constructor(public router: Router, private app: AppService, private fbUtil: FirebaseUtil) {
    this.isDesktop = app.isDesktop;
  }

  clear() {
    this.query = '';
  }

  search() {
    this.app.presentLoading();
    this.businesses = [];

    this.fbUtil.getInstance()
      .collection(Constants.PROFILE, (ref) => ref.where('keywords', 'array-contains', this.searchQuery).limit(4))
      .get()
      .forEach((res) => {
        if(res.empty){
          this.app.presentToast('No businesses found for query - ' + this.query);
          return;
        }
        res.forEach((doc) => {
          this.loadBusiness((doc.data() as any).id);
        })
      }).finally(() => this.app.dismissLoading());
  }

  loadBusiness(id: string) {
    this.fbUtil
      .getInstance()
      .collection(Constants.BUSINESS + '/' + id + '/' + Constants.INFO)
      .doc(id)
      .get()
      .subscribe((doc) => {
        if (doc.data()) {
          var b = new Business();
          Object.assign(b, doc.data());
          this.businesses.push(b);
        }
      });

    this.fbUtil
      .downloadImage(Constants.PROFILE + '/' + id + '/home')
      .subscribe((url) => {
        this.imgMap.set(id, url);
      });
  }

  enableSearch() {
    this.searchQuery = this.query.trim().toLowerCase();
    if (this.searchQuery.length < 6) {
      return false;
    }

    if (this.searchQuery.indexOf(' ') !== -1) {
      this.searchQuery = this.searchQuery.split(Constants.multipleSpaces).join('-');
    }
    return this.searchQuery.length > 5;
  }

  route(profile) {
    this.router.navigateByUrl('/' + profile);
  }
}
