import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { RateUser } from '../dto/rate-user.dto';
import { NavigationEnd, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-rating',
  templateUrl: './user-rating.component.html',
  styleUrls: ['./user-rating.component.css']
})
export class UserRatingComponent implements OnInit {
  userId: number | undefined;
  userRate!: RateUser[];
  canRate: boolean = true;
  newRating: number = 5;
  newComment: string = "";
  currentUser!: number;

  constructor(private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private _snackBar: MatSnackBar,) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['userId'] ? +params['userId'] : undefined;
      this.loadUserRating();
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.route.paramMap.subscribe(params => {
          const userId = params.get('id');
          this.userId = userId ? +userId : undefined;
          this.loadUserRating();
        });
      }
    });

    this.userService.whoAmI().subscribe((user) => {
      this.currentUser = user.id;
      if (this.userId && this.userId != this.currentUser) {
        this.canRate = true;
      } else {
        this.canRate = false;
      }
    });

    this.loadUserRating();
  }


  loadUserRating() {
    if (this.userId) {
      this.userService.viewUserRate(this.userId).subscribe((data: RateUser[]) => {
        this.userRate = data;
      });
    } else {
      this.currentUserRate();
    }
  }

  currentUserRate() {
    this.userService.findCurrentUserRate().subscribe((data: any) => {
      this.userRate = data;
    });
  }

  calculateAverageRating(): number {
    if (this.userRate && this.userRate.length > 0) {
      const totalRating = this.userRate.reduce((sum, rate) => sum + rate.rate, 0);
      return +(totalRating / this.userRate.length).toFixed(2);
    } else {
      return 0;
    }
  }

  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 2000,
      panelClass: ['blue-snackbar']
    })
  }

  starsArray(): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }

  submitRating() {
    if (this.canRate && this.userId) {
      this.userService.rateUser(+this.userId, {
        rate: this.newRating,
        message: this.newComment
      }).subscribe((response) => {
        this.openSnackBar('Вы успешно оставили отзыв');
        this.loadUserRating();
        this.newRating = 5;
        this.newComment = "";
      },
        (error) => {
          this.openSnackBar('Что-то пошло не так');
        }
      );
    }
  }
}
