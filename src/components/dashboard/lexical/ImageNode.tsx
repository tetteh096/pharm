import type { ReactElement } from "react"
import {
  $applyNodeReplacement,
  DecoratorNode,
  DOMConversionMap,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical"

export type SerializedImageNode = Spread<
  {
    alt: string
    src: string
    type: "image"
    version: 1
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<ReactElement> {
  __src: string
  __alt: string

  static getType(): string {
    return "image"
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__key)
  }

  constructor(src: string, alt: string, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__alt = alt
  }

  createDOM(): HTMLElement {
    return document.createElement("span")
  }

  updateDOM(): false {
    return false
  }

  decorate(): ReactElement {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={this.__src}
        alt={this.__alt}
        draggable={false}
        className="my-3 block max-h-[420px] w-full max-w-full rounded-lg object-contain"
      />
    )
  }

  exportDOM(): DOMExportOutput {
    const img = document.createElement("img")
    img.setAttribute("src", this.__src)
    img.setAttribute("alt", this.__alt)
    img.setAttribute("loading", "lazy")
    img.className = "blog-inline-image"
    return { element: img }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (domNode) => {
          const img = domNode as HTMLImageElement
          const src = img.getAttribute("src")
          if (!src) return { node: null }
          return { node: $createImageNode(src, img.getAttribute("alt") ?? "") }
        },
        priority: 2,
      }),
    }
  }

  exportJSON(): SerializedImageNode {
    return {
      alt: this.__alt,
      src: this.__src,
      type: "image",
      version: 1,
    }
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    return $createImageNode(serializedNode.src, serializedNode.alt)
  }
}

export function $createImageNode(src: string, alt: string): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, alt))
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode
}
