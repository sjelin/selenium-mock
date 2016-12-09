import * as webdriver from 'selenium-webdriver';
let seleniumUtils = require('selenium-webdriver/http/util');
let portfinder = require('portfinder');
import {Server, Session, Command} from '../lib';

interface MySession extends Session {
  url: string;  
}
let getUrl = new Command<MySession>('GET', 'url', (session, params) => {
  return session.url;
});
let setUrl = new Command<MySession>('POST', 'url', (session, params) => {
  session.url = params['url'];
});

describe('custom commands', () => {
  let port: number;
  let server: Server<MySession>;
  beforeAll((done) => {
    portfinder.getPort((err: Error, p: number) => {
      port = p;
      server = new Server<MySession>(port);
      server.addCommand(getUrl);
      server.addCommand(setUrl);
      server.start();
      done();
    });
  });
  afterAll(() => {
    try {
      server.stop();
    } catch (e) {}
  });

  it('should be able to create and close a session', (done) => {
    let driver = new webdriver.Builder().
      usingServer('http://localhost:' + port + '/wd/hub').
      withCapabilities({browserName: 'chrome'}).build();
    driver.getSession().then((session) => {
      return driver.quit();
    }).then(() => {
      done();
    });
  });

  it('should be able to use custom commands', (done) => {
    let driver = new webdriver.Builder().
      usingServer('http://localhost:' + port + '/wd/hub').
      withCapabilities({browserName: 'chrome'}).build();
    driver.get('http://www.google.com').then(() => {
      return driver.getCurrentUrl();
    }).then((url) => {
      expect(url).toBe('http://www.google.com');
      done();
    });
  });
});
