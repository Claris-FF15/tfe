import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ActivityLogComponent } from './activities/activity-log.component';
import { ProfileComponent } from './profile/profile.component';
import { adminOrSecurityGuard } from './admin-or-security.guard';
import { UsersComponent } from './users/users.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserCreateComponent } from './user-create/user-create.component';
import { BadgesComponent } from './badges/badges.component';
import { BadgeCreateComponent } from './badge-create/badge-create.component';
import { BadgeDetailComponent } from './badge-detail/badge-detail.component';
import { ActivityDetailComponent } from './activities-detail/activity-detail.component';
import { IncidentsComponent } from './incidents/incidents.component';
import { ZonesComponent } from './zones/zones.component';
import { ZoneCreateComponent } from './zone-create/zone-create.component';
import { DoorDetailComponent } from './door-detail/door-detail.component';


export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: 'activities',component: ActivityLogComponent },
  { path: 'profile', component: ProfileComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'users', component: UsersComponent, canActivate: [adminOrSecurityGuard]},
  { path: 'users/new', component: UserCreateComponent, canActivate: [adminOrSecurityGuard] },
  { path: 'users/:id', component: UserDetailComponent, canActivate: [adminOrSecurityGuard] },
  { path: 'badges', component: BadgesComponent, canActivate: [adminOrSecurityGuard] },
  { path: 'badges/new', component: BadgeCreateComponent, canActivate: [adminOrSecurityGuard] },
  { path: 'badges/:id', component: BadgeDetailComponent, canActivate: [adminOrSecurityGuard] },
  { path: 'activities/:id', component: ActivityDetailComponent, canActivate: [adminOrSecurityGuard] },
  { path: 'incidents', component: IncidentsComponent, canActivate: [adminOrSecurityGuard] },
  { path: 'zones', component: ZonesComponent, canActivate: [adminOrSecurityGuard] },
  { path: 'zones/new', component: ZoneCreateComponent, canActivate: [adminOrSecurityGuard] },
  { path: 'doors/:id', component: DoorDetailComponent, canActivate: [adminOrSecurityGuard] },
  ];