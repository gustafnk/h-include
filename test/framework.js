var webdriver = require('selenium-webdriver'),
//    chrome = require('selenium-webdriver/chrome'),
    By = webdriver.By,
    until = webdriver.until;

var driver;

function start() {
    if (process.env.SAUCE_USERNAME != undefined) {
      driver = new webdriver.Builder()
      .usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
      .withCapabilities({
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        build: process.env.TRAVIS_BUILD_NUMBER,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY,
        browserName: "chrome"
      }).build();
    } else {
      driver = new webdriver.Builder()
      .withCapabilities({
        browserName: "firefox"
      }).build();
   }
}

function stop() {
    driver.quit();
}

function runTests(page_loc, tests, viewport) {
  var port = process.env.PORT;
  var errors = [];

  var window = driver.manage().window();
  if(viewport && viewport.width && viewport.height){
      window.setSize(viewport.width, viewport.height);
  }

  function checkContent(selector, expected) {
    driver.findElement(By.css(selector))
    .then(function(el) {
      var text = el.getText();
      if (text != expected) {
        errors.push(selector + ': "' + text + '" is not "' + expected + '"');
      }
    });
  }

  return driver.get('http://localhost:' + port + '/' + page_loc)
  .then(function () {
      var i = 0;
      while (i < tests.length) {
        checkContent(tests[i][0], tests[i][1]);
        i++;
      }

      if (errors.length > 0) {
        console.error(errors.join("\n"));
      } else {
        console.info("Ok.");
      }
      return errors.length;
  });
}

exports.start = start;
exports.stop = stop;
exports.runTests = runTests;
