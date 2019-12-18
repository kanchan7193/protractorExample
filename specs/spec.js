// spec.js
describe('Protractor Demo App', function() {
    let firsttextbox = element(by.model('first'));
    let ou=element.all(by.css('.ng-binding')).first();
   
    beforeAll(function() {
        browser.get('http://juliemr.github.io/protractor-demo/');      
      });

    it('should have a title', function() {
      expect(browser.getTitle()).toEqual('Super Calculator');
    });


    it('should add two numbers', function(){
        firsttextbox.sendKeys(1);
        element(by.model('second')).sendKeys(5);
        element(by.id('gobutton')).click();
        expect(ou.getText()).toEqual('6'); 
    })

    it('should deduct second number', function(){
        firsttextbox.sendKeys(1);
        element(by.css("[value='SUBTRACTION']")).click();
        element(by.model('second')).sendKeys(5);
        element(by.id('gobutton')).click();
        let ou=element.all(by.css('.ng-binding')).first().getText();     
        expect(ou.getText()).toEqual('-4'); 
    })

    it('should multiply numbers', function(){
        firsttextbox.sendKeys(2);
        element(by.css("[value='MULTIPLICATION']")).click();
        element(by.model('second')).sendKeys(5);
        element(by.id('gobutton')).click();
        let ou=element.all(by.css('.ng-binding')).first().getText();     
        expect(ou.getText()).toEqual('10'); 
    })    

    it('should divide numbers', function(){
        firsttextbox.sendKeys(15);
        element(by.css("[value='DIVISION']")).click();
        element(by.model('second')).sendKeys(3);
        element(by.id('gobutton')).click();
        let ou=element.all(by.css('.ng-binding')).first().getText();     
        expect(ou.getText()).toEqual('5'); 
    })    


  });