//spec.js
describe('Banking App Simple', function() {
     
  beforeAll(function() {
    browser.get('http://www.way2automation.com/angularjs-protractor/banking/#/login'); 
  });
  
    it('should get customer login', function() {
        element(by.css('[ng-click="customer()"]')).click();
        element(by.css('#userSelect')).sendKeys('Harry Potter');
        element(by.css('.btn.btn-default')).click();  
        element(by.css('#accountSelect')).click(); 
    })
 
    it('Unscussful Withdraw', function(){
      element(by.css('[ng-click="withdrawl()"]')).click();
      element(by.model('amount')).sendKeys('50')
      element(by.css('.btn.btn-default')).click();
      expect(element(by.css('.error.ng-binding')).getText()).toEqual('Transaction Failed. You can not withdraw amount more than the balance.')
    })

    it('Successful Deposit 500', function(){
      element(by.css('[ng-click="deposit()"]')).click();
      element(by.model('amount')).sendKeys('500')
      element(by.css('.btn.btn-default')).click();
      expect(element(by.css('.error.ng-binding')).getText()).toEqual('Deposit Successful')
    })

    it('Successful Withdraw', function(){
      element(by.css('[ng-click="withdrawl()"]')).click();
      element(by.model('amount')).sendKeys('50')
      element(by.css('.btn.btn-default')).click();
      expect(element(by.css('.error.ng-binding')).getText()).toEqual('Transaction successful')
    })

       //todo
       //validate both transactions are in table with correct credit or debit records

    xit('transactions verify all', function(){
      element(by.css('[ng-click="transactions()"]')).click();

      if(element(by.css('#anchor0 > td:nth-child(2)')).isPresent()){
     
      expect(element(by.css('#anchor0 > td:nth-child(2)')).getText()).toEqual('500');
      expect(element(by.css('#anchor0 > td:nth-child(3)')).getText()).toEqual('Credit');
      expect(element(by.css('#anchor1 > td:nth-child(3)')).getText()).toEqual('Debit');
      expect(element(by.css('#anchor1 > td:nth-child(2)')).getText()).toEqual('50');
      }
    })

    it('SELECT ACCOUNT NUMBER 1006', function(){
      element(by.css('[ng-click="transactions()"]')).click();
      element(by.css('[ng-click="back()"]')).click();
      var accountSelect=element(by.model('accountNo'));
      accountSelect.$('[value="number:1006"]').click();
       //element(by.css('#accountSelect > option:nth-child(2)')).click();
    })    

    it('validate account Number 1006 selected', function(){
      ou=element(by.css('div > div:nth-child(3) > strong:nth-child(1)'));         
      expect(ou.getText()).toEqual('1006'); 
    })
     
    it('all Reset and logout', function(){ 
        element(by.css('.btn.logout')).click();
    })
});
  

