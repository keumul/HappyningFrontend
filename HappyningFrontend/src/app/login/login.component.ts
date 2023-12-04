import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../dto/user.dto';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage?: string
  username!: string;
  password!: string;
  user!: any;

  constructor(
    private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.errorMessage = ''
  }

  checkCredentials() {
    try {
      this.authService.sendCredentials(this.username, this.password).subscribe((data: any) => {
        window.sessionStorage.setItem('access_token', data.access_token);
        this.username = ''
        this.password = ''
      }, error => {
        this.errorMessage = '*Неверный логин или пароль'
      })

      this.user = this.authService.getCurrentUser();

      if(this.user.isAdmin == true) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/home']);
      }

    } catch (error) {
      console.log(error);
    }
  }
}
