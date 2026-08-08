import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService, CurrentUser } from '../services/auth.service';
import { BadgeService, UserBadge } from '../services/badge.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.sass']
})
export class ProfileComponent implements OnInit {

  currentUser$: Observable<CurrentUser | null>;

  badge: UserBadge | null = null;
  badgeLoading = true;
  badgeError = false;

  editMode = false;
  successMessage = '';
  errorMessage = '';

  nameForm;

  constructor(
    private authService: AuthService,
    private badgeService: BadgeService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser$ = this.authService.currentUser$;

    this.nameForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      if (user) {
        this.nameForm.patchValue({
          first_name: user.first_name,
          last_name: user.last_name
        });
        this.cdr.detectChanges();
      }
    });

    this.badgeService.getMyBadge().subscribe({
      next: (badge) => {
        this.badge = badge;
        this.badgeLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.badgeLoading = false;
        this.badgeError = true;
        this.cdr.detectChanges();
      }
    });
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
    this.successMessage = '';
    this.errorMessage = '';
    this.cdr.detectChanges();
  }

  onSave(user: CurrentUser): void {
    if (this.nameForm.invalid) {
      return;
    }

    this.authService.updateName(
      user.id,
      this.nameForm.value.first_name!,
      this.nameForm.value.last_name!
    ).subscribe({
      next: () => {
        this.successMessage = 'Profil mis à jour avec succès';
        this.editMode = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la mise à jour';
        this.cdr.detectChanges();
      }
    });
  }
}