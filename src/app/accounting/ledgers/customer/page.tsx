'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { customersApi } from '@/lib/api';
import { Search, User, ArrowUpRight, ArrowDownLeft, FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CustomerLedgerPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await customersApi.getAll();
        setCustomers(res.data);
      } catch (err) {
        console.error('Failed to fetch customers', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Ledgers</h1>
          <p className="text-slate-500">Track individual buyer balances and payment history</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search customer name or phone..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Customer Details</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Total Paid</TableHead>
                <TableHead>Current Position</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading accounts...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No customers found.</TableCell></TableRow>
              ) : filtered.map((c) => {
                // Approximate calculations until backend returns pre-aggregated ledger
                const balance = 0; // Placeholder
                
                return (
                  <TableRow key={c.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">₹---</TableCell>
                    <TableCell className="font-mono">₹---</TableCell>
                    <TableCell>
                      {balance > 0 ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                          <ArrowUpRight className="w-3 h-3 mr-1" /> ₹{balance} Advance
                        </Badge>
                      ) : balance < 0 ? (
                        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">
                          <ArrowDownLeft className="w-3 h-3 mr-1" /> ₹{Math.abs(balance)} Outstanding
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500">Settle</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        <FileText className="w-4 h-4 mr-2" /> View Statement
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
