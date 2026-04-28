"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Plus, CheckCircle, Clock, Navigation } from "lucide-react";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  WAITING_FEEDBACK: "bg-purple-100 text-purple-700"
};

export default function ServiceTicketClient() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [visitForm, setVisitForm] = useState({ agentId: "", scheduledAt: "", remarks: "" });
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function loadTicket() {
    if (!id) return;
    try {
      const res = await api.get(`/api/service/tickets/${id}`);
      setTicket(res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadTicket(); }, [id]);

  async function updateStatus(status: string) {
    setUpdatingStatus(true);
    try {
      await api.patch(`/api/service/tickets/${id}`, { status });
      loadTicket();
    } catch {}
    setUpdatingStatus(false);
  }

  async function createVisit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/service/field-visits", { ...visitForm, ticketId: id });
      setShowVisitForm(false);
      setVisitForm({ agentId: "", scheduledAt: "", remarks: "" });
      loadTicket();
    } catch {}
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (!ticket) return <div className="p-6 text-gray-400">Ticket not found</div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{ticket.title}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status] || ""}`}>{ticket.status.replace("_"," ")}</span>
          </div>
          <p className="text-sm text-gray-500">{ticket.ticketNumber}</p>
        </div>
        <div className="flex gap-2">
          {ticket.status === "OPEN" && <button onClick={() => updateStatus("IN_PROGRESS")} disabled={updatingStatus} className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-600">Start</button>}
          {ticket.status === "IN_PROGRESS" && <button onClick={() => updateStatus("RESOLVED")} disabled={updatingStatus} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600">Resolve</button>}
          {ticket.status === "RESOLVED" && <button onClick={() => updateStatus("CLOSED")} disabled={updatingStatus} className="bg-gray-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-600">Close</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Field Visits ({ticket.fieldVisits?.length || 0})</h2>
              <button onClick={() => setShowVisitForm(true)} className="flex items-center gap-1 text-blue-600 text-sm hover:underline">
                <Plus className="w-3 h-3" /> Schedule Visit
              </button>
            </div>
            {ticket.fieldVisits?.length === 0 ? (
              <p className="text-sm text-gray-400">No field visits scheduled</p>
            ) : (
              <div className="space-y-3">
                {ticket.fieldVisits?.map((visit: any) => (
                  <div key={visit.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(visit.scheduledAt).toLocaleString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          visit.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                          visit.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{visit.status}</span>
                      </div>
                      {visit.remarks && <p className="text-xs text-gray-500 mt-1">{visit.remarks}</p>}
                      {visit.distanceKm && <p className="text-xs text-gray-500">Distance: {visit.distanceKm} km | TA: ₹{visit.taAmount || 0}</p>}
                      {visit.checkInLat && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Navigation className="w-3 h-3" />
                          Check-in: {visit.checkInLat?.toFixed(4)}, {visit.checkInLng?.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-900">Details</h2>
            {[
              { label: "Type", value: ticket.type },
              { label: "Priority", value: ticket.priority },
              { label: "Customer", value: ticket.customerName || "—" },
              { label: "Phone", value: ticket.customerPhone || "—" },
              { label: "SLA Deadline", value: ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : "—" },
              { label: "Created", value: new Date(ticket.createdAt).toLocaleDateString() },
              { label: "Resolved", value: ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString() : "—" }
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>

          {ticket.feedbackRating && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Customer Feedback</h2>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < ticket.feedbackRating ? "text-yellow-400" : "text-gray-200"}>★</span>
                ))}
              </div>
              {ticket.customerFeedback && <p className="text-sm text-gray-600">{ticket.customerFeedback}</p>}
            </div>
          )}
        </div>
      </div>

      {showVisitForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Schedule Field Visit</h2>
            </div>
            <form onSubmit={createVisit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent ID *</label>
                <input required value={visitForm.agentId} onChange={(e) => setVisitForm({ ...visitForm, agentId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" placeholder="Agent User ID" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time *</label>
                <input required type="datetime-local" value={visitForm.scheduledAt} onChange={(e) => setVisitForm({ ...visitForm, scheduledAt: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea rows={2} value={visitForm.remarks} onChange={(e) => setVisitForm({ ...visitForm, remarks: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Schedule</button>
                <button type="button" onClick={() => setShowVisitForm(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
