import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interface';
import { combineLatest, map, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private readonly baseUrl: string = 'https://restcountries.com/v3.1';

  private readonly _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];
  constructor(private readonly http: HttpClient) {}

  get regions(): Region[] {
    return [...this._regions];
  }
  getCountryByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);
    const url: string = `${this.baseUrl}/region/${region}?fields=name,cca3,borders`;

    return this.http.get<Country[]>(url).pipe(
      map((countries) =>
        countries.map((country) => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      )
    );
  }

  getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
    if (!alphaCode) return of();
    const url: string = `${this.baseUrl}/alpha/${alphaCode}?fields=name,cca3,borders`;

    return this.http.get<Country>(url).pipe(
      map((country) => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? [],
      }))
    );
  }

  getCountryBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([]);
    const countriesRequest: Observable<SmallCountry>[] = [];
    borders.forEach((code) => {
      const request = this.getCountryByAlphaCode(code);
      countriesRequest.push(request);
    });
    return combineLatest(countriesRequest);
  }
}
