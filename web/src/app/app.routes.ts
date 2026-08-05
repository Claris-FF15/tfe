import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ActivityLogComponent } from './activities/activity-log.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'activities',component: ActivityLogComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];