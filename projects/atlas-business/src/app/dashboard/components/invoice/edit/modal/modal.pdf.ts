import { Component, Input } from '@angular/core';
import { AppService } from 'projects/atlas-business/src/app/app.service';

@Component({
  selector: 'pdf-modal',
  templateUrl: 'modal.pdf.html',
})
export class PdfModal {
  @Input() data;
  @Input() isEdit: boolean;

  constructor(private service: AppService) {
  }

  close(s: string) {
    this.service.closeModalPdf(s);
  }
}
