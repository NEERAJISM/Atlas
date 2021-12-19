import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AppService {
  private modal = new BehaviorSubject<string>('');
  modalCloseEvent = this.modal.asObservable();

  closeModal(s: string) {
    this.modal.next(s);
  }
}
