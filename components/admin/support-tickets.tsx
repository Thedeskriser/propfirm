"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVisibilityPoll } from "@/hooks/use-visibility-poll";
import { api } from "@/lib/api";
import { Ticket, TicketMessage } from "@/types/api";

export function AdminSupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  // Poll tickets list
  useVisibilityPoll(async () => {
    if (selectedTicket) return; // Don't poll list while viewing a ticket to avoid losing state
    try {
      const data = await api.admin.tickets.list();
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  }, 10000, true);

  // Poll active ticket messages
  useVisibilityPoll(async () => {
    if (!selectedTicket) return;
    try {
      const data = await api.admin.tickets.get(selectedTicket.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  }, 5000, !!selectedTicket);

  const handleSelectTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    try {
      const data = await api.admin.tickets.get(ticket.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setLoading(true);
    try {
      await api.admin.tickets.reply(selectedTicket.id, replyText);
      setReplyText("");
      // refetch
      const data = await api.admin.tickets.get(selectedTicket.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await api.admin.tickets.updateStatus(selectedTicket.id, status);
      setSelectedTicket({ ...selectedTicket, status: status as any });
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors = {
    open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  };

  if (selectedTicket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
            ← Back to Tickets
          </Button>
          <div className="flex gap-2">
            {['open', 'pending', 'resolved', 'closed'].map((s) => (
              <Button
                key={s}
                variant={selectedTicket.status === s ? "default" : "outline"}
                size="sm"
                onClick={() => handleUpdateStatus(s)}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>

        <Card className="p-6">
          <div className="border-b dark:border-gray-800 pb-4 mb-4">
            <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
            <div className="text-sm text-gray-500 mt-1 flex gap-4">
              <span>User: {selectedTicket.user_email || "Unknown"}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[selectedTicket.status]}`}>
                {selectedTicket.status}
              </span>
              <span className="capitalize text-gray-400">Category: {selectedTicket.category}</span>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 p-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender_type === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <div className="text-xs opacity-70 mb-1">{msg.sender_type === 'admin' ? 'You (Support)' : 'User'} - {new Date(msg.created_at).toLocaleString()}</div>
                  <div className="whitespace-pre-wrap">{msg.message}</div>
                </div>
              </div>
            ))}
            {messages.length === 0 && <div className="text-center text-gray-500 py-10">No messages found.</div>}
          </div>

          <div className="border-t dark:border-gray-800 pt-4 flex gap-3">
            <textarea
              className="flex-1 rounded-md border p-3 dark:bg-gray-900 dark:border-gray-700 min-h-[80px]"
              placeholder="Type your reply to the user..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button onClick={handleSendReply} disabled={!replyText.trim() || loading} className="self-end">
              Send Reply
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Support Tickets</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-800 text-gray-500">
            <tr>
              <th className="pb-3 font-medium">Ticket</th>
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Last Update</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tickets.map((t) => (
              <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="py-4">
                  <div className="font-medium">{t.subject}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{t.latest_message || "No messages"}</div>
                </td>
                <td className="py-4">
                  <div className="text-gray-900 dark:text-gray-100">{t.display_name || 'User'}</div>
                  <div className="text-xs text-gray-500">{t.user_email}</div>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[t.status]}`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-4 text-gray-500">{new Date(t.updated_at).toLocaleDateString()}</td>
                <td className="py-4">
                  <Button variant="outline" size="sm" onClick={() => handleSelectTicket(t)}>
                    View / Reply
                  </Button>
                </td>
              </motion.tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No support tickets found. You are all caught up!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
