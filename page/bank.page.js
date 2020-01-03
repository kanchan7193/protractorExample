class bank{
  constructor() { }
 
  get customerlogin() { 
    return element(by.css('[ng-click="customer()"]'));
  }
  get userSelect() { 
    return element(by.css('#userSelect'))
  }
  get defaultbtn(){
    return element(by.css('.btn.btn-default'))
  }
  get accountselect(){
    return element(by.css('#accountSelect'))
  }
  get withdrawbtn(){
    return element(by.css('[ng-click="withdrawl()"]'))
  }
  get amounttext(){
    return element(by.model('amount'))
  }
  get message(){
    return element(by.css('.error.ng-binding'))
  }
  get deposit(){
    return element(by.css('[ng-click="deposit()"]'))
  }
  get withdraw(){
    return element(by.css('[ng-click="withdrawl()"]'))
  }
  get transaction(){
    return  element(by.css('[ng-click="transactions()"]'))
  }
  get backbtn(){
    return element(by.css('[ng-click="back()"]'))
  }
  get reset(){
    return  element(by.css('.btn.logout'))
  }
  get validateaccnum(){
    return element(by.css('div > div:nth-child(3) > strong:nth-child(1)'));         
  }
}
module.exports = bank;