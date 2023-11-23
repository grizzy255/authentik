import { TITLE_DEFAULT } from "@goauthentik/app/common/constants";
import { Interface } from "@goauthentik/elements/Base";
import "@goauthentik/elements/LoadingOverlay";
import Guacamole from "guacamole-common-js";

import { msg } from "@lit/localize";
import { CSSResult, TemplateResult, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import AKGlobal from "@goauthentik/common/styles/authentik.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";
import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

enum GuacClientState {
    IDLE = 0,
    CONNECTING = 1,
    WAITING = 2,
    CONNECTED = 3,
    DISCONNECTING = 4,
    DISCONNECTED = 5,
}

const AUDIO_INPUT_MIMETYPE = "audio/L16;rate=44100,channels=2";

@customElement("ak-rac")
export class RacInterface extends Interface {
    static get styles(): CSSResult[] {
        return [
            PFBase,
            PFPage,
            PFContent,
            AKGlobal,
            css`
                canvas {
                    z-index: unset !important;
                }
                .container {
                    overflow: hidden;
                }
                ak-loading-overlay {
                    z-index: 5;
                }
            `,
        ];
    }

    client?: Guacamole.Client;
    tunnel?: Guacamole.Tunnel;

    @state()
    container?: HTMLElement;

    @state()
    clientState?: GuacClientState;

    @state()
    reconnecting = false;

    @property()
    app?: string;

    static domSize(): DOMRect {
        return document.body.getBoundingClientRect();
    }

    constructor() {
        super();
        this.initKeyboard();
    }

    firstUpdated(): void {
        this.updateTitle();
        const wsUrl = `${window.location.protocol.replace("http", "ws")}//${
            window.location.host
        }/ws/rac/${this.app}/`;
        this.tunnel = new Guacamole.WebSocketTunnel(wsUrl);
        this.tunnel.onerror = (status) => {
            this.reconnecting = true;
            this.clientState = undefined;
            console.debug("authentik/rac: tunnel error: ", status);
            setTimeout(() => {
                this.firstUpdated();
            }, 150);
        };
        this.client = new Guacamole.Client(this.tunnel);
        this.client.onerror = (err) => {
            this.reconnecting = true;
            this.clientState = undefined;
            console.debug("authentik/rac: error: ", err);
            setTimeout(() => {
                this.firstUpdated();
            }, 150);
        };
        this.client.onstatechange = (state) => {
            this.clientState = state;
            if (state === GuacClientState.CONNECTED) {
                this.reconnecting = false;
                this.onConnected();
            }
        };
        const params = new URLSearchParams();
        params.set(
            "screen_width",
            Math.floor(RacInterface.domSize().width).toString(),
        );
        params.set(
            "screen_height",
            Math.floor(RacInterface.domSize().height).toString(),
        );
        params.set("screen_dpi", (window.devicePixelRatio * 96).toString());
        this.client.connect(params.toString());
    }

    updateTitle(): void {
        const title = this.tenant?.brandingTitle || TITLE_DEFAULT;
        document.title = `${this.app} - ${title}`;
    }

    onConnected(): void {
        console.debug("authentik/rac: connected");
        if (!this.client) {
            return;
        }
        this.container = this.client.getDisplay().getElement();
        this.initMouse(this.container);
        this.client?.sendSize(
           Math.floor(RacInterface.domSize().width),
           Math.floor(RacInterface.domSize().height),
        );
    }

    initMouse(container: HTMLElement): void {
        const mouse = new Guacamole.Mouse(container);
        const handler = (mouseState: Guacamole.Mouse.State, scaleMouse = false) => {
            if (!this.client) return;

            if (scaleMouse) {
                mouseState.y = mouseState.y / this.client.getDisplay().getScale();
                mouseState.x = mouseState.x / this.client.getDisplay().getScale();
            }

            this.client.sendMouseState(mouseState);
        };
        mouse.onmouseup = mouse.onmousedown = (mouseState) => {
            this.container?.focus();
            handler(mouseState);
        };
        mouse.onmousemove = (mouseState) => {
            handler(mouseState, true);
        };
    }

    initAudioInput(): void {
        const stream = this.client?.createAudioStream(AUDIO_INPUT_MIMETYPE);
        if (!stream) return;
        // Guacamole.AudioPlayer
        const recorder = Guacamole.AudioRecorder.getInstance(stream, AUDIO_INPUT_MIMETYPE);
        // If creation of the AudioRecorder failed, simply end the stream
        if (!recorder) {
            stream.sendEnd();
            return;
        }
        // Otherwise, ensure that another audio stream is created after this
        // audio stream is closed
        recorder.onclose = this.initAudioInput.bind(this);
    }

    initKeyboard(): void {
        const keyboard = new Guacamole.Keyboard(document);
        keyboard.onkeydown = (keysym) => {
            this.client?.sendKeyEvent(1, keysym);
        };
        keyboard.onkeyup = (keysym) => {
            this.client?.sendKeyEvent(0, keysym);
        };
    }

    render(): TemplateResult {
        return html`
            ${this.clientState !== GuacClientState.CONNECTED
                ? html`
                      <ak-loading-overlay>
                          <span slot="body">
                              ${this.reconnecting
                                  ? html`${msg("Re-connecting...")}`
                                  : html`${msg("Connecting...")}`}
                          </span>
                      </ak-loading-overlay>
                  `
                : html``}
            <div class="container">${this.container}</div>
        `;
    }
}
