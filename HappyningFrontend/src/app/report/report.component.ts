import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { RateUser } from '../dto/rate-user.dto';
import { User } from '../dto/user.dto';
import { Event } from '../dto/event.dto';
import { saveAs } from 'file-saver';
import { EventService } from '../services/event.service';
import { ParticipantService } from '../services/participant.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  users!: User[];
  events!: Event[];
  averageRating: number | null = null;
  averageEventRating: number | null = null;
  totalUsers: number = 0;
  totalEvents: number = 0;
  highestRatedUser: string | null = null;
  mostPopularEvent: string | null = null;
  lowestRatedUser: string | null = null;
  leastPopularEvent: string | null = null;
  ratings: RateUser[] = [];

  userRatingsChartOptions: any = {
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

  userRatingsChartLabels: string[] = [];
  userRatingsChartData: any[] = [{ data: [], label: 'Оценка' }];

  eventsChartOptions: any = {
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
          max: 100,
          stepSize: 10,
        },
      }],
    },
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Заполненность события',
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
    backgroundColor: 'rgba(210,222,50, 0.2)',
    hoverBackgroundColor: 'rgba(210,222,50, 0.4)',
    borderColor: 'rgba(210,222,50, 1)',
    borderWidth: 1
  };


  eventsChartLabels: string[] = [];
  eventsChartData: any[] = [{ data: [], label: 'Заполненность события (% из 100)' }];

  barChartLegend: boolean = true;
  barChartPlugins: any[] = [];

  constructor(
    private userService: UserService,
    private eventService: EventService,
    private participantService: ParticipantService
  ) { }

  ngOnInit(): void {
    this.loadRatings();
    this.loadEvents();
  }

  loadRatings(): void {
    this.userService.findAllUserRates().subscribe(
      (ratings: any[]) => {
        this.ratings = ratings;

        const userRatings: { [username: string]: { sum: number; count: number } } = {};

        for (const rating of this.ratings) {
          const userId = rating.ratedId;

          if (!userRatings[userId]) {
            userRatings[userId] = { sum: 0, count: 0 };
          }
          userRatings[userId].sum += rating.rate;
          userRatings[userId].count += 1;
        }

        this.userRatingsChartLabels = Object.keys(userRatings);
        this.userRatingsChartData[0].data = this.userRatingsChartLabels.map(userId => {
          const average = userRatings[userId].sum / userRatings[userId].count;
          return isNaN(average) ? 0 : average;
        });

        const totalRatings = ratings.length;
        if (totalRatings > 0) {
          const sum = ratings.reduce((acc, rating) => acc + rating.value, 0);
          this.averageRating = sum / totalRatings;
          this.totalUsers = this.userRatingsChartLabels.length;

          const highestRatedUser = this.userRatingsChartLabels.reduce((max, userId) => {
            const userAverage = userRatings[userId].sum / userRatings[userId].count;
            return userAverage > userRatings[max].sum / userRatings[max].count ? userId : max;
          });
          this.highestRatedUser = highestRatedUser;

          const lowestRatedUser = this.userRatingsChartLabels.reduce((min, userId) => {
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

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe(
      (events: Event[]) => {
        this.events = events;
        this.prepareChartData();
        this.calculateEventStats();
      },
      (error) => {
        console.error('Error loading events', error);
      }
    );
  }

  prepareChartData(): void {
    this.eventsChartLabels = this.events.map((event: Event) => {
      return event.title;
    });

    const participantPromises = this.events.map(event =>
      this.participantService.findAllEventParticipants(event.id).toPromise()
    );

    Promise.all(participantPromises)
      .then(participantsCounts => {
        this.eventsChartData[0].data = participantsCounts.map((count, index) => {
          const maxParticipants = this.events[index].maxGuestAmount;

          return (+count.length / maxParticipants) * 100;
        });
      })
      .catch(error => {
        console.error('Error loading participants counts', error);
      });
  }

  calculateEventStats(): void {
    this.totalEvents = this.events.length;

    if (this.totalEvents > 0) {
      const eventParticipantsCounts = this.events.map(event =>
        this.participantService.findAllEventParticipants(event.id).toPromise()
      );

      Promise.all(eventParticipantsCounts)
        .then(participantsCounts => {
          const eventPopularity = participantsCounts.map((count, index) => ({
            event: this.events[index].title,
            popularity: count.length
          }));

          const mostPopularEvent = eventPopularity.reduce((max, event) =>
            event.popularity > max.popularity ? event : max, eventPopularity[0]);

          const leastPopularEvent = eventPopularity.reduce((min, event) =>
            event.popularity < min.popularity ? event : min, eventPopularity[0]);

          this.mostPopularEvent = mostPopularEvent.event;
          this.leastPopularEvent = leastPopularEvent.event;
        })
        .catch(error => {
          console.error('Error calculating event stats', error);
        });
    }
  }

  generateUserReport(): void {
    const userRatingsReportContent = `
      Отчет по успеваемости пользователей
      -------------------
      Всего участников: ${this.totalUsers}
      Самая высокая успеваемость (ID): ${this.highestRatedUser || 'N/A'}
      Самая низкая успеваемость (ID): ${this.lowestRatedUser || 'N/A'}
      Рейтинги пользователей:
      ${this.ratings.map((rating, index) => {
        const userRatingInfo = `${index + 1}. ID ${rating.ratedId}\n` +
                               `  Оценка: ${rating.rate}\n` +
                               `  Коммента: ${rating.message}\n\n`;
        return userRatingInfo;
      }).join('')}
    `;
  
    const userRatingsBlob = new Blob([userRatingsReportContent], { type: 'text/plain;charset=utf-8' });
    saveAs(userRatingsBlob, 'user_ratings_report.txt');
  }
  

  generateEventReport(): void {
    const eventsReportContent = `
      Отчет по событиям
      -------------------
      ${this.events.map((event, index) => {
      const eventInfo = `Событие #${index + 1}: ${event.title}\n` +
        `Организатор: ${event.organizerId}\n` +
        `Максимальное количество участников: ${event.maxGuestAmount}\n` +
        `Зарегистрированных участников: ${this.eventsChartData[0].data[index]}\n\n`;
      return eventInfo;
    }).join('')}`;
    const eventsBlob = new Blob([eventsReportContent], { type: 'text/plain;charset=utf-8' });
    saveAs(eventsBlob, 'events_report.txt');
  }
}
