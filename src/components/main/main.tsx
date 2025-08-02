"use client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Eye, Users, MessageSquare, Clock, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// Updated interface to match API response
interface Query {
  id: string
  subject: string
  description: string
  status: string
  user?: string
  createdAt: string
  priority?: string
  // Add other fields that might come from your API
  userId?: string
  updatedAt?: string
  category?: string
}

interface MainPageProps {
  viewType: string
  setViewType: (value: string) => void
  status: string
  setStatus: (value: string) => void
  search: string
  setSearch: (value: string) => void
  loading: boolean
  tickets: Query[]
  viewOptions: Array<{ value: string; label: string }>
  statusOptions: string[]
  onRefresh: () => void
}

// Enhanced QueryCard component for public viewing
const QueryCard = ({ ticket,onClick }: { ticket: Query,onClick: () => void }) => (
  <div className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 transition-all duration-300 hover:bg-slate-800/60 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02]" onClick={onClick}>
    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="relative z-10">
      {/* Header with user and time */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-slate-300 font-medium">{ticket.user || ticket.userId || "Anonymous"}</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Query content */}
      <div className="flex items-start space-x-3 mb-4">
        <MessageSquare className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
            {ticket.subject}
          </h3>
          <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors duration-300 line-clamp-2">
            {ticket.description}
          </p>
        </div>
      </div>

      {/* Status and priority */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            ticket.status === "Open"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : ticket.status === "In Progress"
                ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                : ticket.status === "Resolved"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
          }`}
        >
          {ticket.status}
        </span>
        {ticket.priority && (
          <span
            className={`text-xs px-2 py-1 rounded ${
              ticket.priority === "High"
                ? "bg-red-500/20 text-red-400"
                : ticket.priority === "Medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-green-500/20 text-green-400"
            }`}
          >
            {ticket.priority}
          </span>
        )}
      </div>
    </div>
  </div>
)
export default function MainPage({
  viewType,
  setViewType,
  status,
  setStatus,
  search,
  setSearch,
  loading,
  tickets,
  viewOptions,
  statusOptions,
  onRefresh,
}: MainPageProps) {
  const router = useRouter()
  // Filter tickets based on search and status
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      search === "" ||
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = status === "All" || ticket.status === status

    return matchesSearch && matchesStatus
  })

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1 h-1 rounded-full animate-pulse ${
              i % 4 === 0
                ? "bg-purple-400/30"
                : i % 4 === 1
                  ? "bg-blue-400/30"
                  : i % 4 === 2
                    ? "bg-cyan-400/30"
                    : "bg-indigo-400/30"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400  to-indigo-400 bg-clip-text text-transparent">
              QuickDesk Community
            </h1>
          </div>
          <p className="text-slate-300 text-lg mb-2">Browse all user queries and support requests</p>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full mx-auto"></div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{tickets.length}</div>
            <div className="text-sm text-slate-400">Total Queries</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{tickets.filter((t) => t.status === "Open").length}</div>
            <div className="text-sm text-slate-400">Open</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {tickets.filter((t) => t.status === "In Progress").length}
            </div>
            <div className="text-sm text-slate-400">In Progress</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {tickets.filter((t) => t.status === "Resolved").length}
            </div>
            <div className="text-sm text-slate-400">Resolved</div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-400" />
              <span className="text-slate-300 font-medium">
                Viewing: {viewOptions.find((v) => v.value === viewType)?.label}
              </span>
            </div>
            <Button
              onClick={onRefresh}
              disabled={loading}
              className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 text-white h-9 px-3 transition-all duration-300 hover:border-indigo-400/50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* View Type Selector */}
            <div className="relative group">
              <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400 z-10" />
              <Select value={viewType} onValueChange={(val) => setViewType(val)}>
                <SelectTrigger className="pl-10 h-11 bg-slate-800/50 border-slate-600/50 text-white hover:border-purple-400/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 rounded-xl backdrop-blur-xl min-w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 text-white rounded-xl">
                  {viewOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="hover:bg-purple-500/20 focus:bg-purple-500/20 transition-colors duration-200"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            {/* Status Filter */}
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400 z-10" />
              <Select value={status} onValueChange={(val) => setStatus(val)}>
                <SelectTrigger className="pl-10 h-11 bg-slate-800/50 border-slate-600/50 text-white hover:border-blue-400/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 rounded-xl backdrop-blur-xl min-w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-slate-600/50 text-white rounded-xl">
                  {statusOptions.map((s) => (
                    <SelectItem
                      key={s}
                      value={s}
                      className="hover:bg-blue-500/20 focus:bg-blue-500/20 transition-colors duration-200"
                    >
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>

            {/* Search Input */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400 transition-all duration-300 group-hover:scale-110" />
              <Input
                placeholder="Search queries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-slate-800/50 border-slate-600/50 text-white placeholder:text-slate-400 hover:border-cyan-400/50 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 rounded-xl backdrop-blur-xl min-w-[250px]"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-slate-400 text-sm">
              Showing {filteredTickets.length} of {tickets.length} queries
              {search && ` matching "${search}"`}
              {status !== "All" && ` with status "${status}"`}
            </p>
          </div>
        )}

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-4"></div>
            <p className="text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent text-lg font-medium">
              Loading community queries...
            </p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <MessageSquare className="w-10 h-10 text-purple-400/50" />
            </div>
            <p className="text-center text-slate-400 text-lg mb-2">
              {tickets.length === 0 ? "No queries found" : "No matching queries"}
            </p>
            <p className="text-center text-slate-500 text-sm">
              {tickets.length === 0 ? "Be the first to submit a query!" : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket) => (
              <QueryCard key={ticket.id} ticket={ticket} onClick={() => router.push(`/tickets/${ticket.id}`)} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
