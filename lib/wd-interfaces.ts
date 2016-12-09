export interface Proxy {
  proxyType: string;
  proxyAutoconfigUrl?: string;
  ftpProxy?: string;
  httpProxy?: string;
  sslProxy?: string;
  socksProxy?: string;
  socksUsername?: string;
  socksPassword?: string;
  noProxy?: string;
}

export interface Capabilities {
  browserName: string;
  version?: string;
  platform?: string;
  javascriptEnabled?: boolean;
  takesScreenshot?: boolean;
  handlesAlerts?: boolean;
  databaseEnabled?: boolean;
  locationContextEnabled?: boolean;
  applicationCacheEnabled?: boolean;
  browserConnectionEnabled?: boolean;
  cssSelectorsEnabled?: boolean;
  webStorageEnabled?: boolean;
  rotatable?: boolean;
  acceptSslCerts?: boolean;
  nativeEvents?: boolean;
  proxy?: Proxy;
}

export interface Session { id: string, capabilities: Capabilities }
