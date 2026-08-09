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

  showPasswordForm = false;
  passwordSuccess = '';
  passwordError = '';

  nameForm;
  passwordForm;

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

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
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

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordForm.reset();
    this.passwordSuccess = '';
    this.passwordError = '';
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

  onChangePassword(user: CurrentUser): void {
    if (this.passwordForm.invalid) {
      return;
    }

    const { current_password, new_password, confirm_password } = this.passwordForm.value;

    if (new_password !== confirm_password) {
      this.passwordError = 'Les mots de passe ne correspondent pas';
      this.cdr.detectChanges();
      return;
    }

    this.authService.changePassword(user.id, current_password!, new_password!).subscribe({
      next: () => {
        this.passwordSuccess = 'Mot de passe modifié avec succès';
        this.passwordForm.reset();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.passwordError = err.error?.detail ?? 'Erreur lors du changement de mot de passe';
        this.cdr.detectChanges();
      }
    });
  }
}