const bm = require('../page/bank_manager.page.js');
//spec.js
describe('Banking Manager Simple', function() {
  let bmanager= new bm();
  beforeAll(function(){
  
        browser.get('http://www.way2automation.com/angularjs-protractor/banking/#/login'); 
      });

      it('Add new customer', function (){
         bmanager.addcustomer.click(); 
         bmanager.clickcust.click();
         bmanager.firstname.sendKeys('Tomalesh');
         bmanager.lastname.sendKeys('Maharaj');
         bmanager.postcode.sendKeys('1010');
         bmanager.defaultclick.click();
      
      })

      it('open account',function(){
        bmanager.openacc.click();  
        bmanager.custid.click();
        bmanager.selectcustomerdd('Tomalesh Maharaj')
        
        bmanager.selectcurrency();
        bmanager.submit.click();

        })

      it('search customer',function(){
       bmanager.searchclk.click();
       bmanager.searchcust.sendKeys('tomalesh');
        expect(bmanager.child1.getText()).toEqual('Tomalesh');
        expect(bmanager.child2.getText()).toEqual('Maharaj');
        expect(bmanager.child3.getText()).toEqual('1010'); 
      })
      
      it('delete searched customer', function(){
        bmanager.delcust.click();
      })
 
});