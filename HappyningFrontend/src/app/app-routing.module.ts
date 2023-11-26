import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { EventCardComponent } from './event-card/event-card.component';
import { EditorComponent } from './editor/editor.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
  { path: 'auth', component: AuthComponent},
  { path: 'home', component: HomeComponent},
  { path: 'profile', component: ProfileComponent},
  { path: 'event/:eventId', component: EventCardComponent},
  { path: 'editor', component: EditorComponent},
  { path: 'user/:userId', component: UserComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
