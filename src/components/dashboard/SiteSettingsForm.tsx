"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2, Save, Share2, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { updateSiteSettings } from "@/app/actions/site-settings"
import { PHARMACY_BRANCHES } from "@/data/pharmacy-branches"
import {
  SOCIAL_META,
  WHATSAPP_BY_BRANCH,
  type SiteSettingsFormData,
  type SocialLinkKey,
} from "@/lib/site-settings-shared"

export function SiteSettingsForm({
  initialSettings,
}: {
  initialSettings: SiteSettingsFormData
}) {
  const [form, setForm] = React.useState<SiteSettingsFormData>(initialSettings)
  const [saving, setSaving] = React.useState(false)

  const setField = (field: keyof SiteSettingsFormData) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const result = await updateSiteSettings(form)
    setSaving(false)
    if (result.ok) {
      toast.success("Site settings saved")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="dashboard-page space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage WhatsApp chat numbers and footer social links shown on the public website.
        </p>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4" />
            WhatsApp numbers
          </CardTitle>
          <CardDescription>
            One number per branch for the floating WhatsApp chat widget. Use Ghana format
            (e.g. 0554612072). Leave blank to disable a branch.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {PHARMACY_BRANCHES.map((branch) => {
            const field = WHATSAPP_BY_BRANCH[branch.id]
            if (!field) return null
            return (
              <div key={branch.id} className="space-y-2">
                <Label htmlFor={field}>{branch.name}</Label>
                <Input
                  id={field}
                  value={form[field]}
                  onChange={(e) => setField(field)(e.target.value)}
                  placeholder={branch.phone ?? "055…"}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="h-4 w-4" />
            Footer social links
          </CardTitle>
          <CardDescription>
            Full profile URLs. Leave empty to hide an icon on the website footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(SOCIAL_META) as SocialLinkKey[]).map((key) => {
            const meta = SOCIAL_META[key]
            return (
              <div key={meta.field} className="space-y-2">
                <Label htmlFor={meta.field}>{meta.label}</Label>
                <Input
                  id={meta.field}
                  type="url"
                  value={form[meta.field]}
                  onChange={(e) => setField(meta.field)(e.target.value)}
                  placeholder={`https://${meta.label.toLowerCase()}.com/…`}
                />
              </div>
            )
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save settings
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
