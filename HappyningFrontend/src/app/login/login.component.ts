import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage?: string
  username!: string;
  password!: string;
  activationCode!: string;
  user!: any;
  isActivationCode = false;

  constructor(
    private authService: AuthService,
    private router: Router) { }

  ngOnInit(): void {
    this.errorMessage = ''
  }

  errorMessageRandom() {
    var messages = ['Try again!', 'No, its not valid',
      'Please, try again', 'Invalid activation code',
      'Check your email again', 'Try another code']
    var message = messages[Math.floor(Math.random() * messages.length)];
    return message;
  }

  activationCodeStatus() {
    this.authService.sendCredentials(this.username, this.password, "nocode").subscribe((data: any) => {

      if (data) {

        this.authService.confirmationStatus(this.username).subscribe((statusData: any) => {
          if (!statusData) {
            this.isActivationCode = true;
            this.errorMessage = '';
            this.authService.resendCode(this.username).subscribe((resendData: any) => {
              console.log(resendData);
            })
          } else if (statusData) {
            this.isActivationCode = false;
            window.sessionStorage.setItem('access_token', data.access_token);
            this.router.navigate(['/home']);
          }
        }
        );
      }
    }, error => {
      this.errorMessage = 'Invalid username or password'
      console.log(error);
    });
  }

  checkCredentials(activationCode: string) {
    try {
      this.authService.sendCredentials(this.username, this.password, activationCode)      
        .subscribe((data: any) => {
          
          window.sessionStorage.setItem('access_token', data.access_token);
          this.username = ''
          this.password = ''
          if (this.authService.getCurrentUser()?.role == 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/home']);
          }
        }, error => {
          this.errorMessage = this.errorMessageRandom();
        })
    } catch (error) {
      console.log(error);
    }
  }
}
