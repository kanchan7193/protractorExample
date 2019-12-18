class operation
{
    constructor() { }

    get firsttextbox(){
        return element(by.model('first'));
    }
    get secondtextbox(){
        return element(by.model('second'));
    }
    get gobutton() {  
        return element(by.id('gobutton'));
    } 
    get multiplyoption() { 
        return element(by.css("[value='MULTIPLICATION']"));
    }  
    get divideoption() { 
        return element(by.css("[value='DIVISION']"));
    }
    get subtractoption() { 
        return element(by.css("[value='SUBTRACTION']"));
    }     
    get ou() { 
        return element.all(by.css('.ng-binding')).first();
    }
}

module.exports = operation;