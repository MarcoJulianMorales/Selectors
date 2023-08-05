import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { ISmallCountry, Region } from '../../interfaces/country.interface';
import { filter, map, switchMap, tap } from 'rxjs';

@Component({
  selector: 'counrties-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit{
  public countriesByRegion: ISmallCountry [] = [];
  public borders: ISmallCountry[] = [];
  
  public myForm: FormGroup = this.formBuilder.group({
    region: ['', [Validators.required]],
    country: ['', [Validators.required]],
    border: ['', [Validators.required]]
  });
  
  constructor(private formBuilder: FormBuilder, private countriesService: CountriesService){}

  ngOnInit(): void {
    this.onRegionChanged();
    this.onCountryChanged();
  }

  get regions(): Region[]{
    return this.countriesService.regions;
  }

  onRegionChanged(): void{
    this.myForm.get('region')!.valueChanges
    .pipe(
      tap(() => this.myForm.get('country')!.setValue('')),
      tap(() => this.borders = []),
      switchMap(region => this.countriesService.getCountriesByRegion(region))
    )
    .subscribe( countries => {
      this.countriesByRegion = countries;
    });
  }

  onCountryChanged(): void{
    this.myForm.get('country')!.valueChanges
    .pipe(
      tap(() => this.myForm.get('border')!.setValue('')),
      filter((value:string) => (value.length > 0) ),
      switchMap((code) => this.countriesService.getCountryByAlphaCode(code)),
      switchMap(country => this.countriesService.getCountryBordersByAlphaCode(country.borders))
    )
    .subscribe(countries => {
      console.log(countries)
      this.borders = countries
    })
  }
}