import { Template, TemplateVersion, Widget } from '@staroverlay/sdk';
import io from 'socket.io-client';

import StarOverlay from './client';
import { Environment } from './utils/env-utils';
import { getError } from './utils/error-utils';

export type Event = { data: unknown; topic: string };

export interface LibDOMSettings {
  backendURL: string;
  workerURL: string;
  widgetToken: string;
  renderTarget: string;
}

export function injectLibDOM({
  backendURL,
  workerURL,
  widgetToken,
  renderTarget,
}: LibDOMSettings) {
  // Initialize socket connection.
  const socket = io(backendURL, {
    transports: ['websocket'],
  });

  // Initialize Client.StarOverlay
  const client = new StarOverlay(renderTarget, socket, workerURL);
  window.StarOverlay = client;
  window.env = window.StarOverlay.env;

  // Listen for socket connect event.
  socket.on('connect', () => {
    client.logC('DOM', 'Connected to backend');
    socket.emit('auth', widgetToken);
  });

  // Listen for socket errors.
  socket.on('error', (err) => {
    const error = getError(err);
    console.error('Error ocurred:', error, err);
    window.StarOverlay.emit('error', error);
  });

  // Listen for socket auth success event.
  socket.on(
    'success',
    ({
      widget,
      template,
      version,
    }: {
      widget: Widget;
      template: Template;
      version: TemplateVersion;
    }) => {
      client.widget = widget;
      client.template = template;
      client.version = version;
      client.settings = JSON.parse(widget.settings || '{}');
      client.html = version.html;

      if (widget.enabled || window.env.SO_ENV === 'preview') {
        client.render();
      }

      if (client.topics.size != 0) {
        const topics: string[] = [];
        client.topics.forEach((topic) => {
          topics.push(topic);
        });
        socket.emit('subscribe', topics);
      }

      client.connected = true;
      client.logC('DOM', 'Logged as widget', widget._id);
    },
  );

  // Listen for topic events.
  socket.on('event', ({ data, topic }: Event) => {
    // Emit event to all listeners.
    if (client.enabled) {
      client.emit('event:' + topic, data);
      client.emit('event', { data, topic });
    }

    // Event-specific handlers.
    if (topic == 'settings:update') {
      const old = client.settings;
      client.emit('settings-updated', {
        prev: old,
        updated: data,
      });
      client.logC('DOM', 'Settings updated:', old, data);
    }

    if (topic == 'settings:toggle') {
      const toggle = data as boolean;
      client.logC('DOM', 'Widget toggled:', toggle);
      client.emit('settings-toggled', toggle);
      client.enabled = toggle;

      if (window.env.SO_ENV !== 'preview') {
        if (toggle) client.render();
        else client.clear();
      }
    }
  });
}

declare global {
  interface Window {
    StarOverlay: StarOverlay;
    env: Environment;
  }
}
