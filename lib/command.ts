import {posix as path} from 'path';

import {Session} from './wd-interfaces';

export class GlobalCommand<T extends Session> {
  constructor(
      public method: 'GET'|'POST'|'DELETE'|'PUT', public path: string,
      public exec: (sessions: T[], params: {[name: string]: any}) => any) {}
};

export class Command<T extends Session> {
  constructor(
      public method: 'GET'|'POST'|'DELETE'|'PUT', public path: string,
      public exec: (session: T, params: {[name: string]: any}) => any) {}

  globalize(): GlobalCommand<T> {
    return new GlobalCommand<T>(
        this.method, path.join('/session/:sessionId', this.path), (sessions, params) => {
          for (let session of sessions) {
            if (session.id == params['sessionId']) {
              return this.exec(session, params);
            }
          }
          throw {status: 6, message: 'No such session "' + params['sessionId'] + '"'};
        });
  }
}
