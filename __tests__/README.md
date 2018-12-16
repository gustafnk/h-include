
Tests
=====

Requirements
------------

 * nodejs
 * npm
 * Firefox Browser (if testing on the local machine)  
   or another browser with the [appropriate driver](http://seleniumhq.github.io/selenium/docs/api/javascript/index.html)

After this we can set up the project
 
  > npm install

This will install the selenium-webdriver and the other required nodejs modules.


Running tests from the command-line
-----------------------------------

To run all the tests in a browser (say Firefox) on the local machine

  > npm run local-tests


CI Testing
----------

Travis CI will automatically run the tests when commits are pushed to Github
(assuming the account is registered with Travis 
and the repository is registered with Saucelabs).

Testing is done in the browser / OS environments defined in "test/browsers.json".

