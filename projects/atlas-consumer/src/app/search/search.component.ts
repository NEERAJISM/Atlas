import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonUtil } from 'atlas-core';
import { Observable } from 'rxjs';

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

  public appPages = [
    { title: 'Inbox', url: '/folder/Inbox', icon: 'mail' },
    { title: 'Outbox', url: '/folder/Outbox', icon: 'paper-plane' },
    { title: 'Favorites', url: '/folder/Favorites', icon: 'heart' },
    { title: 'Archived', url: '/folder/Archived', icon: 'archive' },
    { title: 'Trash', url: '/folder/Trash', icon: 'trash' },
    { title: 'Spam', url: '/folder/Spam', icon: 'warning' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  constructor(private util: CommonUtil, public router: Router) {
    if (window.innerWidth > 1000) {
      this.isDesktop = true;
    }
  }

  pinCheck(pin) {
    if (this.pincode.length == 6) {
      this.util
        .httpGet('https://api.postalpincode.in/pincode/' + this.pincode)
        .subscribe((d) => {
          if (d && d[0] && d[0].PostOffice && d[0].PostOffice[0]) {
            this.location = d[0].PostOffice[0].District + ', ' + d[0].PostOffice[0].State;
            this.displayLoc = true;
          } else {
            this.displayLoc = false;
          }
        });
    } else {
      this.displayLoc = false;
    }
  }

  route(){
    console.log('.. Routing ....')
    this.router.navigateByUrl('/profile');
  }
}
