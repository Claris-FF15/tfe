import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    if (this.authService.getToken()) {
      this.authService.fetchCurrentUser().subscribe({
        error: () => this.authService.logout() // logout() marque aussi userLoaded$ à true
      });
    } else {
      this.authService.logout(); // pas de token → pas connecté, mais "chargé" quand même
    }
  }
}