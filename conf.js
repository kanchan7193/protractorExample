var HtmlReporter = require('protractor-beautiful-reporter');
exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',

    suites: {
      simple: 'specs/spec*simple.js',
      pom: 'specs/spec*POM.js',
      current: 'specs/spec_Bank_manager_pom.js'
    },
 
   onPrepare: function() {
      // Add a screenshot reporter and store screenshots to `/tmp/screenshots`:
     /* jasmine.getEnv().addReporter(new HtmlReporter({
         baseDirectory: 'tmp/screenshots'
      }).getJasmine2Reporter()); */
   },

   capabilities: {
      browserName: "chrome",
      unexpectedAlertBehaviour: 'accept',
  },
}