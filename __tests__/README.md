
Tests
=====

Requirements
------------

 * node (version 7.6 or higher)
 * npm

After this we can set up the project
 
  > npm install

This will install the selenium-webdriver and the other required nodejs modules.


Running local tests from the command-line
-----------------------------------

Install one or more browsers supported by [selenium-webdriver](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html).

To run all the tests for the browsers in `browsers-local.json` on the local machine

  > npm run local-tests


Running Sauce Labs tests from the command-line
-----------------------------------

Install [Sauce Connect Proxy](https://wiki.saucelabs.com/display/DOCS/Sauce+Connect+Proxy). Unzip, cd into the folder and run

  > bin/sc -u [sauce username] -k [sauce access ke] -i tunnel1

Open a new terminal tab...

  > SAUCE_TUNNEL_ID=tunnel1 SAUCE_USERNAME=[sauce username] SAUCE_ACCESS_KEY=[sauce access key] npm run remote-tests


CI Testing
----------

TODO: Github Actions integration (work started).

Today, tests need to be run at a local dev machine.

Testing is done in the browser / OS environments defined in "__tests__/browsers.json".


Manual Testing in IE11
--------------

IE11 is hard to reliably automate through Selenium. Therefore, use the links in the `static/index.html` page and (for each link) wait for the alerts to be shown.

