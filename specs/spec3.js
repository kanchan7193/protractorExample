// spec.js
describe('Automation App', function() {
  
  
    beforeAll(function() {
        browser.get('http://www.way2automation.com/angularjs-protractor/registeration/#/login');         
      });

    it('Login', function() {
      expect(browser.getTitle()).toEqual('Protractor practice website - Registration');
      element(by.css('#username')).sendKeys('angular');
      element(by.css('#password')).sendKeys('password');
      element(by.css('#formly_1_input_username_0')).sendKeys('angular');
      element(by.css('.btn.btn-danger')).click();
      let label= element(by.css('div > p:nth-child(2)')).getText();
      expect(label).toEqual("You're logged in!!");
    });

  });