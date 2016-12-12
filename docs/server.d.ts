/// <reference types="express" />
/// <reference types="node" />
import * as express from 'express';
import { Server as ServerHandle } from 'net';
import { Command, GlobalCommand } from './command';
import { Session } from './wd-interfaces';
export declare class Server<T extends Session> {
    private port;
    private initSession;
    private basePath;
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
    constructor(port: string | number, initSession?: (basicSession: Session) => T, basePath?: string);
    /**
     * Add a new command for the server to handle
     * @param {Command<T>} command The specification for what urls to handle and how to handle them
     */
    addCommand(command: Command<T>): void;
    /**
     * Add a new command for the server to handle
     * @param {GlobalCommand<T>} command The specification for what urls to handle/how to handle them
     */
    addGlobalCommand(command: GlobalCommand<T>): void;
    /**
     * Handle a ruote directly using the Express API.  Used for special cases
     *
     * @param {string}
     */
    addSpecialRoute(method: 'GET' | 'POST' | 'DELETE' | 'PUT', path: string, handler: express.RequestHandler): void;
    /**
     * Start the server
     */
    start(): void;
    /**
     * Close down the server
     */
    stop(): void;
}
