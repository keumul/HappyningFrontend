import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { RateUser } from '../dto/rate-user.dto';
import { User } from '../dto/user.dto';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  users!: User[];
  averageRating: number | null = null;
  totalUsers: number = 0;
  highestRatedUser: string | null = null;
  lowestRatedUser: string | null = null;
  ratings: RateUser[] = [];
  barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      xAxes: [{
        ticks: {
          beginAtZero: true,
        },
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true,
        },
      }],
    },
    legend: {
      display: true,
    },
    backgroundColor: 'rgba(210,222,50, 0.2)',
    hoverBackgroundColor: 'rgba(210,222,50, 0.4)',
    borderColor: 'rgba(210,222,50, 1)',
    borderWidth: 1,
  };

  barChartLabels: string[] = [];
  barChartType: string = 'bar';
  barChartLegend: boolean = true;
  barChartPlugins: any = [];
  barChartData: any[] = [{ data: [], label: 'Оценка' }];
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadRatings();
  }

  loadRatings(): void {
    this.userService.findAllUserRates().subscribe(
      (ratings: any[]) => {
        this.ratings = ratings;
        console.log(this.ratings);

        const userRatings: { [username: string]: { sum: number; count: number } } = {};

        for (const rating of this.ratings) {
          const userId = rating.ratedId;

          if (!userRatings[userId]) {
            userRatings[userId] = { sum: 0, count: 0 };
          }
          userRatings[userId].sum += rating.rate;
          userRatings[userId].count += 1;
        }

        this.barChartLabels = Object.keys(userRatings);
        this.barChartData[0].data = this.barChartLabels.map(userId => {
          const average = userRatings[userId].sum / userRatings[userId].count;
          return isNaN(average) ? 0 : average;
        });

        const totalRatings = ratings.length;
        if (totalRatings > 0) {
          const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
          this.averageRating = sum / totalRatings;
          this.totalUsers = this.barChartLabels.length;

          const highestRatedUser = this.barChartLabels.reduce((max, userId) => {
            const userAverage = userRatings[userId].sum / userRatings[userId].count;
            return userAverage > userRatings[max].sum / userRatings[max].count ? userId : max;
          });
          this.highestRatedUser = highestRatedUser;

          const lowestRatedUser = this.barChartLabels.reduce((min, userId) => {
            const userAverage = userRatings[userId].sum / userRatings[userId].count;
            return userAverage < userRatings[min].sum / userRatings[min].count ? userId : min;
          });


          this.lowestRatedUser = lowestRatedUser;
        }
      },
      (error) => {
        console.error('Error loading ratings', error);
      }
    );
  }

  generateReport(): void {
    const reportContent = `
      Отчет по успеваемости пользователей
      -------------------
  
      Средняя успеваемость: ${this.averageRating || 'N/A'}
      Всего участников: ${this.totalUsers}
      Самая высокая успевамость (ID): ${this.highestRatedUser || 'N/A'}
      Самая низкая успеваемость (ID): ${this.lowestRatedUser || 'N/A'}
  
      Рейтинги пользователей:
      ${this.barChartLabels.map((username, index) => `${index + 1}. ${username}: ${this.barChartData[0].data[index]}`).join('\n')}`;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'user_ratings_report.txt');
  }
}
