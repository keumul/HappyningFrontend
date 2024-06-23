import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { EventCardComponent } from './event-card/event-card.component';
import { EditorComponent } from './editor/editor.component';
import { UserComponent } from './user/user.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';
import { ModeratorHomeComponent } from './moderator-home/moderator-home.component';
import { BannedErrorComponent } from './banned-error/banned-error.component';
import { PreferenceComponent } from './preference/preference.component';
import { InformationComponent } from './information/information.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'home', component: HomeComponent },
  { path: 'admin', component: AdminHomeComponent },
  { path: 'moderator', component: ModeratorHomeComponent},
  { path: 'banned', component: BannedErrorComponent},
  { path: 'profile', component: ProfileComponent },
  { path: 'event/:eventId', component: EventCardComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'user/:userId', component: UserComponent },
  { path: 'preference', component: PreferenceComponent },
  { path: 'information', component: InformationComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
