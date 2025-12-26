"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCharityById } from "@/lib/charities";

interface PendingDonation {
  id: string;
  payment_id: string;
  user_id: string;
  user_email: string;
  goal: string;
  stake: number;
  charity: string;
  charity_donation_amount: number;
  platform_fee_amount: number;
  status: string;
  due_date: string;
  failed_at: string;
  donation_processed_at: string | null;
  donation_batch_id: string | null;
  donation_receipt_url: string | null;
}

interface CharityGroup {
  charity: string;
  donations: PendingDonation[];
  totalAmount: number;
  count: number;
}

export default function AdminDonationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [donations, setDonations] = useState<PendingDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [batchId, setBatchId] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [viewMode, setViewMode] = useState<"pending" | "processed">("pending");

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin)) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.is_admin) {
      fetchPendingDonations();
    }
  }, [user, viewMode]);

  const fetchPendingDonations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/pending-donations", {
        headers: {
          "x-user-id": user?.id || "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pending donations");
      }

      const data = await response.json();

      // Filter based on view mode
      let filteredDonations = data.donations || [];
      if (viewMode === "pending") {
        filteredDonations = filteredDonations.filter((d: PendingDonation) => !d.donation_processed_at);
      } else {
        filteredDonations = filteredDonations.filter((d: PendingDonation) => d.donation_processed_at);
      }

      setDonations(filteredDonations);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group donations by charity
  const charityGroups: CharityGroup[] = donations.reduce((groups, donation) => {
    const existing = groups.find(g => g.charity === donation.charity);
    if (existing) {
      existing.donations.push(donation);
      existing.totalAmount += donation.charity_donation_amount;
      existing.count++;
    } else {
      groups.push({
        charity: donation.charity,
        donations: [donation],
        totalAmount: donation.charity_donation_amount,
        count: 1
      });
    }
    return groups;
  }, [] as CharityGroup[]);

  // Calculate totals
  const totalDonationAmount = donations.reduce((sum, d) => sum + d.charity_donation_amount, 0);
  const totalPlatformFee = donations.reduce((sum, d) => sum + d.platform_fee_amount, 0);

  const toggleSelection = (paymentId: string) => {
    setSelectedPaymentIds(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPaymentIds.length === donations.length) {
      setSelectedPaymentIds([]);
    } else {
      setSelectedPaymentIds(donations.map(d => d.payment_id));
    }
  };

  const selectCharity = (charity: string) => {
    const group = charityGroups.find(g => g.charity === charity);
    if (!group) return;

    const charityPaymentIds = group.donations.map(d => d.payment_id);
    const allSelected = charityPaymentIds.every(id => selectedPaymentIds.includes(id));

    if (allSelected) {
      setSelectedPaymentIds(prev => prev.filter(id => !charityPaymentIds.includes(id)));
    } else {
      setSelectedPaymentIds(prev => [...new Set([...prev, ...charityPaymentIds])]);
    }
  };

  const handleMarkAsProcessed = async () => {
    if (selectedPaymentIds.length === 0) {
      alert("Please select at least one donation");
      return;
    }

    if (!batchId || !receiptUrl) {
      alert("Please enter both Batch ID and Receipt URL");
      return;
    }

    try {
      setProcessing(true);

      // Mark donations as processed
      const markResponse = await fetch("/api/admin/mark-donations-processed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIds: selectedPaymentIds,
          adminEmail: user?.email,
          batchId,
          receiptUrl,
          notes
        }),
      });

      if (!markResponse.ok) {
        const errorData = await markResponse.json();
        throw new Error(errorData.error || "Failed to mark donations as processed");
      }

      // Send receipt emails
      const emailResponse = await fetch("/api/admin/send-donation-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIds: selectedPaymentIds,
          adminEmail: user?.email
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error("Failed to send emails:", errorData);
        alert("Donations marked as processed, but failed to send some emails. Check console for details.");
      } else {
        const emailData = await emailResponse.json();
        alert(`Success! Marked ${selectedPaymentIds.length} donation(s) as processed and sent ${emailData.successCount} receipt email(s).`);
      }

      // Reset and refresh
      setShowBatchModal(false);
      setSelectedPaymentIds([]);
      setBatchId("");
      setReceiptUrl("");
      setNotes("");
      fetchPendingDonations();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["User Email", "Goal", "Charity", "Donation Amount", "Platform Fee", "Original Stake", "Failed Date"];
    const rows = donations.map(d => [
      d.user_email,
      d.goal,
      d.charity,
      d.charity_donation_amount.toFixed(2),
      d.platform_fee_amount.toFixed(2),
      d.stake.toFixed(2),
      new Date(d.failed_at || d.due_date).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${viewMode}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Show loading while checking auth
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not admin (will redirect)
  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Admin: Charity Donations</h1>
            <Link href="/admin/settings">
              <Button variant="outline" size="sm">
                ⚙️ Settings
              </Button>
            </Link>
          </div>
          <p className="mt-2 text-gray-600">
            Review and manually process charity donations from failed commitments
          </p>

          {/* View Mode Toggle */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setViewMode("pending")}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Pending ({donations.filter(d => !d.donation_processed_at).length})
            </button>
            <button
              onClick={() => setViewMode("processed")}
              className={`px-4 py-2 rounded-lg font-medium ${
                viewMode === "processed"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              Processed ({donations.filter(d => d.donation_processed_at).length})
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Totals Summary */}
        {donations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Donations</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">${totalDonationAmount.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{donations.length} commitment(s)</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Platform Fees</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">${totalPlatformFee.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">25% of total stakes</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Charities</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{charityGroups.length}</p>
              <p className="text-sm text-gray-500 mt-1">Different organizations</p>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        {viewMode === "pending" && donations.length > 0 && (
          <div className="mb-4 flex justify-between items-center bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPaymentIds.length === donations.length && donations.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  Select All ({selectedPaymentIds.length} selected)
                </span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Export CSV
              </button>
              <button
                onClick={() => setShowBatchModal(true)}
                disabled={selectedPaymentIds.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Mark as Processed ({selectedPaymentIds.length})
              </button>
            </div>
          </div>
        )}

        {donations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">
              No {viewMode} donations {viewMode === "pending" ? "to process" : "found"}
            </p>
          </div>
        ) : (
          <>
            {/* Grouped by Charity */}
            <div className="space-y-6">
              {charityGroups.map((group) => (
                <div key={group.charity} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{group.charity}</h2>
                      <p className="text-sm text-gray-600">
                        {group.count} donation(s) • Total: ${group.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-3 items-center">
                      {viewMode === "pending" && (
                        <>
                          <a
                            href={getCharityById(group.donations[0].charity)?.donationUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            💚 Donate Now →
                          </a>
                          <button
                            onClick={() => selectCharity(group.charity)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {group.donations.every(d => selectedPaymentIds.includes(d.payment_id))
                              ? "Deselect All"
                              : "Select All"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {viewMode === "pending" && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Select
                          </th>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Goal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Failed Date
                        </th>
                        {viewMode === "processed" && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Batch ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Receipt
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.donations.map((donation) => (
                        <tr key={donation.id}>
                          {viewMode === "pending" && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedPaymentIds.includes(donation.payment_id)}
                                onChange={() => toggleSelection(donation.payment_id)}
                                className="w-4 h-4"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{donation.user_email}</div>
                            <div className="text-sm text-gray-500">{donation.user_id.slice(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">{donation.goal}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              ${donation.charity_donation_amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              of ${donation.stake.toFixed(2)} stake
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(donation.failed_at || donation.due_date).toLocaleDateString()}
                            </div>
                          </td>
                          {viewMode === "processed" && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-mono">
                                  {donation.donation_batch_id || "N/A"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {donation.donation_receipt_url ? (
                                  <a
                                    href={donation.donation_receipt_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    View Receipt
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-sm">No receipt</span>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Batch Processing Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Mark Donations as Processed
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              You're about to mark {selectedPaymentIds.length} donation(s) as manually processed.
              Receipt emails will be sent to all affected users automatically.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch ID * (e.g., "2025-12-monthly" or "Red-Cross-Dec-2025")
                </label>
                <input
                  type="text"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="2025-12-monthly"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt URL * (Link to charity donation receipt)
                </label>
                <input
                  type="url"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about this donation batch..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowBatchModal(false);
                  setBatchId("");
                  setReceiptUrl("");
                  setNotes("");
                }}
                disabled={processing}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsProcessed}
                disabled={processing || !batchId || !receiptUrl}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {processing ? "Processing..." : "Mark as Processed & Send Receipts"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
