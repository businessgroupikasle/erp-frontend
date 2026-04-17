"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  QrCode,
  ArrowRight
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

export default function AttendancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await api.get('/api/hr/attendance');
        setLogs(response.data);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await api.post('/api/hr/check-in', { userId: user.id });
      alert("Checked in successfully!");
      // Refresh logs...
    } catch (err) {
      alert("Failed to check in.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workforce & Attendance</h1>
          <p className="text-muted-foreground">Manage staff schedules, track attendance, and oversee shift performance.</p>
        </div>
        <button 
          onClick={handleCheckIn}
          className="flex items-center gap-3 bg-secondary text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <QrCode size={20} />
          Check In Now
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-muted shadow-sm space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">On Duty</p>
          <h3 className="text-3xl font-black text-secondary">{logs.filter(l => !l.checkOut).length}</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-muted shadow-sm space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Late Arrivals</p>
          <h3 className="text-3xl font-black text-orange-500">2</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-muted shadow-sm space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Staff</p>
          <h3 className="text-3xl font-black text-foreground">24</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-muted shadow-sm space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Shifts</p>
          <h3 className="text-3xl font-black text-primary">3</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Log */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Calendar size={20} className="text-primary"/>
              Today's Attendance
            </h3>
          </div>

          <div className="bg-white rounded-[2rem] border border-muted overflow-hidden shadow-sm">
            {loading ? (
               <div className="p-20 text-center text-muted-foreground">Loading workforce data...</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/30 border-b border-muted">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Staff Member</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Shift Time</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status</th>
                    <th className="px-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {log.user?.name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{log.user?.name}</p>
                            <p className="text-[10px] font-black text-muted-foreground uppercase italic">{log.user?.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Clocked In</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={clsx(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          log.status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="p-3 bg-muted/20 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                          <ArrowRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                       <td colSpan={4} className="p-20 text-center text-muted-foreground italic">No attendance records found for today.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Shift Management */}
        <div className="bg-zinc-950 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-8 h-fit sticky top-8">
           <div className="space-y-2">
             <h3 className="text-2xl font-black tracking-tight underline decoration-primary decoration-4 underline-offset-8">Morning Shift</h3>
             <p className="text-zinc-500 text-sm font-medium pt-2">Started at 6:00 AM • 4 Hours left</p>
           </div>

           <div className="space-y-6">
              <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <Users size={24} />
                 </div>
                 <div>
                    <p className="text-2xl font-black">18/20</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Staff Checked In</p>
                 </div>
              </div>
              
              <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                    <CheckCircle2 size={24} />
                 </div>
                 <div>
                    <p className="text-2xl font-black">100%</p>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Station Hygiene Score</p>
                 </div>
              </div>
           </div>

           <button className="w-full py-5 bg-white text-zinc-950 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-white/5">
              Launch Shift Daily Report
           </button>
        </div>
      </div>
    </div>
  );
}
