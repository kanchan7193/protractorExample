const op = require('../page/operation.page.js');
// spec.js
describe('Protractor Demo App POM', function() {
  
  let obpage=new op(); 
    beforeAll(function() {
        browser.get('http://juliemr.github.io/protractor-demo/');         
      });

    it('should have a title', function() {
      expect(browser.getTitle()).toEqual('Super Calculator');
    });
    
    it('should add two numbers', function(){
      obpage.firsttextbox.sendKeys(1);
      obpage.secondtextbox.sendKeys(5);
      obpage.gobutton.click();
        expect(obpage.ou.getText()).toEqual('6'); 
    })

    it('should deduct second number', function(){
        obpage.firsttextbox.sendKeys(1);
        obpage.secondtextbox.sendKeys(5);
        obpage.subtractoption.click();
        obpage.gobutton.click();   
        expect(obpage.ou.getText()).toEqual('-4'); 
    })

    it('should multiply numbers', function(){
      obpage.firsttextbox.sendKeys(2);
      obpage.secondtextbox.sendKeys(5);
      obpage.multiplyoption.click();
      obpage.gobutton.click();
      expect(obpage.ou.getText()).toEqual('10'); 
    })    

    it('should divide numbers', function(){
      obpage.firsttextbox.sendKeys(15);
      obpage.secondtextbox.sendKeys(3);
      obpage.divideoption.click();
      obpage.gobutton.click();
        expect(obpage.ou.getText()).toEqual('5'); 
    })    


  });