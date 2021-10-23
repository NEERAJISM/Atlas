import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'atlas-core';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class DashboardHeaderComponent {
  constructor(public dialog: MatDialog) {}

  openLogoutDialog() {
    const dialogRef = this.dialog.open(LogoutDialogComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }
}

// Logout Dialog

@Component({
  selector: 'app-logout-dialog',
  templateUrl: './logout-dialog.component.html',
})
export class LogoutDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LogoutDialogComponent>,
    private auth: AuthService
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClickLogin() {
    this.auth.signOut();
    this.dialogRef.close();
  }
}
