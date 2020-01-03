//spec.js
describe('Banking Manager Simple', function() {

    beforeAll(function() {
        browser.get('http://www.way2automation.com/angularjs-protractor/banking/#/login'); 
      });

      it('Add new customer', function (){
         element(by.css('[ng-click="manager()"]')).click(); 
         element(by.css('[ng-click="addCust()"]')).click();
         element(by.model('fName')).sendKeys('Tomalesh');
         element(by.model('lName')).sendKeys('Maharaj');
         element(by.model('postCd')).sendKeys('1010');
         element(by.css('.btn.btn-default')).click();
      
      })

      it('open account',function(){
        element(by.css('[ng-click="openAccount()"]')).click();  
        element(by.model('custId')).click();

        var customerdropdwn=element.all(by.repeater('cust in Customers'));
        

        customerdropdwn.filter(function(elem, index) {
            return elem.getText().then(function(text) {
                return text === 'Tomalesh Maharaj';
            });
        }).first().click();

        element(by.model('currency')).click();
        
        var currencySelect=element(by.model('currency'));
        currencySelect.$('[value="Dollar"]').click();
        element(by.css('[type="submit"]')).click();

        })

      it('search customer',function(){
        element(by.css('[ng-click="showCust()"]')).click();
        element(by.model('searchCustomer')).sendKeys('tomalesh');
        expect(element(by.css('div > table > tbody > tr > td:nth-child(1)')).getText()).toEqual('Tomalesh');
        expect(element(by.css('div > table > tbody > tr > td:nth-child(2)')).getText()).toEqual('Maharaj');
        expect(element(by.css('div > table > tbody > tr > td:nth-child(3)')).getText()).toEqual('1010'); 
      })
      
      it('delete searched customer', function(){
        element(by.css('[ng-click="deleteCust(cust)"]')).click();
      })
 
});