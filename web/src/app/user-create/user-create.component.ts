import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.sass']
})
export class UserCreateComponent implements OnInit {

  errorMessage = '';
  isSecurityOfficer = false;

  showConfirmModal = false;
  confirmPasswordControl: FormControl<string | null>;
  confirmError = '';

  roles = [
    { id: 2, name: 'user' },
    { id: 1, name: 'admin' },
    { id: 3, name: 'responsable_securite' }
  ];

  createForm;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.confirmPasswordControl = this.fb.control('', Validators.required);

    this.createForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      role_id: this.fb.control<number>(2, Validators.required)
    });

    this.createForm.get('role_id')?.valueChanges.subscribe(roleId => {
      const numericRoleId = Number(roleId);
      const passwordControl = this.createForm.get('password');
      if (this.needsPassword(numericRoleId)) {
        passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
      } else {
        passwordControl?.clearValidators();
        passwordControl?.setValue('');
      }
      passwordControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isSecurityOfficer = user?.role.name.toLowerCase() === 'responsable_securite';
    });
  }

  needsPassword(roleId: number | null | undefined): boolean {
    if (roleId == null) {
      return false;
    }
    const role = this.roles.find(r => r.id === Number(roleId));
    return role?.name !== 'user';
  }

  get passwordRequired(): boolean {
    return this.needsPassword(this.createForm.value.role_id);
  }

  get isTargetingSecurityRole(): boolean {
    return Number(this.createForm.value.role_id) === 3;
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      return;
    }

    if (this.isTargetingSecurityRole) {
      this.confirmPasswordControl.reset();
      this.confirmError = '';
      this.showConfirmModal = true;
      return;
    }

    this.submitUser();
  }

  onConfirmPassword(): void {
    if (this.confirmPasswordControl.invalid) {
      return;
    }
    this.submitUser(this.confirmPasswordControl.value!);
  }

  cancelConfirm(): void {
    this.showConfirmModal = false;
  }

  private submitUser(confirmPassword?: string): void {
    this.userService.createUser({
      first_name: this.createForm.value.first_name!,
      last_name: this.createForm.value.last_name!,
      email: this.createForm.value.email!,
      password: this.createForm.value.password || '',
      role_id: Number(this.createForm.value.role_id),
      confirm_password: confirmPassword
    }).subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: (err) => {
        const message = err.error?.detail ?? 'Erreur lors de la création';
        if (this.showConfirmModal) {
          this.confirmError = message;
        } else {
          this.errorMessage = message;
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}