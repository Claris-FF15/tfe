import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { SecurityAlertService, SecurityAlert } from './services/security-alert.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, OnDestroy {

  showNavbar = true;
  alerts: SecurityAlert[] = [];

  private pollingSub?: Subscription;

  constructor(
    private authService: AuthService,
    private securityAlertService: SecurityAlertService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.showNavbar = !event.urlAfterRedirects.startsWith('/login');
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    if (this.authService.getToken()) {
      this.authService.fetchCurrentUser().subscribe({
        error: () => this.authService.logout()
      });
    } else {
      this.authService.logout();
    }

    this.pollingSub = interval(15000).pipe(
      switchMap(() => this.securityAlertService.getUnacknowledged())
    ).subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.securityAlertService.getUnacknowledged().subscribe({
      next: (alerts) => {
        this.alerts = alerts;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }

  dismissAlert(alertId: number): void {
    this.securityAlertService.acknowledge(alertId).subscribe({
      next: () => {
        this.alerts = this.alerts.filter(a => a.id !== alertId);
        this.cdr.detectChanges();
      }
    });
  }
}