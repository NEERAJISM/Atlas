import { Component, Input } from '@angular/core';

@Component({
  selector: 'page-edit-modal',
  templateUrl: './modal.slide.html',
})
export class SlideModal {
  @Input() img: string;
  @Input() title: string;
  @Input() desc: string;
}
