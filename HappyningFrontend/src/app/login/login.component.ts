import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) { }
  ngOnInit(): void {
    this.errorMessage = ''
  }

  checkCredentials() {
    try {
      this.authService.sendCredentials(this.username, this.password).subscribe((data: any) => {
        window.sessionStorage.setItem('access_token', data.access_token);
        this.username = ''
        this.password = ''
        this.router.navigate(['/home']);

        return;
      }, error => {
        this.errorMessage = '*Неверный логин или пароль'
      })
    } catch (error) {
      console.log(error);
    }
  }

  errorMessage?: string
  username!: string;
  password!: string;
}
