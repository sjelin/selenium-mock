import {posix as path} from 'path';

import {Session} from './wd-interfaces';

/**
 * Defines a command which runs on the whole webdriver server - not against a particular session
 *
 * @param {string} method The method which the command uses (e.g. `'GET'`)
 * @param {string} path The path for the command.  Uses express URL notation, so you can use
 *   /element/:elementId/command to put the parameter `elementId` in the path
 * @param {function} exec The code server-side to actually execute the command.  Receives a list
 *   of all sessions and an object containing all the url + json parameters.  The returned value
 *   will be returned to the client, and can be a promise.
 */
export class GlobalCommand<T extends Session> {
  constructor(
      public method: 'GET'|'POST'|'DELETE'|'PUT', public path: string,
      public exec: (sessions: T[], params: {[name: string]: any}) => any) {}
};

/**
 * Defines a command whcih runs against a particular session.
 *
 * @param {string} method The method which the command uses (e.g. `'GET'`)
 * @param {string} path The path for the command.  Automatically has `/session/:sessionId` prepended
 *   to it.
 * @param {function} exec The code server-side to actually execute the command.  Receives the
 *   session indicated by `sessionId` and an object containing all the paramters.  If no such
 *   session can be found, throws an error indicating such.
 */
export class Command<T extends Session> {
  constructor(
      public method: 'GET'|'POST'|'DELETE'|'PUT', public path: string,
      public exec: (session: T, params: {[name: string]: any}) => any) {}

  // Internal method
  _globalize(): GlobalCommand<T> {
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
