
Tests
=====

Requirements
------------

 * nodejs
 * npm
 * Firefox Browser (if testing on the local machine)  
   or another browser with the [appropriate driver](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html)
 * [sauce-connect](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy)
   (if testing on SauceLabs).  
   You will also need a Saucelabs username and access-key.

After this we can set up the project
 
  > npm install

This will install the selenium-webdriver and the other required nodejs modules.

Running tests from the command-line
-----------------------------------

To run all the tests in a browser (say Firefox) on the local machine

  > cd test
  > BROWSER_NAME=firefox make test

Then to run one test (say "basic")

  > TEST=basic BROWSER_NAME=firefox make test

(The tests are defined in "test/index.json" and the TEST environment variable 
should match one of the test-files *without* the ".html" extension)

To run tests on the SauceLabs grid you need to [start sauce-connect](https://wiki.saucelabs.com/display/DOCS/Basic+Sauce+Connect+Setup). Do this at a separate command-line so you can monitor the connection logs.

 > SAUCE_USERNAME=your-username SAUCE_ACCESS_KEY=your-access-key sc

The test script will automatically use sauce-connect if the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are defined, so you can run the tests with

 > SAUCE_USERNAME=your-username SAUCE_ACCESS_KEY=your-access-key make test

CI Testing
----------

Travis CI will automatically run the tests when commits are pushed to Github
(assuming the account is registered with Travis 
and the repository is registered with Saucelabs).

Testing is done in the browser / OS environments defined in "test/browsers.json".

