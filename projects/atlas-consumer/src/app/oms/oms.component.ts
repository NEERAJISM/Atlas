import { Component } from '@angular/core';

@Component({
  selector: 'app-oms',
  templateUrl: './oms.component.html',
})
export class OmsComponent {

  display = true;

  click(){
    this.display = false;
  }

}
