"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  KeyRound, Plus, Trash2, Copy, Check, Webhook, Eye, EyeOff,
  ToggleLeft, ToggleRight, AlertTriangle
} from "lucide-react"

interface ApiKeyData {
  id: string
  name: string
  prefix: string
  keyPreview: string
  permissions: string[]
  isActive: boolean
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

interface WebhookData {
  id: string
  url: string
  secret: string
  events: string[]
  isActive: boolean
  lastError: string | null
  createdAt: string
}

const ALL_PERMISSIONS = [
  "*",
  "products:read", "products:write", "products:delete",
  "categories:read", "categories:write", "categories:delete",
  "orders:read", "orders:write",
  "customers:read",
  "inventory:read", "inventory:write",
  "coupons:read", "coupons:write", "coupons:delete",
  "analytics:read",
  "settings:read", "settings:write",
]

const WEBHOOK_EVENTS = [
  "order.created", "order.updated", "order.status_changed", "order.cancelled",
  "product.created", "product.updated", "product.deleted",
  "inventory.updated", "inventory.low",
  "category.created", "category.updated", "category.deleted",
  "coupon.created", "coupon.updated", "coupon.deleted",
  "settings.updated",
]

export default function ApiManagementPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"keys" | "webhooks">("keys")

  // Create Key Modal
  const [showCreateKey, setShowCreateKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>(["*"])
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Create Webhook Modal
  const [showCreateWebhook, setShowCreateWebhook] = useState(false)
  const [newWebhookUrl, setNewWebhookUrl] = useState("")
  const [newWebhookEvents, setNewWebhookEvents] = useState<string[]>([])
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [keysRes, webhooksRes] = await Promise.all([
        fetch("/api/v1/admin/api-keys"),
        fetch("/api/v1/admin/webhooks"),
      ])
      const keysData = await keysRes.json()
      const webhooksData = await webhooksRes.json()
      setApiKeys(keysData.data || [])
      setWebhooks(webhooksData.data || [])
    } catch (error) {
      console.error("Failed to fetch:", error)
    }
    setLoading(false)
  }

  async function createApiKey() {
    try {
      const res = await fetch("/api/v1/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPermissions,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCreatedKey(data.data.key)
        setNewKeyName("")
        setNewKeyPermissions(["*"])
        fetchData()
      }
    } catch (error) {
      console.error("Failed to create key:", error)
    }
  }

  async function toggleApiKey(id: string, isActive: boolean) {
    await fetch(`/api/v1/admin/api-keys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchData()
  }

  async function deleteApiKey(id: string) {
    if (!confirm("Are you sure? This will permanently revoke this API key.")) return
    await fetch(`/api/v1/admin/api-keys/${id}`, { method: "DELETE" })
    fetchData()
  }

  async function createWebhook() {
    try {
      const res = await fetch("/api/v1/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: newWebhookUrl,
          events: newWebhookEvents,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCreatedSecret(data.data.secret)
        setNewWebhookUrl("")
        setNewWebhookEvents([])
        fetchData()
      }
    } catch (error) {
      console.error("Failed to create webhook:", error)
    }
  }

  async function toggleWebhook(id: string, isActive: boolean) {
    await fetch(`/api/v1/admin/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    fetchData()
  }

  async function deleteWebhook(id: string) {
    if (!confirm("Are you sure? This will permanently delete this webhook.")) return
    await fetch(`/api/v1/admin/webhooks/${id}`, { method: "DELETE" })
    fetchData()
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function togglePermission(perm: string) {
    setNewKeyPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  function toggleWebhookEvent(event: string) {
    setNewWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API & Webhooks</h1>
        <p className="text-gray-500 mt-1">
          Manage API keys for external storefront connections and webhooks for real-time notifications.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("keys")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "keys"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <KeyRound className="inline h-4 w-4 mr-1.5" />
          API Keys ({apiKeys.length})
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "webhooks"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Webhook className="inline h-4 w-4 mr-1.5" />
          Webhooks ({webhooks.length})
        </button>
      </div>

      {/* API Keys Tab */}
      {activeTab === "keys" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              API keys authenticate external storefronts to access your data via the REST API.
            </p>
            <Button onClick={() => { setShowCreateKey(true); setCreatedKey(null) }}>
              <Plus className="h-4 w-4 mr-1.5" /> Create API Key
            </Button>
          </div>

          {/* Create Key Modal */}
          {showCreateKey && (
            <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
              {createdKey ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Save your API key now!</p>
                      <p className="text-sm text-yellow-700 mt-1">This is the only time the full key will be shown.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg font-mono text-sm">
                    <code className="flex-1 break-all">{createdKey}</code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdKey)}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => { setShowCreateKey(false); setCreatedKey(null) }}>
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold">Create New API Key</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <Input
                      placeholder="e.g., Mobile App, Next.js Storefront"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Permissions</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ALL_PERMISSIONS.map((perm) => (
                        <button
                          key={perm}
                          onClick={() => togglePermission(perm)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            newKeyPermissions.includes(perm)
                              ? "bg-blue-100 border-blue-300 text-blue-700"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {perm === "*" ? "Full Access (*)" : perm}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createApiKey} disabled={!newKeyName}>
                      Create Key
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateKey(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* API Keys List */}
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="bg-white border rounded-xl p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{key.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      key.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {key.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <code className="bg-gray-50 px-2 py-0.5 rounded text-xs">{key.keyPreview}</code>
                    <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                    {key.lastUsedAt && (
                      <span>Last used {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {key.permissions.map((p) => (
                      <span key={p} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="ghost" onClick={() => toggleApiKey(key.id, key.isActive)}>
                    {key.isActive ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => deleteApiKey(key.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {apiKeys.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <KeyRound className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No API keys yet</p>
                <p className="text-sm mt-1">Create an API key to connect an external storefront.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === "webhooks" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Webhooks send real-time notifications to your storefront when data changes.
            </p>
            <Button onClick={() => { setShowCreateWebhook(true); setCreatedSecret(null) }}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Webhook
            </Button>
          </div>

          {/* Create Webhook Modal */}
          {showCreateWebhook && (
            <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
              {createdSecret ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Save your webhook secret!</p>
                      <p className="text-sm text-yellow-700 mt-1">Use this secret to verify webhook signatures.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg font-mono text-sm">
                    <code className="flex-1 break-all">{createdSecret}</code>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdSecret)}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={() => { setShowCreateWebhook(false); setCreatedSecret(null) }}>
                    Done
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-semibold">Create Webhook Endpoint</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Endpoint URL</label>
                    <Input
                      placeholder="https://mystore.com/webhooks/zenixa"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Events to subscribe</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {WEBHOOK_EVENTS.map((event) => (
                        <button
                          key={event}
                          onClick={() => toggleWebhookEvent(event)}
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            newWebhookEvents.includes(event)
                              ? "bg-purple-100 border-purple-300 text-purple-700"
                              : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {event}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createWebhook} disabled={!newWebhookUrl || newWebhookEvents.length === 0}>
                      Create Webhook
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateWebhook(false)}>
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Webhooks List */}
          <div className="space-y-3">
            {webhooks.map((wh) => (
              <div key={wh.id} className="bg-white border rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-medium text-gray-900 truncate">{wh.url}</code>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        wh.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {wh.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {wh.lastError && (
                      <p className="text-xs text-red-500 mt-1">Last error: {wh.lastError}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="ghost" onClick={() => toggleWebhook(wh.id, wh.isActive)}>
                      {wh.isActive ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => deleteWebhook(wh.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {wh.events.map((e) => (
                    <span key={e} className="px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {webhooks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Webhook className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No webhooks configured</p>
                <p className="text-sm mt-1">Create a webhook to receive real-time event notifications.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
