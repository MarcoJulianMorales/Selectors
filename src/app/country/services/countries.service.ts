import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { ICountry, ISmallCountry, Region } from '../interfaces/country.interface';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private baseUrl: string = 'https://restcountries.com/v3.1';
  private _regions : Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania];

  constructor(private httpclient: HttpClient) { }

  get regions(): Region[]{
    return { ...this._regions };
  } 

  getCountriesByRegion(region: Region): Observable <ISmallCountry[]>{
    if(!region) return of([]);

    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;
    
    return this.httpclient.get<ICountry[]>(url)
    .pipe(
      map(countries => countries.map( country =>({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? []
      })))
    )
  }

  getCountryByAlphaCode(code: string): Observable<ISmallCountry> {
    const url: string = `${this.baseUrl}/alpha/${code}?fields=cca3,name,borders`
    return this.httpclient.get<ICountry>(url)
    .pipe(
      map(country => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? []
      }))
    )
  }

  getCountryBordersByAlphaCode(borders: string[]): Observable<ISmallCountry[]>{
    if(!borders || borders.length==0 ) return of([]);

    const countriesRequests: Observable<ISmallCountry>[] = [];
    borders.forEach( code => {
      const request = this.getCountryByAlphaCode(code);
      countriesRequests.push(request);
    });

    return combineLatest(countriesRequests);
  }
}