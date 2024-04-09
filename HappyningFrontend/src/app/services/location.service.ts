import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private baseUrl = 'http://localhost:5000/api/locations';

  constructor(private http: HttpClient) {}

    //CITY
    createCity(id: number, dto: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/city/${id}`, dto);
    }

    getAllCities(): Observable<any> {
        return this.http.get(`${this.baseUrl}/city`);
    }

    getCityById(id: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/city/${id}`);
    }

    getCitiesByCountry(id: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/city/country/${id}`);
    }

    updateCity(id: number, dto: any): Observable<any> {
        return this.http.patch(`${this.baseUrl}/city/${id}`, dto);
    }

    deleteCity(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/city/${id}`);
    }

    //COUNTRY

    createCountry(dto: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/country`, dto);
    }

    getAllCountries(): Observable<any> {
        return this.http.get(`${this.baseUrl}/country`);
    }

    getCountryById(id: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/country/${id}`);
    }

    updateCountry(id: number, dto: any): Observable<any> {
        return this.http.patch(`${this.baseUrl}/country/${id}`, dto);
    }

    deleteCountry(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/country/${id}`);
    }

    //LOCATION

    createLocation(id: number, details: string, cityId: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/location/${id}`, { details: details, cityId: id});
    }

    getAllLocations(): Observable<any> {
        return this.http.get(`${this.baseUrl}/location`);
    }

    getLocationById(id: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/location/${id}`);
    }

    getLocationsByCity(id: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/location/city/${id}`);
    }

    updateLocation(id: number, dto: any): Observable<any> {
        return this.http.patch(`${this.baseUrl}/location/${id}`, dto);
    }

    deleteLocation(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/location/${id}`);
    }

}
