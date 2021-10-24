import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CommonUtil } from 'atlas-core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  value: string = '';

  displayLoc = false;
  location = '';
  pincode: string = '';
  rateControl = new FormControl('', [Validators.max(100), Validators.min(0)]);

  constructor(private util: CommonUtil) {}

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
}
