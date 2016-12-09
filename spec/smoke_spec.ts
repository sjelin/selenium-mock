import * as webdriver from 'selenium-webdriver';
let seleniumUtils = require('selenium-webdriver/http/util');
let portfinder = require('portfinder');
import {Server, Session} from '../lib';

describe('smoke', () => {
  let port: number;
  let server: Server<Session>;
  beforeAll((done) => {
    portfinder.getPort((err: Error, p: number) => {
      port = p;
      server = new Server<Session>(port);
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
    expect(server.sessions.length).toBe(0);
    let driver = new webdriver.Builder().
      usingServer('http://localhost:' + port + '/wd/hub').
      withCapabilities({browserName: 'chrome'}).build();
    driver.getSession().then((session) => {
      expect(server.sessions.length).toBe(1);
      expect(server.sessions[0].id).toBe(session.getId());
      return driver.quit();
    }).then(() => {
      expect(server.sessions.length).toBe(0);
      done();
    });
  });

  it('should be able to get the status', (done) => {
    seleniumUtils.getStatus('http://localhost:' + port + '/wd/hub').then((status: any) => {
      expect('build' in status).toBe(true);
      expect('os' in status).toBe(true);
      done();
    });
  });
});
