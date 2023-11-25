import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../dto/user.dto';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = 'http://localhost:5000/api/users';

  constructor(private http: HttpClient) {}

  whoAmI(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/whoami`);
  }

  findAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`);
  }

  findUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/user/${id}`);
  }

  updateUser(id: number, dto: User): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}`, dto);
  }

  removeUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  rateUser(id: number, dto: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/rate/${id}`, dto);
  }

  findCurrentUserRate(): Observable<any> {
    return this.http.get(`${this.baseUrl}/myrate`);
  }

  viewUserRate(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/rate/${id}`);
  }

  removeUserRate(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/rate/${id}`);
  }
}