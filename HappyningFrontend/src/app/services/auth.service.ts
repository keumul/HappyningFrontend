import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://localhost:5000/api/auth';

    constructor(private http: HttpClient) { }

    sendCredentials(username: string, password: string) {
        return this.http.post<any[]>(`${this.baseUrl}/signin`, { username: username, password: password });
    }

    registerUser(username: string, password: string, email: string, bday: Date) {
        return this.http.post<any[]>(`${this.baseUrl}/signup`, { username: username, password: password, email: email, bday: bday, isAdmin: false })
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
        return { id: payload.sub, username: payload.username, isAdmin: payload.isAdmin }
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