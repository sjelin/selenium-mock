import * as bodyParser from 'body-parser';
import * as express from 'express';
import {Server as ServerHandle} from 'net';
import {posix as path} from 'path';

import {Command, GlobalCommand} from './command';
import * as DefaultCommands from './default-commands';
import {Session} from './wd-interfaces';

export class Server<T extends Session> {
  app: express.Express;
  handle: ServerHandle;
  sessions: T[];

  /**
   * Instance a new mock server
   *
   * @constructor
   * @param {string|number} port The port which the server will listen on
   * @param {function} initSession An initialiser for any custom session.  Will receive a session
   *   with only the `id` and `capabilities` fields filled in.
   * @param {string} basePath The basic path for selenium commands to be executed against.  Defaults
   *   to `/wd/hub`.
   */
  constructor(
      private port: string|number, private initSession: (basicSession: Session) => T = null,
      private basePath = '/wd/hub') {
    this.app = express();
    this.sessions = [];
    if (initSession) {
      // This is a fun hack yeah?
      this.sessions.push = (...sessions: T[]) => {
        sessions = sessions.map(initSession);
        return Array.prototype.push.apply(this.sessions, sessions);
      };
    }
    this.app.use(bodyParser.json());
    this.addGlobalCommand(DefaultCommands.getStatus);
    this.addGlobalCommand(DefaultCommands.newSession);
    this.addGlobalCommand(DefaultCommands.getSessions);
    this.addGlobalCommand(DefaultCommands.deleteSession);
    this.addCommand(DefaultCommands.getSession);
    this.addSpecialRoute('GET', '/selenium-server/driver/', (req, res) => {
      if (req.query.cmd == 'shutDownSeleniumServer') {
        this.stop();
      } else if (req.query.cmd == 'getLogMessages') {
        res.send('OK');
      }
    });
  }

  /**
   * Add a new command for the server to handle
   * @param {Command<T>} command The specification for what urls to handle and how to handle them
   */
  addCommand(command: Command<T>) {
    this.addGlobalCommand(command._globalize());
  }

  /**
   * Add a new command for the server to handle
   * @param {GlobalCommand<T>} command The specification for what urls to handle/how to handle them
   */
  addGlobalCommand(command: GlobalCommand<T>) {
    let handle: express.RequestHandler = (req, res, next) => {
      function fail(e: any) {
        res.json({
          sessionId: req.params.sessionId,
          status: e.status || e.code || 13,
          value: e instanceof Error ? e.toString() : e.value != null ? e.value : e
        });
      }
      try {
        for (var name in req.body) {
          req.params[name] = req.body[name];
        }
        for (var name in req.query) {
          if (req.params[name] === undefined) {
            req.params[name] = req.query[name];
          }
        }
        Promise.resolve(command.exec(this.sessions, req.params)).then((value: any) => {
          res.json({sessionId: req.params.sessionId, status: 0, value: value});
          next();
        }, fail);
      } catch (e) {
        fail(e);
      }
    };
    this.addSpecialRoute(command.method, path.join(this.basePath, command.path), handle);
  }

  /**
   * Handle a ruote directly using the Express API.  Used for special cases
   *
   * @param {string}
   */
  addSpecialRoute(
      method: 'GET'|'POST'|'DELETE'|'PUT', path: string, handler: express.RequestHandler) {
    switch (method) {
      case 'GET':
        this.app.get(path, handler);
        break;
      case 'POST':
        this.app.post(path, handler);
        break;
      case 'DELETE':
        this.app.delete(path, handler);
        break;
      case 'PUT':
        this.app.put(path, handler);
        break;
      default:
        throw new Error('Invalid method "' + method + '"');
    }
  }

  /**
   * Start the server
   */
  start() {
    this.handle = this.app.listen(this.port);
  }

  /**
   * Close down the server
   */
  stop() {
    this.handle.close();
  }
}
