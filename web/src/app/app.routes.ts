import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ActivityLogComponent } from './activities/activity-log.component';
import { ProfileComponent } from './profile/profile.component'

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'activities',component: ActivityLogComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];