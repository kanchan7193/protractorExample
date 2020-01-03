const ba = require('../page/bank.page.js');
//spec.js
describe('Banking App POM', function() {
  let bapp= new ba();

  beforeAll(function() {
    browser.get('http://www.way2automation.com/angularjs-protractor/banking/#/login'); 
  });
  
    it('should get customer login', function() {
      bapp.customerlogin.click();
      bapp.userSelect.sendKeys('Harry Potter');
      bapp.defaultbtn.click();  
      bapp.accountselect.click(); 
    })
       
    it('Unsuccessful Withdraw', function(){
      bapp.withdrawbtn.click();
      bapp.amounttext.sendKeys('500000000');
      bapp.defaultbtn.click();
      expect(bapp.message.getText()).toEqual('Transaction Failed. You can not withdraw amount more than the balance.')
    })

    it('Successful Deposit 500', function(){
      bapp.deposit.click();
      bapp.amounttext.sendKeys('500')
      bapp.defaultbtn.click();
      expect(bapp.message.getText()).toEqual('Deposit Successful')
    })

    it('Successful Withdraw', function(){
      bapp.withdraw.click();
      bapp.amounttext.sendKeys('50')
      bapp.defaultbtn.click();
      expect(bapp.message.getText()).toEqual('Transaction successful')
    })

    xit('transactions verify all', function(){
      bapp.transaction.click();
      
      
      if(element(by.css('#anchor0 > td:nth-child(2)')).isPresent()){
        expect(element(by.css('#anchor0 > td:nth-child(2)')).getText()).toEqual('500');
        expect(element(by.css('#anchor0 > td:nth-child(3)')).getText()).toEqual('Credit');
        expect(element(by.css('#anchor1 > td:nth-child(3)')).getText()).toEqual('Debit');
        expect(element(by.css('#anchor1 > td:nth-child(2)')).getText()).toEqual('50');
      }
    })

    it('SELECT ACCOUNT NUMBER 1006', function(){
      bapp.transaction.click();
      bapp.backbtn.click();

      var accountSelect=element(by.model('accountNo'));
      accountSelect.$('[value="number:1006"]').click();
       // element(by.css('#accountSelect > option:nth-child(2)')).click();
    })    

    it('validate account Number 1006 selected', function(){
    
      expect(bapp.validateaccnum.getText()).toEqual('1006'); 
    })
     
    it('all Reset and logout', function(){ 
       bapp.reset.click();
    })
});
  