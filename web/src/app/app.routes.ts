import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ActivitiesComponent } from './list/activities.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'activities',component: ActivitiesComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];