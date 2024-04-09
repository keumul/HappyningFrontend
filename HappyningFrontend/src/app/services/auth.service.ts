import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://localhost:5000/api/auth';

    constructor(private http: HttpClient) { }

    resendCode(email: string) {
        return this.http.post<any[]>(`${this.baseUrl}/resendCode`, { email: email });
    }

    sendCredentials(username: string, password: string, activationCode: string) : Observable<String>{
        return this.http.post<any>(`${this.baseUrl}/signin`, { username: username, password: password, activationCode: activationCode});
    }

    registerUser(username: string, password: string, email: string, bday: Date, role: string) {
        return this.http.post<any[]>(`${this.baseUrl}/signup`, { username: username, password: password, email: email, bday: bday, role: role})
    }

    confirmationStatus(username: string) {
        return this.http.get<any[]>(`${this.baseUrl}/confirm/${username}`);
    }

    validateUser(username: string, password: string) {
        return this.http.post<any[]>(`${this.baseUrl}/validate`, { username: username, password: password});
    }

    getToken() {
        return window.sessionStorage.getItem('access_token');
    }

    isLoggedIn(): boolean {
        return this.getToken() != null;
    }

    getCurrentUser() {
        const jwtToken = this.getToken();
        if (!jwtToken)
            return
        const tokenParts = jwtToken!.split('.');
        const encodedPayload = tokenParts[1];
        const decodedPayload = atob(encodedPayload);
        const payload = JSON.parse(decodedPayload);
        return { id: payload.sub, username: payload.username, role: payload.role, isConfirmed: payload.isConfirmed}
    }

    isAdmin(): boolean {
        if (window.sessionStorage.getItem('isAdmin') == 'true')
            return true
        return false;
    }

    logout() {
        window.sessionStorage.clear();
    }
}