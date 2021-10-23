import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'atlas-core';
import { LoginDialogComponent } from './dialog/login-dialog.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  title = 'atlas-login';

  @ViewChild('examples')
  examples: ElementRef;

  showContent = false;

  animal: string;
  name: string;

  constructor(public dialog: MatDialog, private auth: AuthService, public router: Router) {
    this.showContent = false;
  }

  onImageLoadComplete() {
    this.showContent = true;
  }

  scrollToElement(): void {
    const targetElement = this.examples.nativeElement;
    targetElement.scrollIntoView({ behavior: 'smooth' });
  }

  openModal(register: boolean): void {
    if (this.auth.isLoggedIn) {
      this.router.navigateByUrl('/dashboard');
      return;
    }

    const dialogRef = this.dialog.open(LoginDialogComponent, {
      height: '600px',
      width: '1000px',
      data: register,
      panelClass: 'login-dialog-container'
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.animal = result;
    });
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e) {
    const element = document.querySelector('.view');
    const navbarElement = document.querySelector('.navbar');

    if (element && window.pageYOffset < element.clientHeight - navbarElement.clientHeight) {
      navbarElement.classList.remove('bg-primary');
    } else {
      navbarElement.classList.add('bg-primary');
    }
  }
}
