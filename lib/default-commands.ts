import {v4 as uuid} from 'node-uuid';
import * as os from 'os';

import {Command, GlobalCommand} from './command';
import {Session} from './wd-interfaces';

export let getStatus = new GlobalCommand<Session>('GET', '/status', (sessions, params) => {
  return {
    build: {version: require('../../package.json').version},
    os: {arch: os.arch(), name: os.type(), version: os.release()}
  };
});

export let newSession = new GlobalCommand<Session>('POST', '/session', (sessions, params) => {
  params['sessionId'] = uuid();  // This is a hack so we return the sessionId
  sessions.push({id: params['sessionId'], capabilities: params['desiredCapabilities']});
  return params['desiredCapabilities'];
});

export let getSessions = new GlobalCommand<Session>('GET', '/sessions', (sessions, params) => {
  return sessions;
});

export let getSession = new Command<Session>('GET', '', (session, params) => {
  return session.capabilities;
});

export let deleteSession =
    new GlobalCommand<Session>('DELETE', '/session/:sessionId', (sessions, params) => {
      for (let i = sessions.length - 1; i >= 0; i--) {
        if (sessions[i].id == params['sessionId']) {
          sessions.splice(i, 1);
          return;
        }
      }
      throw {status: 6, value: 'No such session "' + params['sessionId'] + '"'};
    });
