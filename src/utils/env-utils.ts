export type PROCESS_ENV = 'development' | 'production' | 'stage';
export type SO_ENV = 'streaming' | 'preview' | 'browser';

export type Environment = {
  NODE_ENV: PROCESS_ENV;
  SO_ENV: SO_ENV;
};

export const env: Environment = {
  NODE_ENV: 'development',
  SO_ENV: 'browser',
};

// Process NODE_ENV.
const { hostname } = location;

if (hostname === 'localhost' || hostname === '127.0.0.1') {
  env.NODE_ENV = 'development';
} else if (hostname.includes('dev.')) {
  env.NODE_ENV = 'stage';
} else {
  env.NODE_ENV = 'production';
}

// Process SO_ENV.
function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

const ua = navigator.userAgent?.toLowerCase() || 'unknown?';
const apps = ['unknown?', 'obs'];
const isStreaming = apps.find((name) => ua.includes(name)) !== undefined;

if (isStreaming) {
  env.SO_ENV = 'streaming';
} else if (inIframe()) {
  env.SO_ENV = 'preview';
} else {
  env.SO_ENV = 'browser';
}
