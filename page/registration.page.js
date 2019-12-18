class registration{
    constructor() { }
    

     get username() { 
        return  element(by.css('#username'));
    }
    get password() { 
        return element(by.css('#password'));
    } 
    get userinput() {
        return element(by.css('#formly_1_input_username_0'));
    }  
    get danger() {
        return  element(by.css('.btn.btn-danger'));
    }
    get label() {
        return element(by.css('div > p:nth-child(2)'));
    }
}
module.exports = registration;