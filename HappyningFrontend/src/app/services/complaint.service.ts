import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ComplaintService {
    private baseUrl = 'http://localhost:5000/api/complaints';

    constructor(private http: HttpClient) { }

    findAllMessageComplaints(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/message`);
    }

    findAllEventComplaints(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/event`);
    }

    findEventComplaint(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/event/${id}`);
    }

    findMessageComplaint(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/message/${id}`);
    }

    createMessageComplaint(messageId: number, categoryId: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/message/${messageId}/${categoryId}`, {});
    }

    createEventComplaint(eventId: number, categoryId: number): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/event/${eventId}/${categoryId}`, {});
    }

    findAllComplaintsCategories(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/categories`);
    }

    createComplaintsCategory(dto: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/categories`, dto);
    }

    findComplaintsCategory(id: number): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/categories/${id}`);
    }

    updateComplaintsCategory(id: number, dto: any): Observable<any> {
        return this.http.patch<any>(`${this.baseUrl}/categories/${id}`, dto);
    }

    removeComplaintsCategory(id: number): Observable<any> {
        return this.http.delete<any>(`${this.baseUrl}/categories/${id}`);
    }

    findUserMessageComplaints(userId: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/message/user/${userId}`);
    }

    findUserEventComplaints(userId: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/event/user/${userId}`);
    }
}
