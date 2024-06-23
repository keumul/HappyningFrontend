import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private apiUrl = 'http://localhost:5000/api/participants';

  constructor(private http: HttpClient) {}

  addParticipant(dto: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, dto);
  }

  findAllEventParticipants(eventId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${eventId}`);
  }

  findEventParticipant(eventId: number, dto: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/event/user/${eventId}`, { params: dto });
  }

  findEventParticipantsAge(eventId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/age/${eventId}`);
  }

  findMostPopularEvent(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mostpopular`);
  }

  findMostPopularCategory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mostpopular/category`);
  }

  findMostPopularFormat(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mostpopular/format`);
  }

  findUserEvents(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all/user/${userId}`);
  }

  removeEventParticipant(eventId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${eventId}`);
  }
}
