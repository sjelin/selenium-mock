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
    this.app.get('/selenium-server/driver/', (req, res) => {
      if (req.query.cmd == 'shutDownSeleniumServer') {
        this.stop();
      } else if (req.query.cmd == 'getLogMessages') {
        res.send('OK');
      }
    });
  }

  addCommand(command: Command<T>) {
    this.addGlobalCommand(command.globalize());
  }

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
        Promise.resolve(command.exec(this.sessions, req.params)).then((value: any) => {
          res.json({sessionId: req.params.sessionId, status: 0, value: value});
          next();
        }, fail);
      } catch (e) {
        fail(e);
      }
    };
    let cmdPath = path.join(this.basePath, command.path);
    switch (command.method) {
      case 'GET':
        this.app.get(cmdPath, handle);
        break;
      case 'POST':
        this.app.post(cmdPath, handle);
        break;
      case 'DELETE':
        this.app.delete(cmdPath, handle);
        break;
      case 'PUT':
        this.app.put(cmdPath, handle);
        break;
      default:
        throw new Error('Invalid method "' + command.method + '"');
    }
  }

  start() {
    this.handle = this.app.listen(this.port);
  }

  stop() {
    this.handle.close();
  }
}
