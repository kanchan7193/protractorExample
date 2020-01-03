class bank_manager{
    constructor() { }
   
    get addcustomer() { 
      return  element(by.css('[ng-click="manager()"]'));
    }
    get clickcust(){
        return element(by.css('[ng-click="addCust()"]'));
    }
    get firstname(){
        return  element(by.model('fName'));
    }
    get lastname(){
        return element(by.model('lName'));    
    }
    get postcode(){
        return element(by.model('postCd'));    
    }
    get defaultclick(){
        return  element(by.css('.btn.btn-default'));
    }
    get openacc(){
        return element(by.css('[ng-click="openAccount()"]'));
    }
    get custid(){
        return element(by.model('custId'));
        
    }
    get currency(){
        return element(by.model('currency'));
    }
    get submit(){
        return  element(by.css('[type="submit"]'));
    }
    get searchclk(){
        return  element(by.css('[ng-click="showCust()"]'));
    }
    get searchcust(){
        return  element(by.model('searchCustomer')); 
        
    }
    get child1(){
        return element(by.css('div > table > tbody > tr > td:nth-child(1)'));
    }
    get child2(){
        return element(by.css('div > table > tbody > tr > td:nth-child(2)'));
    }
    get child3(){
        return element(by.css('div > table > tbody > tr > td:nth-child(3)'));
    }
    get delcust(){
        return element(by.css('[ng-click="deleteCust(cust)"]'));
    }

    selectcustomerdd(xv){
        var customerdropdwn=element.all(by.repeater('cust in Customers'));
        customerdropdwn.filter(function(elem, index) {
            return elem.getText().then(function(text) {
                return text === xv;
            });
        }).first().click;
      }

    selectcurrency(){
        this.currency.click();
        this.currency.$('[value="Dollar"]').click();
    }

}
module.exports= bank_manager;