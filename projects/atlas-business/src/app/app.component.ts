import { Component } from '@angular/core';
import { Address, CommonUtil } from 'atlas-core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'atlas-business';

  tc: Address;

  constructor(com : CommonUtil){
    com.showSnackBar('This i show legends are made!!');
  }

}
