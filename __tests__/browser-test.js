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

const timeout = 6000;
const log = true;

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

    Object.assign(caps, {
      host: 'localhost',
      port: 4445,
    });
  }

  Object.assign(caps, {
    'tunnel-identifier': tunnelId,
    build: buildId,
    username: username,
    accessKey: accessKey,
  });
}

browsers.forEach(browser => {
  const browserString = JSON.stringify(browser);

  describe(`h-include - ${browserString}`, () => {
    let driver;

    before(() => {
      if (process.env.IS_LOCAL === 'true') {
        driver = new Builder().forBrowser(browser.browserName).build();
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
      await driver.get('http://localhost:8080/static/basic/');
      const aSelector = By.id('included-1');
      const bSelector = By.id('included-2');

      await driver.wait(until.elementLocated(aSelector), timeout);
      const a = await driver.findElement(By.id('included-1'));

      await driver.wait(until.elementLocated(By.id('included-2')), timeout);
      const b = await driver.findElement(bSelector);

      const aText = await a.getText();
      const bText = await b.getText();

      expect(aText).toBe('this text is included');
      expect(bText).toBe('this text overwrote what was just there');
    });

    it('includes basic async case', async () => {
      await driver.get('http://localhost:8080/static/basic-async/');
      const aSelector = By.id('included-1');
      const bSelector = By.id('included-2');

      await driver.wait(until.elementLocated(aSelector), timeout);
      const a = await driver.findElement(aSelector);

      await driver.wait(until.elementLocated(bSelector), timeout);
      const b = await driver.findElement(bSelector);

      const aText = await a.getText();
      const bText = await b.getText();

      expect(aText).toBe('this text is included');
      expect(bText).toBe('this text overwrote what was just there');
    });

    it('includes lazy', async () => {
      await driver.get('http://localhost:8080/static/lazy-extension/');
      const aSelector = By.id('included-3');

      await driver.wait(until.elementLocated(aSelector), timeout);
      const a = await driver.findElement(aSelector);

      const aText = await a.getText();

      expect(aText).toBe('this text is included 3');
    });

    it('includes fragment with extraction', async () => {
      await driver.get('http://localhost:8080/static/fragment-extraction/');
      const aSelector = By.id('a');

      await driver.wait(until.elementLocated(aSelector), timeout);
      const a = await driver.findElement(aSelector);

      const aText = await a.getText();

      expect(aText).toBe('Paragraph in fragment');
    });

    it('does not modify the page if no includes', async () => {
      await driver.get('http://localhost:8080/static/none/');
      const aSelector = By.id('a');

      await driver.wait(until.elementLocated(aSelector), timeout);
      const a = await driver.findElement(aSelector);

      const aText = await a.getText();

      expect(aText).toBe('1st para');
    });

    it('does not allow recursion', async () => {
      await driver.get('http://localhost:8080/static/recursion-not-allowed/');

      const aSelector = By.id('a');

      await driver.wait(until.elementLocated(aSelector), timeout);
      const a = await driver.findElement(aSelector);

      const aText = await a.getText();

      expect(aText).toBe('1');
    });

    it('navigates', async () => {
      await driver.get('http://localhost:8080/static/navigate-extension/');

      await driver.wait(until.elementLocated(By.id('a')), timeout);
      await driver.findElement(By.css('#a .link')).click();

      await driver.wait(until.elementLocated(By.id('b')), timeout);
      await driver.findElement(By.css('#b .link')).click();

      const cSelector = By.id('c');
      await driver.wait(until.elementLocated(cSelector), timeout);

      const c = await driver.findElement(cSelector);

      const cText = await c.getText();

      expect(cText).toBe('This is the last box. Goodbye.');
    });

    it('does perform inclusion of src when predicate function succeeds', async () => {
      await driver.get('http://localhost:8080/static/when/when-pass-use-src.html');

      const a = await driver.findElement(By.id('when-included')).getText();

      expect(a.trim()).toBe('when - this text is included');
    });

    it('does not perform inclusion of src when predicate function fails', async () => {
      await driver.get('http://localhost:8080/static/when/when-fail.html');

      try {
        await driver.findElement(By.id('when-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');
      }
    });

    it('does not perform inclusion of when-false-src when predicate function fails', async () => {
      await driver.get('http://localhost:8080/static/when/when-fail.html');

      try {
        await driver.findElement(By.id('when-false-src-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');
      }
    });

    it('does perform inclusion of when-false-src when predicate function fails', async () => {
      await driver.get('http://localhost:8080/static/when/when-fail-if-when-false-src.html');

      try {
        await driver.findElement(By.id('when-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');

        const a = await driver.findElement(By.id('when-false-src-included')).getText();
        
        expect(a.trim()).toBe('when-false-src - this text is included');
      }
    });

    it('uses alt attribute when forcing a 404', async () => {
      await driver.get('http://localhost:8080/static/alt/alt.html');

      try {
        await driver.findElement(By.id('default-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');

        const cSelector = By.id('alt-included');
        await driver.wait(until.elementLocated(cSelector), timeout);
    
        const c = await driver.findElement(cSelector);
        const cText = await c.getText();

        expect(cText).toBe('alt - this text is included');
      }
    });

    it('does not perform inclusion when forcing a 404 and no alt attribute is present', async () => {
      await driver.get('http://localhost:8080/static/alt/no-alt.html');

      try {
        await driver.findElement(By.id('alt-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');
      }
    });

    it('does not perform inclusion when predicate fails, no when-false-src and forcing a 404 in alt src', async () => {
      await driver.get('http://localhost:8080/static/alt/when-fail-no-when-false-src-alt-error.html');

      try {
        await driver.findElement(By.id('alt-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');
      }
    });

    it('does perform inclusion when predicate fails, no when-false-src and using a valid alt src', async () => {
      await driver.get('http://localhost:8080/static/alt/when-fail-no-when-false-src-alt-pass.html');

      try {
        await driver.findElement(By.id('default-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');

        const cSelector = By.id('alt-included');
        await driver.wait(until.elementLocated(cSelector), timeout);
    
        const c = await driver.findElement(cSelector);
        const cText = await c.getText();

        expect(cText).toBe('alt - this text is included');
      }
    });

    it('does not perform inclusion when predicate fails, when-false-src fails and alt src fails', async () => {
      await driver.get('http://localhost:8080/static/alt/when-fail-when-false-src-fail-alt-error.html');

      try {
        await driver.findElement(By.id('alt-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');
      }
    });

    it('does perform inclusion when predicate fails, when-false-src fails and using a valid alt src', async () => {
      await driver.get('http://localhost:8080/static/alt/when-fail-when-false-src-fail-alt-pass.html');

      try {
        await driver.findElement(By.id('default-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');

        const cSelector = By.id('alt-included');
        await driver.wait(until.elementLocated(cSelector), timeout);
    
        const c = await driver.findElement(cSelector);
        const cText = await c.getText();

        expect(cText).toBe('alt - this text is included');
      }
    });

    it('does not perform inclusion when predicate is met, no when-false-src and alt src fails', async () => {
      await driver.get('http://localhost:8080/static/alt/when-pass-no-when-false-src-alt-error.html');

      try {
        await driver.findElement(By.id('alt-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');
      }
    });

    it('does perform inclusion when predicate is met, no when-false-src and using a valid alt src', async () => {
      await driver.get('http://localhost:8080/static/alt/when-pass-no-when-false-src-alt-pass.html');

      try {
        await driver.findElement(By.id('default-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');

        const cSelector = By.id('alt-included');
        await driver.wait(until.elementLocated(cSelector), timeout);
    
        const c = await driver.findElement(cSelector);
        const cText = await c.getText();

        expect(cText).toBe('alt - this text is included');
      }
    });

    it('does not perform inclusion when predicate is met, when-false-src fails and alt src fails', async () => {
      await driver.get('http://localhost:8080/static/alt/when-pass-when-false-src-fail-alt-error.html');

      try {
        await driver.findElement(By.id('alt-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');
      }
    });

    it('does perform inclusion when predicate is met, when-false-src fails and using a valid alt src', async () => {
      await driver.get('http://localhost:8080/static/alt/when-pass-when-false-src-fail-alt-pass.html');

      try {
        await driver.findElement(By.id('default-included'))
      } catch (error) {
        expect(error.name).toBe('NoSuchElementError');

        const cSelector = By.id('alt-included');
        await driver.wait(until.elementLocated(cSelector), timeout);
    
        const c = await driver.findElement(cSelector);
        const cText = await c.getText();

        expect(cText).toBe('alt - this text is included');
      }
    });

    if (browser.browserName !== 'MicrosoftEdge' && browser.platform !== 'Windows 10') {
      it('loads small fragment for small viewport', async () => {
        const viewport = driver.manage().window();
        await viewport.setSize(480, 800); // width, height
                await driver.get('http://localhost:8080/static/media/');

        const a = await driver.findElement(By.id('a')).getText();

        expect(a.trim()).toBe('Small viewport');
      });
    }

    after(done => {
      if (log && browser.browserName === 'chrome') {
        driver.manage().logs()
          .get('browser')
          .then(v => v && v.length && console.log(v));
      }

      driver.quit();

      done();
    });

    afterEach(function(done){
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
