import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './login/login.component';
import { MatCardModule } from '@angular/material/card';
import { RegistrationComponent } from './registration/registration.component';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { HomeComponent } from './home/home.component';
import { CalendarComponent } from './calendar/calendar.component';
import { ChunkPipe } from './chunk.pipe';
import { UserRatingComponent } from './user-rating/user-rating.component';
import { EventComponent } from './event/event.component';
import { HeaderComponent } from './header/header.component';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { ProfileComponent } from './profile/profile.component';
import { EventCardComponent } from './event-card/event-card.component';
import { EditorComponent } from './editor/editor.component';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { EventRegistrationComponent } from './event-registration/event-registration.component';
import { EllipsisPipe } from './ellipsis.pipe';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserComponent } from './user/user.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { ChatComponent } from './chat/chat.component';
import { NotificationComponent } from './notification/notification.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule } from '@angular/material/icon';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ReportComponent } from './report/report.component';
import { NgChartsModule } from 'ng2-charts';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { ErrorComponent } from './error/error.component';
import { DUIButton, DUIAlert } from "david-ui-angular";
import { FooterComponent } from './footer/footer.component';
import { EventListComponent } from './event-list/event-list.component';
import { RoleErrorComponent } from './role-error/role-error.component';
import { ModeratorHomeComponent } from './moderator-home/moderator-home.component';
import { BannedErrorComponent } from './banned-error/banned-error.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    LoginComponent,
    RegistrationComponent,
    HomeComponent,
    CalendarComponent,
    ChunkPipe,
    UserRatingComponent,
    EventComponent,
    HeaderComponent,
    ProfileComponent,
    EventCardComponent,
    EditorComponent,
    EventRegistrationComponent,
    EllipsisPipe,
    UserComponent,
    ChatComponent,
    NotificationComponent,
    AdminHomeComponent,
    ReportComponent,
    ErrorComponent,
    FooterComponent,
    EventListComponent,
    RoleErrorComponent,
    ModeratorHomeComponent,
    BannedErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    HttpClientModule,
    MatOptionModule,
    MatSelectModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatDialogModule,
    MatBadgeModule,
    MatIconModule,
    NgChartsModule,
    MatToolbarModule,
    MatMenuModule,
    MatTabsModule,

    DUIButton,
    DUIAlert
  ],
  providers: [
    [
      {
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true
      }
    ],
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
