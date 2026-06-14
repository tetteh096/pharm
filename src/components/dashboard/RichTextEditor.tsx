"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
import {
  $getRoot,
  $insertNodes,
  EditorState,
  FORMAT_TEXT_COMMAND,
} from "lexical"
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text"
import { $createListNode, $createListItemNode } from "@lexical/list"
import { $setBlocksType } from "@lexical/selection"
import { $getSelection, $isRangeSelection, UNDO_COMMAND, REDO_COMMAND } from "lexical"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
  Image,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { $createImageNode, ImageNode } from "@/components/dashboard/lexical/ImageNode"
import { processUploadImage } from "@/lib/client-image"
import { toast } from "sonner"

function ToolbarButton({
  onClick,
  title,
  children,
  active,
  disabled,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md p-2 text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      } disabled:opacity-50`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-border" />
}

function Toolbar({
  onImageInsert,
  insertingImage,
}: {
  onImageInsert: () => void
  insertingImage: boolean
}) {
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
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border-b border-border bg-muted/40 px-3 py-2">
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
      <ToolbarButton
        onClick={onImageInsert}
        title="Insert image into article"
        disabled={insertingImage}
      >
        {insertingImage ? <Loader2 size={15} className="animate-spin" /> : <Image size={15} />}
      </ToolbarButton>
    </div>
  )
}

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

function ImageInsertPlugin({
  triggerRef,
  onBusyChange,
}: {
  triggerRef: React.MutableRefObject<(() => void) | null>
  onBusyChange: (busy: boolean) => void
}) {
  const [editor] = useLexicalComposerContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [pendingSrc, setPendingSrc] = useState("")
  const [altText, setAltText] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const insertImage = useCallback(
    (src: string, alt: string) => {
      editor.update(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          $insertNodes([$createImageNode(src, alt)])
        } else {
          $insertNodes([$createImageNode(src, alt)])
        }
      })
    },
    [editor]
  )

  useEffect(() => {
    triggerRef.current = () => fileInputRef.current?.click()
  }, [triggerRef])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Choose an image under 8 MB")
      return
    }

    onBusyChange(true)
    try {
      const processed = await processUploadImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82,
      })
      setPendingFile(file)
      setPendingSrc(processed.dataUrl)
      setAltText(file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "))
      setDialogOpen(true)
    } catch {
      toast.error("Could not add that image. Try JPG, PNG, or WEBP.")
    } finally {
      onBusyChange(false)
    }
  }

  function confirmInsert() {
    if (!pendingSrc) return
    insertImage(pendingSrc, altText.trim())
    setDialogOpen(false)
    setPendingFile(null)
    setPendingSrc("")
    setAltText("")
    toast.success("Image added to article")
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setPendingFile(null)
            setPendingSrc("")
            setAltText("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert image</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {pendingSrc ? (
              <div className="overflow-hidden rounded-lg border bg-muted/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pendingSrc}
                  alt="Preview"
                  className="max-h-56 w-full object-contain"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="blog-image-alt">Alt text (for accessibility)</Label>
              <Input
                id="blog-image-alt"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Describe what the image shows"
              />
              {pendingFile ? (
                <p className="text-xs text-muted-foreground">
                  Resized automatically for the website. Original: {pendingFile.name}
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmInsert}>
              Insert image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

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
  const [insertingImage, setInsertingImage] = useState(false)

  const initialConfig = {
    namespace: "MedizenBlogEditor",
    theme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, CodeNode, ImageNode],
    onError: (error: Error) => console.error("Lexical error:", error),
  }

  return (
    <div className="overflow-hidden rounded-md border border-input bg-background">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar
          onImageInsert={() => imageInsertRef.current?.()}
          insertingImage={insertingImage}
        />
        <div className="relative min-h-[400px]">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="min-h-[400px] p-4 text-base leading-relaxed text-foreground outline-none focus:ring-0"
                aria-label="Blog content editor"
              />
            }
            placeholder={
              <div className="pointer-events-none absolute left-4 top-4 select-none text-base text-muted-foreground/50">
                Start writing your article here. Use the image button to add photos inside the
                article.
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
          <ImageInsertPlugin
            triggerRef={imageInsertRef}
            onBusyChange={setInsertingImage}
          />
        </div>
      </LexicalComposer>
    </div>
  )
}
