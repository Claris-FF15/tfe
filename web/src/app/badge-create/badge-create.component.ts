import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BadgeService } from '../services/badge.service';

@Component({
  selector: 'app-badge-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './badge-create.component.html',
  styleUrls: ['./badge-create.component.sass']
})
export class BadgeCreateComponent {

  errorMessage = '';

  createForm;

  constructor(
    private fb: FormBuilder,
    private badgeService: BadgeService,
    private router: Router
  ) {
    this.createForm = this.fb.group({
      uid: ['', Validators.required],
      user_id: this.fb.control<number | null>(null, Validators.required),
      active: [true]
    });
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      return;
    }

    this.badgeService.createBadge({
      uid: this.createForm.value.uid!,
      user_id: this.createForm.value.user_id!,
      active: this.createForm.value.active!
    }).subscribe({
      next: () => {
        this.router.navigate(['/badges']);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Erreur lors de la création';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/badges']);
  }
}