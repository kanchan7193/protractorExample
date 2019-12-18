const rp = require('../page/registration.page.js');
// spec.js
describe('Registration Page', function() {
  let rpage =new rp(); 
  beforeAll(function() {
    browser.get('http://www.way2automation.com/angularjs-protractor/registeration/#/login');         
  });

    it('Login', function() {

      expect(browser.getTitle()).toEqual('Protractor practice website - Registration');
      rpage.username.sendKeys('angular');
      rpage.password.sendKeys('password');
      rpage.userinput.sendKeys('angular');
      rpage.danger.click();
      expect(rpage.label.getText()).toEqual("You're logged in!!");
    });

  });