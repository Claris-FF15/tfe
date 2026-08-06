import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent {

  loginForm;

  errorMessage = "";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        Validators.required
      ]
    });
  }

  onSubmit(){

    if(this.loginForm.invalid){
      return;
    }

    this.authService.login({
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!

    })
    .subscribe({

      next:(response)=>{

        console.log("TOKEN :", response.access_token);
        this.authService.saveToken(
          response.access_token
        );
        this.authService.fetchCurrentUser().subscribe({
          next: () => {
            this.router.navigate(['/activities']);
          },
          error: (err) => {
            console.log("Erreur récupération profil :", err);
            this.router.navigate(['/activities']);
          }
        });
      },
    error:(err)=>{
      console.log("Erreur API :", err);
      this.errorMessage =
        err.error?.detail ??
        err.message ??
        "Erreur de connexion";
    }
    });
  }
}