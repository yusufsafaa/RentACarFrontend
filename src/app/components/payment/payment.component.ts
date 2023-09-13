import { Component, OnInit } from '@angular/core';
import { FormGroup,FormBuilder,FormControl,Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CarDetail } from 'src/app/models/carDetail';
import { CartItem } from 'src/app/models/cartItem';
import { CreditCard } from 'src/app/models/creditCard';
import { Customer } from 'src/app/models/customer';
import { CustomerCreditCard } from 'src/app/models/customerCreditCard';
import { Payment } from 'src/app/models/payment';
import { CarDetailService } from 'src/app/services/car-detail.service';
import { CartService } from 'src/app/services/cart.service';
import { CreditCardService } from 'src/app/services/credit-card.service';
import { CustomerService } from 'src/app/services/customer.service';
import { DateTimeService } from 'src/app/services/date-time.service';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit{
  cartItems:CartItem[]=[];
  carDetails:CarDetail[]=[];
  creditCardAddForm:FormGroup;
  saveCreditCard:boolean=false;
  totalPriceOfPayment=0;
  paymentModel:Payment=new Payment;
  cardHolderFullName:string="";
  cardNumber:string="";
  expireYear:string="";
  expireMonth:string="";
  cvc:string="";

  constructor(private toastrService:ToastrService,
    private formBuilder:FormBuilder,
    private creditCardService:CreditCardService,
    private customerService:CustomerService,
    private cartService:CartService,
    private carDetailService:CarDetailService,
    private dateTimeService:DateTimeService,
    private paymentService:PaymentService){}
  
  ngOnInit(): void {
    this.createCreditCardAddForm();
    this.getCartItems();
  }

  createCreditCardAddForm(){
    this.creditCardAddForm=this.formBuilder.group({
      cardHolderFullName:["",[Validators.required,Validators.minLength(4)]],
      cardNumber:["",[Validators.required,Validators.minLength(16)]],
      expireYear:["",[Validators.required,Validators.minLength(2)]],
      expireMonth:["",[Validators.required,Validators.minLength(2)]],
      cvc:["",[Validators.required,Validators.minLength(3)]]
    });
  }

  checkout(){
    if(this.creditCardAddForm.valid){
      this.checkBalance();
      console.log("Başarılı")
    }
    else{
      this.toastrService.info("Eksik Kart Bilgisi");
    }
  }

  checkBalance(){
    let creditCardModel:CreditCard=Object.assign({balance:20000},this.creditCardAddForm.value);

    if(creditCardModel.balance>this.totalPriceOfPayment){
      
      if(!localStorage.getItem("customerId")){
        this.createNewCustomer();
      }

      if(this.saveCreditCard){
        this.addCreditCard(creditCardModel);
      }
      else{
        this.completePayment();
      }
    }
    else{
      this.toastrService.error("Yetersiz kredi kartı limiti","Hata");
    }
  }

  createNewCustomer(){
    let newCustomerModel:Customer=new Customer;
    newCustomerModel.userId=Number(localStorage.getItem("userId"));
    newCustomerModel.companyName="Test Company Name";

    this.customerService.addCustomer(newCustomerModel).subscribe(responseCustomer=>{
      localStorage.setItem("customerId",responseCustomer.data.id.toString());
    })
  }

  addCreditCard(creditCardModel:CreditCard){
    this.creditCardService.saveCreditCard(creditCardModel).subscribe(responseCreditCard=>{
      this.toastrService.info(responseCreditCard.message);

      this.paymentModel.creditCardId=responseCreditCard.data;
      this.addCustomerCreditCard(responseCreditCard.data);
      this.completePayment();
    })
  }

  addCustomerCreditCard(creditCardId:number){
    let customerCreditCardModel:CustomerCreditCard=new CustomerCreditCard;
    customerCreditCardModel.customerId=Number(localStorage.getItem("customerId"));
    customerCreditCardModel.creditCardId=creditCardId;

    this.creditCardService.saveCreditCardToCustomer(customerCreditCardModel).subscribe(response=>{})
  }

  completePayment(){
    this.paymentModel.customerId=Number(localStorage.getItem("customerId"));
    this.paymentModel.amount=this.totalPriceOfPayment;
    this.paymentModel.paymentDate=new Date(this.dateTimeService.getTimeNow());

    this.paymentService.addPayment(this.paymentModel).subscribe(response=>{
      this.toastrService.success(response.message);
    })
  }

  getCartItems(){
    this.cartService.listOfUserCart(Number(localStorage.getItem("userId"))).subscribe(response=>{
      this.cartItems=response.data;
      this.calculateTotalPriceOfPayment();
      this.getCarDetails();
    })
  }
  
  getCarDetails(){
    for (let i = 0; i < this.cartItems.length; i++) {
      this.carDetailService.getCarDetailByCarId(this.cartItems[i].carId).subscribe(response=>{
        let newCarDetail:CarDetail[]=response.data;
        this.carDetails[i]=newCarDetail[0];
      })
    }
  }

  calculateTotalPriceOfPayment(){
    for (let i = 0; i < this.cartItems.length; i++) {
      this.totalPriceOfPayment+=this.cartItems[i].totalPrice
    }
    
    return this.totalPriceOfPayment;
  }
}