const path = require('path');
const fs = require('fs');

const expect = require('expect');
const { Builder, By, Key, until } = require('selenium-webdriver');
const SauceLabs = require('saucelabs'),
    username = process.env.SAUCE_USERNAME,
    accessKey = process.env.SAUCE_ACCESS_KEY,
    saucelabs = new SauceLabs({
      username: username,
      password: accessKey
    });

const caps = {};
let browsers;

const log = false;

if (process.env.IS_LOCAL === 'true') {
  browsers = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'browsers-local.json'), 'utf8'));
} else {
  browsers = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'browsers-remote.json'), 'utf8'));

  // Setup Travis and SauceLabs
  var tunnelId, buildId;
  if (process.env.TRAVIS === 'true') {
    tunnelId = process.env.TRAVIS_JOB_NUMBER;
    buildId = process.env.TRAVIS_BUILD_NUMBER;
  }
  else if (process.env.SAUCE_TUNNEL_ID) {
    tunnelId = process.env.SAUCE_TUNNEL_ID;
    buildId = 0;
  }

  Object.assign(caps, {
    'tunnel-identifier': tunnelId,
    build: buildId,
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    'username': username,
    'accessKey': accessKey,
  });
}

browsers.forEach(browser => {
  const browserString = JSON.stringify(browser);
  const timeout = browser.timeout || 1000;

  describe(`h-include - ${browserString}`, () => {
    let driver;

    beforeEach(function() {
      if (process.env.IS_LOCAL === 'true') {
        driver = new Builder().forBrowser('firefox').build();
      } else {
        Object.assign(caps, browser);

        server = 'http://' + username + ':' + accessKey +
                  '@ondemand.saucelabs.com:80/wd/hub';

        driver = new Builder().
          withCapabilities(caps).
          usingServer(server).
          build();

        driver.getSession().then(function (sessionid){
          driver.sessionID = sessionid.id_;
          console.log(`SauceOnDemandSessionID=${driver.sessionID} job-name=${browserString}`);
        });
      }
    });

    it('includes basic case', async () => {
      console.log(Date.now());
      await driver.get('http://localhost:8080/basic/');
      console.log(Date.now()); 
      await driver.sleep(timeout);
      console.log(Date.now());

      const a = await driver.findElement(By.id('a')).getText();
      const b = await driver.findElement(By.id('b')).getText();

      expect(a).toBe('this text is included');
      expect(b).toBe('this text overwrote what was just there.');
    });

    it('includes basic async case', async () => {
      await driver.get('http://localhost:8080/basic-async/');
      await driver.sleep(timeout);

      const a = await driver.findElement(By.id('a')).getText();
      const b = await driver.findElement(By.id('b')).getText();

      expect(a).toBe('this text is included');
      expect(b).toBe('this text overwrote what was just there.');
    });

    xit('includes lazy', async () => {
      await driver.get('http://localhost:8080/lazy/');
      await driver.sleep(timeout);

      const a = await driver.findElement(By.id('counter')).getText();

      expect(a).toBe('3');
    });

    xit('includes fragment with extraction', async () => {
      await driver.get('http://localhost:8080/fragment-extraction/');
      await driver.sleep(timeout);

      const a = await driver.findElement(By.id('a')).getText();

      expect(a).toBe('Paragraph in fragment');
    });

    it('does not modify the page if no includes', async () => {
      await driver.get('http://localhost:8080/none/');
      await driver.sleep(timeout);

      const a = await driver.findElement(By.id('a')).getText();

      expect(a).toBe('1st para');
    });

    xit('does not allow recursion', async () => {
      await driver.get('http://localhost:8080/recursion-not-allowed/');
      await driver.sleep(timeout);

      const a = await driver.findElement(By.id('a')).getText();

      expect(a).toMatch('h-include.js test page\nRecursion not allowed');
    });

    // TODO Implement observedAttributes property
    xit('reloads if src attribute is modified', async () => {
      await driver.get('http://localhost:8080/update-src/');
      await driver.sleep(timeout);

      const a = await driver.findElement(By.id('a')).getText();

      expect(a).toBe('this text overwrote what was just there');
    });

    xit('loads large fragment for large viewport', async () => {
      if (browser.browserName === 'MicrosoftEdge' && browser.platform === 'Windows 10') {
        return;
      }

      const viewport = driver.manage().window();
      await viewport.setSize(800, 800); // width, height
      await driver.sleep(timeout);
      await driver.get('http://localhost:8080/media/');
      await driver.sleep(timeout);

      const a = await driver.findElement(By.id('a')).getText();

      expect(a).toBe('Large viewport');
    });

    xit('loads large fragment for large viewport', async () => {
      if (browser.browserName === 'MicrosoftEdge' && browser.platform === 'Windows 10') {
        return;
      }

      const viewport = driver.manage().window();
      await viewport.setSize(480, 800); // width, height
      await driver.sleep(timeout);
      await driver.get('http://localhost:8080/media/');
      await driver.sleep(timeout);

      const a = await driver.findElement(By.id('a')).getText();

      expect(a).toBe('Small viewport');
    });

    afterEach(function(done){
      if (log && browser.browserName === 'chrome') {
        driver.manage().logs()
          .get('browser')
          .then(v => v && v.length && console.log(v));
      }

      driver.quit();

      if (process.env.IS_LOCAL === 'true') {
        done();
      } else {
        var title = this.currentTest.title,
          passed = (this.currentTest.state === 'passed') ? true : false;

        saucelabs.updateJob(driver.sessionID, {
          name: title,
          passed: passed
        }, done);
      }
    });
  });
});
