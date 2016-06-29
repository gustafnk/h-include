var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

var port = process.env.PORT;
var driver;
var errors;

function start(caps) {
  if (driver) throw Error('Previous session not stopped.');

    var driverFu;
    if (process.env.SAUCE_USERNAME) {
      var tunnelId, buildId;
      if (process.env.TRAVIS === 'true') {
        tunnelId = process.env.TRAVIS_JOB_NUMBER;
        buildId = process.env.TRAVIS_BUILD_NUMBER;
      }
      else if (process.env.SAUCE_TUNNEL_ID) {
        tunnelId = process.env.SAUCE_TUNNEL_ID;
        buildId = 0;
      }
      caps = Object.assign({
        'tunnel-identifier': tunnelId,
        build: buildId,
        username: process.env.SAUCE_USERNAME,
        accessKey: process.env.SAUCE_ACCESS_KEY
      }, caps);
      driverFu = new webdriver.Builder()
      .usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
      .withCapabilities(caps)
      .buildAsync();
    } else {
      driverFu = new webdriver.Builder()
      .withCapabilities(caps)
      .buildAsync();
    }
    return driverFu.then(function(result) { 
      driver = result; 
    });
}

function stop() {
    return driver.quit()
    .then(function() { driver = undefined; });;
}

function runTests(page_loc, tests, viewport) {
  errors = [];

  if (!viewport) return run(page_loc, tests);

  if(viewport.width && viewport.height){
    var window = driver.manage().window();
    return window.setSize(viewport.width, viewport.height)
    .then(function() { 
      return window.getSize();
    })
    .then(function(sizes) {
      if (sizes.width != viewport.width) {
        throw 'Could not set viewport dimensions';
      }
    })
    .then(function() {
      return run(page_loc, tests);
    }, // now catch setSize() or getSize() errors
    function(error) { // WARN don't remove or process crashes out
      console.info('Ignoring viewport dependent test');
      return 0;
    });
   }
}

function run(page_loc, tests) {
  return driver.get('http://localhost:' + port + '/' + page_loc)
  .then(function () {
      return Promise.all(tests.map(function(test) { // TODO use reduce() to run sequentially
        return new Promise(function(resolve){
          setTimeout(function(){
            resolve(checkContent(test[0], test[1]));
          }, 300);
        });
      }));
  })
  .then(function() {
      if (errors.length > 0) {
        console.error(errors.join("\n"));
      } else {
        console.info("Ok.");
      }
      return errors.length;
  });
}

function checkContent(selector, expected) {
    return driver.findElement(By.css(selector))
    .then(function(el) {
      return el.getText();
    })
    .then(function(text) {
      text = text.trim();
      if (text != expected) {
        errors.push(selector + ': "' + text + '" is not "' + expected + '"');
      }
    });
}


exports.start = start;
exports.stop = stop;
exports.runTests = runTests;
