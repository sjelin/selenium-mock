import { Session } from './wd-interfaces';
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
export declare class GlobalCommand<T extends Session> {
    method: 'GET' | 'POST' | 'DELETE' | 'PUT';
    path: string;
    exec: (sessions: T[], params: {
        [name: string]: any;
    }) => any;
    constructor(method: 'GET' | 'POST' | 'DELETE' | 'PUT', path: string, exec: (sessions: T[], params: {
        [name: string]: any;
    }) => any);
}
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
export declare class Command<T extends Session> {
    method: 'GET' | 'POST' | 'DELETE' | 'PUT';
    path: string;
    exec: (session: T, params: {
        [name: string]: any;
    }) => any;
    constructor(method: 'GET' | 'POST' | 'DELETE' | 'PUT', path: string, exec: (session: T, params: {
        [name: string]: any;
    }) => any);
    _globalize(): GlobalCommand<T>;
}
