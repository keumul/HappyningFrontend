import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { RateUser } from '../dto/rate-user.dto';

@Component({
  selector: 'app-user-rating',
  templateUrl: './user-rating.component.html',
  styleUrls: ['./user-rating.component.css']
})
export class UserRatingComponent implements OnInit {
  userId!: number;
  userRate!: RateUser[];

  constructor(private userService: UserService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // this.route.params.subscribe(params => {
    //   this.userId = +params['id'];
    // });

    // this.userService.viewUserRate(this.userId).subscribe(data => {
    //   this.userRate = data.rate;
    // });

    this.currentUserRate();
  }

  removeRate() {
    this.userService.removeUserRate(this.userId).subscribe(() => {
    });
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

  starsArray(): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }


}
