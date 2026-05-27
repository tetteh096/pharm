"use client"

import { useCallback, useEffect, useRef } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { HeadingNode, QuoteNode } from "@lexical/rich-text"
import { ListItemNode, ListNode } from "@lexical/list"
import { LinkNode } from "@lexical/link"
import { CodeNode } from "@lexical/code"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import { $getRoot, $insertNodes, EditorState, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from "lexical"
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { $createListNode, $createListItemNode } from "@lexical/list"
import { $setBlocksType } from "@lexical/selection"
import { $getSelection, $isRangeSelection, UNDO_COMMAND, REDO_COMMAND } from "lexical"
import {
  Bold, Italic, Underline, List, ListOrdered,
  Heading1, Heading2, Heading3, Quote, Undo2, Redo2, Image
} from "lucide-react"

// ─── Toolbar ────────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick, title, children, active,
}: {
  onClick: () => void; title: string; children: React.ReactNode; active?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-2 rounded-md transition-colors text-sm ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-border mx-1" />
}

function Toolbar({ onImageInsert }: { onImageInsert: () => void }) {
  const [editor] = useLexicalComposerContext()

  const formatText = (format: "bold" | "italic" | "underline" | "strikethrough") => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)
  }

  const formatHeading = (tag: "h1" | "h2" | "h3") => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(tag))
      }
    })
  }

  const formatList = (type: "bullet" | "number") => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => {
          const list = $createListNode(type)
          list.append($createListItemNode())
          return list
        })
      }
    })
  }

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode())
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/40 rounded-t-md">
      <ToolbarButton onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} title="Undo">
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} title="Redo">
        <Redo2 size={15} />
      </ToolbarButton>
      <Divider />
      <ToolbarButton onClick={() => formatText("bold")} title="Bold">
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatText("italic")} title="Italic">
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatText("underline")} title="Underline">
        <Underline size={15} />
      </ToolbarButton>
      <Divider />
      <ToolbarButton onClick={() => formatHeading("h1")} title="Heading 1">
        <Heading1 size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatHeading("h2")} title="Heading 2">
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatHeading("h3")} title="Heading 3">
        <Heading3 size={15} />
      </ToolbarButton>
      <Divider />
      <ToolbarButton onClick={() => formatList("bullet")} title="Bullet List">
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => formatList("number")} title="Numbered List">
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={formatQuote} title="Blockquote">
        <Quote size={15} />
      </ToolbarButton>
      <Divider />
      <ToolbarButton onClick={onImageInsert} title="Insert Image">
        <Image size={15} />
      </ToolbarButton>
    </div>
  )
}

// ─── HTML Sync Plugin ────────────────────────────────────────────────────────
// Converts editor state → HTML string on every change

function HtmlPlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext()

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor)
        onChange(html)
      })
    },
    [editor, onChange]
  )

  return <OnChangePlugin onChange={handleChange} />
}

// ─── Initial HTML Plugin ─────────────────────────────────────────────────────
// Seeds the editor with an existing HTML string ONCE on mount.

function InitialHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext()
  const didInitRef = useRef(false)

  useEffect(() => {
    if (didInitRef.current) return
    if (!html || html === "<p></p>") {
      didInitRef.current = true
      return
    }
    didInitRef.current = true
    editor.update(() => {
      const parser = new DOMParser()
      const dom = parser.parseFromString(html, "text/html")
      const nodes = $generateNodesFromDOM(editor, dom)
      const root = $getRoot()
      root.clear()
      root.append(...nodes)
    })
  }, [editor, html])

  return null
}

// ─── Image Insert Plugin ─────────────────────────────────────────────────────

function ImageInsertPlugin({ triggerRef }: { triggerRef: React.MutableRefObject<(() => void) | null> }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    triggerRef.current = () => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "image/*"
      input.onchange = () => {
        const file = input.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => {
          const src = reader.result as string
          editor.update(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              // Insert as HTML img tag via a paragraph
              selection.insertText(`[image: ${file.name}]`)
            }
          })
          // Insert actual image by modifying HTML
          editor.update(() => {
            const root = $getRoot()
            const lastChild = root.getLastChild()
            if (lastChild) {
              lastChild.selectEnd()
            }
          })
          // Append image HTML
          const imgHtml = `<img src="${src}" alt="${file.name}" style="max-width:100%;border-radius:8px;margin:12px 0;" />`
          editor.update(() => {
            const parser = new DOMParser()
            const doc = parser.parseFromString(`<p>${imgHtml}</p>`, "text/html")
            const nodes = $generateNodesFromDOM(editor, doc)
            const selection = $getSelection()
            if ($isRangeSelection(selection)) {
              $insertNodes(nodes)
            }
          })
        }
        reader.readAsDataURL(file)
      }
      input.click()
    }
  }, [editor, triggerRef])

  return null
}

// ─── Main Export ─────────────────────────────────────────────────────────────

const theme = {
  heading: {
    h1: "text-3xl font-bold mb-4 mt-6 text-foreground",
    h2: "text-2xl font-bold mb-3 mt-5 text-foreground",
    h3: "text-xl font-semibold mb-2 mt-4 text-foreground",
  },
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
    code: "bg-muted px-1 rounded font-mono text-sm",
  },
  list: {
    ul: "list-disc pl-6 mb-4 space-y-1",
    ol: "list-decimal pl-6 mb-4 space-y-1",
    listitem: "mb-1",
  },
  quote: "border-l-4 border-primary pl-4 italic text-muted-foreground my-4",
  paragraph: "mb-3 leading-relaxed text-foreground",
  link: "text-primary underline hover:opacity-80",
}

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const imageInsertRef = useRef<(() => void) | null>(null)

  const initialConfig = {
    namespace: "MedizenBlogEditor",
    theme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode],
    onError: (error: Error) => console.error("Lexical error:", error),
  }

  return (
    <div className="bg-background rounded-md border border-input overflow-hidden">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar onImageInsert={() => imageInsertRef.current?.()} />
        <div className="relative min-h-[400px]">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[400px] p-4 outline-none text-foreground text-base leading-relaxed focus:ring-0"
                aria-label="Blog content editor"
              />
            }
            placeholder={
              <div className="absolute top-4 left-4 text-muted-foreground/50 pointer-events-none select-none text-base">
                Start writing your article here...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <InitialHtmlPlugin html={value} />
          <HtmlPlugin onChange={onChange} />
          <ImageInsertPlugin triggerRef={imageInsertRef} />
        </div>
      </LexicalComposer>
    </div>
  )
}
