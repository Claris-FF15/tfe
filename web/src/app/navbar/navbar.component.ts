import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, CurrentUser } from '../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.sass']
})
export class NavbarComponent {
  collapsed = false;
  currentUser$: Observable<CurrentUser | null>;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}