//spec.js
describe('Banking App', function() {
  
   
  beforeAll(function() {
    browser.get('http://www.way2automation.com/angularjs-protractor/banking/#/login'); 
   

});
      it('should get customer login', function() {
        element(by.css('body > div.ng-scope > div > div.ng-scope > div > div.borderM.box.padT20 > div:nth-child(1) > button')).click();
        element(by.css('#userSelect')).sendKeys('Harry Potter');
        element(by.css('body > div.ng-scope > div > div.ng-scope > div > form > button')).click();  
        element(by.css('#accountSelect')).click(); 

      })
        
      it('Heading should be XYZ Bank', function(){
        var accountSelect=element(by.model('accountNo'));
    		accountSelect.$('[value="number:1006"]').click();
        element(by.css('#accountSelect > option:nth-child(2)')).click();

    })    
      });
  