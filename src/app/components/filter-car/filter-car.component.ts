import { Component, OnInit } from '@angular/core';
import { Brand } from 'src/app/models/brand';
import { Color } from 'src/app/models/color';
import { BrandService } from 'src/app/services/brand.service';
import { CarService } from 'src/app/services/car.service';
import { ColorService } from 'src/app/services/color.service';

@Component({
  selector: 'app-filter-car',
  templateUrl: './filter-car.component.html',
  styleUrls: ['./filter-car.component.css']
})
export class FilterCarComponent implements OnInit {
  brands:Brand[];
  colors:Color[];
  currentBrandId:number;
  currentColorId:number;

  constructor(private brandService:BrandService,
    private colorService:ColorService){}
  
  ngOnInit(): void {
    this.getBrands();
    this.getColors();
  }

  getBrands(){
    this.brandService.getBrands().subscribe((response)=>{
      this.brands=response.data
    })
  }

  getColors(){
    this.colorService.getColors().subscribe((response)=>{
      this.colors=response.data
    })
  }

  setCurrentBrand(brandId:number){
    return(brandId===this.currentBrandId?true:false)
  }
  
  setCurrentColor(colorId:number){
    return(colorId===this.currentColorId?true:false)
  }
}
