// spec.js
describe('Registration Page simple', function() {
    let username =  element(by.css('#username'));
    let password =  element(by.css('#password'));
    let userinput =  element(by.css('#formly_1_input_username_0'));
    let danger = element(by.css('.btn.btn-danger'));
    let label= element(by.css('div > p:nth-child(2)'));

    beforeAll(function() {
      browser.get('http://www.way2automation.com/angularjs-protractor/registeration/#/login');         
    });
   

    it('Login', function() {

      expect(browser.getTitle()).toEqual('Protractor practice website - Registration');
      username.sendKeys('angular');
      password.sendKeys('password');
      userinput.sendKeys('angular');
      danger.click();
      expect(label.getText()).toEqual("You're logged in!!");
    });

  });