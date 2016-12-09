Selenium Mock
=============

This is an extremely barebones mock selenium server.  Out of the box, it only supports `status` and
creating/closing/describing/listing sessions.  The idea is for you to add your own commands as
needed:

```ts
import {Server, Session as BasicSession, Command} from 'selenium-mock';

interface Session extends BasicSession {
  url: string
}
// Support for webdriver.WebDriver.prototype.get
let setUrl = new Command<MySession>('POST', 'url', (session, params) => {
  session.url = params['url'];
});
// Support for webdriver.WebDriver.prototype.getCurrentUrl
let getUrl = new Command<MySession>('GET', 'url', (session, params) => {
  return session.url;
});

let server = new Server<Session>(4444);
server.addCommand(setUrl);
server.addCommand(getUrl);
server.start();
```

See [`spec/custom_command_spec.ts`](./spec/custom_command_spec.ts) for an example
