import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ActivityLogComponent } from './activities/activity-log.component';
import { ProfileComponent } from './profile/profile.component';
import { adminOrSecurityGuard } from './admin-or-security.guard';
import { UsersComponent } from './users/users.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserCreateComponent } from './user-create/user-create.component';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'activities',component: ActivityLogComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'users', component: UsersComponent, canActivate: [adminOrSecurityGuard]},
  { path: 'users/new', component: UserCreateComponent, canActivate: [adminOrSecurityGuard] },
  { path: 'users/:id', component: UserDetailComponent, canActivate: [adminOrSecurityGuard] },
];