"use client"

import { useState, useEffect, useMemo } from "react"
import { formatPrice, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Loader2, Eye, Package, Download, CheckSquare, X, Search, Trash2 } from "lucide-react"
import { Order } from "@/types"
import { BulkActionBar } from "@/components/admin/bulk-action-bar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { AdminListSkeleton, AdminTableSkeleton } from "@/components/admin/admin-skeletons"

const statusBadgeClass: Record<string, string> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
}

const statusTabs = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
]

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
]

function getRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return past.toLocaleDateString()
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [shippingUpdateLoading, setShippingUpdateLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Filters
  const [activeTab, setActiveTab] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Bulk selection
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Single delete
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")
      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      if (Array.isArray(data)) {
        setOrders(data)
      } else {
        setOrders([])
        console.error("Invalid orders data:", data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filtered orders based on tab and search
  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Filter by status tab
    if (activeTab !== "ALL") {
      filtered = filtered.filter(order => order.status === activeTab)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.customerEmail?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [orders, activeTab, searchQuery])

  // Count orders by status for tabs
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: orders.length }
    statusTabs.slice(1).forEach(tab => {
      counts[tab.value] = orders.filter(o => o.status === tab.value).length
    })
    return counts
  }, [orders])

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch("/api/admin/orders/export")
      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Orders exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export orders",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      toast({
        title: "Success",
        description: "Order status updated",
      })

      setOrders(orders.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: status as Order['status'] })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const updateShippingDetails = async () => {
    if (!selectedOrder) return
    setShippingUpdateLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courier: selectedOrder.courier,
          trackingId: selectedOrder.trackingId
        }),
      })

      if (!response.ok) throw new Error("Failed to update")

      toast({ title: "Success", description: "Shipping details updated" })

      // Update local state
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, courier: selectedOrder.courier, trackingId: selectedOrder.trackingId } : o))
    } catch (error) {
      toast({ title: "Error", description: "Failed to update shipping details", variant: "destructive" })
    } finally {
      setShippingUpdateLoading(false)
    }
  }

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/orders/${deleteOrderId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Delete failed")

      toast({
        title: "Deleted",
        description: "Order deleted successfully",
      })

      setOrders(orders.filter(o => o.id !== deleteOrderId))
      setDeleteOrderId(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setDialogOpen(true)
  }

  // Bulk actions
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)))
    }
  }

  const exitSelectMode = () => {
    setSelectMode(false)
    setSelectedIds(new Set())
  }

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    try {
      const response = await fetch("/api/admin/orders/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })

      if (!response.ok) throw new Error("Delete failed")

      const result = await response.json()
      toast({
        title: "Deleted",
        description: `${result.deleted} orders deleted`,
      })

      exitSelectMode()
      fetchOrders()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete orders",
        variant: "destructive",
      })
    } finally {
      setBulkDeleting(false)
      setShowDeleteConfirm(false)
    }
  }



  // ... imports ...

  // Inside component function
  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="admin-page-title">Orders</h1>
            <p className="admin-page-subtitle hidden md:block">Manage customer orders</p>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-[hsl(220,14%,96%)] rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="h-12 w-full bg-white rounded-xl border border-[hsl(220,13%,91%)] animate-pulse" />

        <div className="flex gap-2 overflow-hidden pb-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-9 w-24 bg-white rounded-xl border border-[hsl(220,13%,91%)] flex-shrink-0 animate-pulse" />
          ))}
        </div>

        <div className="lg:hidden">
          <AdminListSkeleton />
        </div>
        <div className="hidden lg:block">
          <AdminTableSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-subtitle hidden md:block">
            Manage customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Select mode toggle */}
          {orders.length > 0 && (
            <Button
              variant={selectMode ? "default" : "outline"}
              size="sm"
              onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
              className="lg:hidden rounded-xl"
            >
              {selectMode ? (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  Select
                </>
              )}
            </Button>
          )}
          <button
            onClick={handleExport}
            disabled={exporting || orders.length === 0}
            className="admin-action-btn secondary"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,9%,46%)]" />
        <Input
          placeholder="Search orders by number, customer name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl border-[hsl(220,13%,91%)] bg-white"
        />
      </div>

      {/* Status Tabs */}
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="flex gap-2 min-w-max pb-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                activeTab === tab.value
                  ? "bg-[hsl(221,83%,53%)] text-white shadow-sm"
                  : "bg-white text-[hsl(220,9%,46%)] border border-[hsl(220,13%,91%)] hover:bg-[hsl(220,14%,96%)]"
              )}
            >
              {tab.label}
              {statusCounts[tab.value] > 0 && (
                <span className={cn(
                  "ml-2 px-1.5 py-0.5 rounded-full text-xs",
                  activeTab === tab.value
                    ? "bg-white/20 text-white"
                    : "bg-[hsl(220,14%,96%)] text-[hsl(220,9%,46%)]"
                )}>
                  {statusCounts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="admin-list-card">
          <div className="admin-empty-state">
            <Package className="icon" />
            <p className="title">
              {searchQuery || activeTab !== "ALL" ? "No matching orders" : "No orders yet"}
            </p>
            <p className="description">
              {searchQuery || activeTab !== "ALL"
                ? "Try adjusting your filters"
                : "Orders will appear here when customers place them"}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: Cards */}
          <div className="space-y-3 lg:hidden">
            {filteredOrders.map((order: any) => (
              <div
                key={order.id}
                className={cn(
                  "admin-order-card",
                  selectedIds.has(order.id) && "ring-2 ring-[hsl(221,83%,53%)]"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox for selection */}
                  {selectMode && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSelect(order.id)
                      }}
                      className="pt-1"
                    >
                      <Checkbox checked={selectedIds.has(order.id)} />
                    </div>
                  )}

                  {/* Order Info */}
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => !selectMode && viewOrderDetails(order)}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-[hsl(222,47%,11%)]">#{order.orderNumber}</span>
                      <span className={`admin-badge ${statusBadgeClass[order.status]}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-[hsl(222,47%,11%)] truncate">{order.customerName}</p>
                        <p className="text-xs text-[hsl(220,9%,46%)]">{getRelativeTime(order.createdAt)}</p>
                      </div>
                      <p className="font-bold text-lg text-[hsl(222,47%,11%)] whitespace-nowrap">{formatPrice(order.total)}</p>
                    </div>

                    {/* Product thumbnails */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex items-center gap-1 mt-3 overflow-hidden">
                        {order.items.slice(0, 4).map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="w-10 h-10 rounded-lg bg-[hsl(220,14%,96%)] overflow-hidden flex-shrink-0"
                          >
                            {item.product?.images[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product?.name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-4 w-4 text-[hsl(220,9%,60%)]" />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="w-10 h-10 rounded-lg bg-[hsl(220,14%,96%)] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-[hsl(220,9%,46%)]">+{order.items.length - 4}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Delete button - always visible */}
                  {!selectMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteOrderId(order.id)
                      }}
                      className="p-2 rounded-xl hover:bg-[hsl(0,84%,60%,0.1)] transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-[hsl(0,84%,60%)]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="admin-list-card hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[hsl(220,13%,91%)]">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: any) => (
                  <TableRow
                    key={order.id}
                    className={cn(
                      "border-b border-[hsl(220,13%,94%)]",
                      selectedIds.has(order.id) && "bg-[hsl(221,83%,53%,0.05)]"
                    )}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-[hsl(222,47%,11%)]">#{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[hsl(222,47%,11%)]">{order.customerName}</p>
                        <p className="text-sm text-[hsl(220,9%,46%)]">{order.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-[hsl(220,9%,46%)]">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-lg">
                        {order.paymentMethod === "COD" ? "COD" : "Bank Transfer"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                        disabled={updatingStatus === order.id}
                      >
                        <SelectTrigger className="w-32 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="font-bold text-[hsl(222,47%,11%)]">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => setDeleteOrderId(order.id)}
                        >
                          <Trash2 className="h-4 w-4 text-[hsl(0,84%,60%)]" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        onDelete={() => setShowDeleteConfirm(true)}
        onExport={handleExport}
        onClear={exitSelectMode}
      />

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} orders?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All selected orders and their items will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,55%)] rounded-xl"
              disabled={bulkDeleting}
            >
              {bulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Delete Confirmation */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The order and all its items will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-[hsl(0,84%,60%)] hover:bg-[hsl(0,84%,55%)] rounded-xl"
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[hsl(222,47%,11%)]">Order #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Placed on{" "}
              {selectedOrder &&
                new Date(selectedOrder.createdAt).toLocaleDateString("en-PK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status Update */}
              <div className="p-4 bg-[hsl(220,14%,96%)] rounded-xl">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm font-medium mb-1 text-[hsl(220,9%,46%)]">Order Status</p>
                    <span className={`admin-badge ${statusBadgeClass[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm font-medium mb-1 text-[hsl(220,9%,46%)]">Update Status</p>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                      disabled={updatingStatus === selectedOrder.id}
                    >
                      <SelectTrigger className="rounded-xl">
                        {updatingStatus === selectedOrder.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="p-4 bg-[hsl(220,14%,96%)] rounded-xl">
                <h4 className="font-semibold mb-3 text-[hsl(222,47%,11%)]">Shipping Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[hsl(220,9%,46%)]">Courier Name</label>
                    <Input
                      placeholder="e.g. TCS, Leopard"
                      value={selectedOrder.courier || ""}
                      onChange={(e) => setSelectedOrder({ ...selectedOrder, courier: e.target.value })}
                      className="bg-white border-gray-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[hsl(220,9%,46%)]">Tracking ID</label>
                    <Input
                      placeholder="e.g. 123456789"
                      value={selectedOrder.trackingId || ""}
                      onChange={(e) => setSelectedOrder({ ...selectedOrder, trackingId: e.target.value })}
                      className="bg-white border-gray-200"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" onClick={updateShippingDetails} disabled={shippingUpdateLoading}>
                    {shippingUpdateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Details"}
                  </Button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-[hsl(222,47%,11%)]">Customer Details</h4>
                  <p className="text-sm text-[hsl(222,47%,11%)]">{selectedOrder.customerName}</p>
                  <p className="text-sm text-[hsl(220,9%,46%)]">{selectedOrder.customerEmail}</p>
                  <p className="text-sm text-[hsl(220,9%,46%)]">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-[hsl(222,47%,11%)]">Shipping Address</h4>
                  <p className="text-sm text-[hsl(222,47%,11%)]">{selectedOrder.shippingAddress}</p>
                  <p className="text-sm text-[hsl(220,9%,46%)]">
                    {selectedOrder.city}
                    {selectedOrder.postalCode && `, ${selectedOrder.postalCode}`}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h4 className="font-semibold mb-2 text-[hsl(222,47%,11%)]">Order Items</h4>
                <div className="space-y-2">
                  {(selectedOrder as any).items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm p-3 bg-[hsl(220,14%,98%)] rounded-xl">
                      <div>
                        <p className="font-medium text-[hsl(222,47%,11%)]">{item.product?.name || "Product"}</p>
                        {item.variant && (
                          <p className="text-[hsl(220,9%,46%)]">
                            {item.variant.size} {item.variant.color}
                          </p>
                        )}
                        <p className="text-[hsl(220,9%,46%)]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-[hsl(222,47%,11%)]">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(220,9%,46%)]">Subtotal</span>
                  <span className="text-[hsl(222,47%,11%)]">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[hsl(220,9%,46%)]">Shipping</span>
                  <span className="text-[hsl(222,47%,11%)]">
                    {selectedOrder.shipping === 0 ? "Free" : formatPrice(selectedOrder.shipping)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-[hsl(222,47%,11%)]">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Payment */}
              <div className="p-4 bg-[hsl(220,14%,96%)] rounded-xl">
                <p className="font-semibold mb-1 text-[hsl(222,47%,11%)]">Payment Method</p>
                <p className="text-sm text-[hsl(220,9%,46%)]">
                  {selectedOrder.paymentMethod === "COD" ? "Cash on Delivery" : "Bank Transfer"}
                </p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <h4 className="font-semibold mb-2 text-[hsl(222,47%,11%)]">Order Notes</h4>
                  <p className="text-sm text-[hsl(220,9%,46%)]">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
