import * as DefaultCommands from '../lib/default-commands'
import {Session} from '../lib'

describe('default commands (unit tests)', () => {
  let chromeCaps = {browserName: 'chrome'};
  let ffCaps = {browserName: 'firefox'};
  let safariCaps = {browserName: 'safari'};
  describe('getStatus', () => {
    it('should return a status', () => {
      let result = DefaultCommands.getStatus.exec([], {});  
      expect('build' in result);
      expect('os' in result);
    });
  });

  describe('newSession', () => {
    it('should add a session and return capabilities', () => {
      let sessions: Session[] = [];
      let result = DefaultCommands.newSession.exec(sessions, {
        desiredCapabilities: chromeCaps
      });
      expect(sessions.length).toBe(1);
      expect(sessions[0].capabilities).toBe(result);
    });
  });

  describe('getSessions', () => {
    it('should return the sessions', () => {
      let sessions: Session[] = [];
      let result = DefaultCommands.getSessions.exec(sessions, {});
      expect(result).toBe(sessions);
    });
  });

  describe('getSession', () => {
    it('should return a session\' capabilities', () => {
      let result = DefaultCommands.getSession.exec({
        id: 'id',
        capabilities: chromeCaps
      }, {});
      expect(result).toBe(chromeCaps);
    });

    it('should find the correct session from a list', () => {
      let result = DefaultCommands.getSession.globalize().exec([{
        id: 'c',
        capabilities: chromeCaps
      }, {
        id: 'f',
        capabilities: ffCaps
      }], { sessionId: 'f' });
      expect(result).toBe(ffCaps);
    });

    it('should error if it can\'t find the correct session', (done) => {
      try {
        DefaultCommands.getSession.globalize().exec([], { sessionId: 's' });
        done.fail('Invalid ID didn\'t throw an error');
      } catch (e) {
        expect(e.status).toBe(6);
        done();
      }
    });
  });

  describe('deleteSession', () => {
    it('should remove a session', () => {
      let sessions: Session[] = [{
        id: 'c',
        capabilities: chromeCaps
      }, {
        id: 'f',
        capabilities: ffCaps
      }, {
        id: 's',
        capabilities: safariCaps
      }];
      DefaultCommands.deleteSession.exec(sessions, { sessionId: 'f' });
      expect(sessions.length).toBe(2);
      expect(sessions[0].id).toBe('c');
      expect(sessions[1].id).toBe('s');
    });

    it('should error if it can\'t find the correct session', (done) => {
      try {
        DefaultCommands.deleteSession.exec([], { sessionId: 'id' });
        done.fail('Invalid ID didn\'t throw an error');
      } catch (e) {
        expect(e.status).toBe(6);
        done();
      }
    });
  });
});
