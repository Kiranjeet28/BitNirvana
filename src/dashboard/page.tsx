"use client"

import MainPage from "@/components/main/main"
import NavbarMain from "@/components/others/navbar"
import { useState, useEffect } from "react"
import { toast } from "sonner"

// View and status options
const viewOptions = [
  { value: "all", label: "All Queries" },
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "urgent", label: "Urgent" },
]

const statusOptions = ["All", "Open", "In Progress", "Resolved", "Closed"]

export default function Page() {
  const [viewType, setViewType] = useState("all")
  const [status, setStatus] = useState("All")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])

  // Function to fetch tickets from API
  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: "MINE" })

      if (status !== "All") {
        params.append("status", status)
      }

      const response = await fetch(`/api/tickets?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched tickets:", data)

      if (Array.isArray(data)) {
        setTickets(data)
      } else if (data.tickets && Array.isArray(data.tickets)) {
        setTickets(data.tickets)
      } else if (data.data && Array.isArray(data.data)) {
        setTickets(data.data)
      } else {
        console.warn("Unexpected API response structure:", data)
        setTickets([])
      }
    } catch (error) {
      console.error("Error fetching tickets:", error)
      toast.error("Failed to load tickets. Please try again.")
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    if (viewType !== "all") {
      fetchTickets()
    }
  }, [viewType])

  return (
    <>
      <NavbarMain/>
      <MainPage
        viewType={viewType}
        setViewType={setViewType}
        status={status}
        setStatus={setStatus}
        search={search}
        setSearch={setSearch}
        loading={loading}
        tickets={tickets}
        viewOptions={viewOptions}
        statusOptions={statusOptions}
        onRefresh={fetchTickets}
      />
    </>
  )
}
