import { FetchResponse } from "../http/fetch_response"
import { FrameController } from "../core/frames/frame_controller"

export enum FrameLoadingStyle { eager = "eager", lazy = "lazy" }

export class FrameElement extends HTMLElement {
  readonly controller: FrameController

  static get observedAttributes() {
    return ["src"]
  }

  constructor() {
    super()
    this.controller = new FrameController(this)
  }

  connectedCallback() {
    this.controller.connect()
  }

  disconnectedCallback() {
    this.controller.disconnect()
  }

  attributeChangedCallback() {
    if (this.src && this.isActive && this.loading == FrameLoadingStyle.eager) {
      const value = this.controller.visit(this.src)
      Object.defineProperty(this, "loaded", { value, configurable: true })
    }
  }

  formSubmissionIntercepted(element: HTMLFormElement, submitter?: HTMLElement) {
    this.controller.formSubmissionIntercepted(element, submitter)
  }

  get src() {
    return this.getAttribute("src")
  }

  set src(value: string | null) {
    if (value) {
      this.setAttribute("src", value)
    } else {
      this.removeAttribute("src")
    }
  }

  get loading(): FrameLoadingStyle {
    return frameLoadingStyleFromString(this.getAttribute("loading") || "")
  }

  set loading(value: FrameLoadingStyle) {
    if (value) {
      this.setAttribute("loading", value)
    } else {
      this.removeAttribute("loading")
    }
  }

  get loaded(): Promise<FetchResponse | undefined> {
    return Promise.resolve(undefined)
  }

  get disabled() {
    return this.hasAttribute("disabled")
  }

  set disabled(value: boolean) {
    if (value) {
      this.setAttribute("disabled", "")
    } else {
      this.removeAttribute("disabled")
    }
  }

  get autoscroll() {
    return this.hasAttribute("autoscroll")
  }

  set autoscroll(value: boolean) {
    if (value) {
      this.setAttribute("autoscroll", "")
    } else {
      this.removeAttribute("autoscroll")
    }
  }

  get isActive() {
    return this.ownerDocument === document && !this.isPreview
  }

  get isPreview() {
    return this.ownerDocument?.documentElement?.hasAttribute("data-turbo-preview")
  }
}

function frameLoadingStyleFromString(style: string) {
  switch (style.toLowerCase()) {
    case "lazy":  return FrameLoadingStyle.lazy
    default:      return FrameLoadingStyle.eager
  }
}

customElements.define("turbo-frame", FrameElement)
