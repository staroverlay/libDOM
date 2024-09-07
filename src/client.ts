import { Template, TemplateVersion, Widget } from '@staroverlay/sdk';
import type { Socket } from 'socket.io-client';

import { injectContent, renderIf } from './utils/dom-utils';
import { Environment } from './utils/env-utils';
import EventEmitter from './utils/event-emitter';

export default class StarOverlay extends EventEmitter {
  private readonly renderTarget: string | undefined;
  private readonly socket: Socket;
  private readonly cdn: string;

  public enabled: boolean;
  public connected: boolean;
  public widget: Widget | null;
  public template: Template | null;
  public version: TemplateVersion | null;
  public settings: { [key in string]: unknown };
  public topics: Set<string>;
  public env: Environment;
  public html: string;

  constructor(renderTarget: string | undefined, socket: Socket, cdn: string) {
    super();
    this.renderTarget = renderTarget;
    this.socket = socket;
    this.cdn = cdn;

    this.enabled = true;
    this.connected = false;
    this.widget = null;
    this.template = null;
    this.version = null;
    this.settings = {};
    this.topics = new Set();
    this.env = window.env;
    this.html = '';
  }

  log(...message: object[]) {
    this.logC('Wdg', ...message);
  }

  logC(context: string, ...message: unknown[]) {
    console.log('[StarOverlay] ' + context + ' >', ...message);
  }

  subscribeTopic(topic: string, listener: () => unknown) {
    if (!this.topics.has(topic)) {
      this.topics.add(topic);

      if (this.connected) {
        this.socket.emit('subscribe', [topic]);
      }
    }

    this.on('event:' + topic, listener);
  }

  getMedia(mediaID: string) {
    return `${this.cdn}/${mediaID}`;
  }

  render() {
    if (this.renderTarget) {
      injectContent(this.renderTarget, this.html);
    }

    renderIf('if-so-env', window.env.SO_ENV);
    renderIf('if-node-env', window.env.NODE_ENV);
  }

  clear() {
    if (this.renderTarget) {
      injectContent(this.renderTarget, '');
    }
  }

  initWidget(widget: Widget, template: Template, version: TemplateVersion) {
    this.widget = widget;
    this.template = template;
    this.version = version;
    this.settings = JSON.parse(widget.settings || '{}');
    this.html = this.version.html;

    if (this.topics.size != 0) {
      const topics: string[] = [];
      this.topics.forEach((topic) => {
        topics.push(topic);
      });
      this.socket.emit('subscribe', topics);
    }

    this.connected = true;
    this.logC('DOM', 'Logged as widget', widget._id);
  }
}
