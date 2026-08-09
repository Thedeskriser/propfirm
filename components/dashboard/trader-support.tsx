"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVisibilityPoll } from "@/hooks/use-visibility-poll";
import { api } from "@/lib/api";
import { Ticket, TicketMessage } from "@/types/api";

export function TraderSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New ticket state
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newMessage, setNewMessage] = useState("");

  useVisibilityPoll(async () => {
    if (selectedTicket || isCreating) return;
    try {
      const data = await api.user.tickets.list();
      setTickets(data);
    } catch (err) {
      console.error(err);
    }
  }, 10000, true);

  useVisibilityPoll(async () => {
    if (!selectedTicket) return;
    try {
      const data = await api.user.tickets.get(selectedTicket.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  }, 5000, !!selectedTicket);

  const handleSelectTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    try {
      const data = await api.user.tickets.get(ticket.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    setLoading(true);
    try {
      await api.user.tickets.create({
        subject: newSubject,
        category: newCategory,
        message: newMessage,
      });
      setIsCreating(false);
      setNewSubject("");
      setNewMessage("");
      const data = await api.user.tickets.list();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setLoading(true);
    try {
      await api.user.tickets.reply(selectedTicket.id, replyText);
      setReplyText("");
      const data = await api.user.tickets.get(selectedTicket.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  };

  if (isCreating) {
    return (
      <Card className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setIsCreating(false)}>
            ← Back
          </Button>
          <h2 className="text-xl font-bold">Open a New Ticket</h2>
        </div>
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              required
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="w-full rounded-md border p-2 dark:bg-gray-900 dark:border-gray-700"
              placeholder="E.g., Issue with my account"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full rounded-md border p-2 dark:bg-gray-900 dark:border-gray-700"
            >
              <option value="general">General Support</option>
              <option value="billing">Billing & Payouts</option>
              <option value="technical">Technical Issue</option>
              <option value="dispute">Trade Dispute</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              required
              rows={5}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full rounded-md border p-2 dark:bg-gray-900 dark:border-gray-700"
              placeholder="Describe your issue in detail..."
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Submitting..." : "Submit Ticket"}
          </Button>
        </form>
      </Card>
    );
  }

  if (selectedTicket) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setSelectedTicket(null)}>
          ← Back to Tickets
        </Button>

        <Card className="p-6">
          <div className="border-b dark:border-gray-800 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                <div className="text-sm text-gray-500 mt-1 flex gap-4">
                  <span className="capitalize text-gray-400">Category: {selectedTicket.category}</span>
                  <span className="text-gray-400">{new Date(selectedTicket.created_at).toLocaleString()}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[selectedTicket.status]}`}>
                {selectedTicket.status}
              </span>
            </div>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4 p-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${msg.sender_type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <div className="text-xs opacity-70 mb-1">{msg.sender_type === 'user' ? 'You' : 'Support Agent'} - {new Date(msg.created_at).toLocaleString()}</div>
                  <div className="whitespace-pre-wrap">{msg.message}</div>
                </div>
              </div>
            ))}
          </div>

          {selectedTicket.status !== 'closed' ? (
            <div className="border-t dark:border-gray-800 pt-4 flex gap-3">
              <textarea
                className="flex-1 rounded-md border p-3 dark:bg-gray-900 dark:border-gray-700 min-h-[80px]"
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <Button onClick={handleSendReply} disabled={!replyText.trim() || loading} className="self-end">
                Reply
              </Button>
            </div>
          ) : (
            <div className="border-t dark:border-gray-800 pt-4 text-center text-gray-500">
              This ticket has been closed. If you need further assistance, please open a new ticket.
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">My Support Tickets</h2>
        <Button onClick={() => setIsCreating(true)}>Open New Ticket</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-800 text-gray-500">
            <tr>
              <th className="pb-3 font-medium">Ticket</th>
              <th className="pb-3 font-medium">Category</th>
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
                </td>
                <td className="py-4 capitalize text-gray-500">{t.category}</td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[t.status]}`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-4 text-gray-500">{new Date(t.updated_at).toLocaleDateString()}</td>
                <td className="py-4">
                  <Button variant="outline" size="sm" onClick={() => handleSelectTicket(t)}>
                    View
                  </Button>
                </td>
              </motion.tr>
            ))}
            {tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  You have no open support tickets.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
