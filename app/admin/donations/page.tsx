"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface PendingDonation {
  id: string;
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
}

export default function AdminDonationsPage() {
  const router = useRouter();
  const [donations, setDonations] = useState<PendingDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingDonations();
  }, []);

  const fetchPendingDonations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/pending-donations");

      if (!response.ok) {
        throw new Error("Failed to fetch pending donations");
      }

      const data = await response.json();
      setDonations(data.donations || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processDonation = async (commitmentId: string) => {
    setProcessing(prev => [...prev, commitmentId]);

    try {
      const donation = donations.find(d => d.id === commitmentId);
      if (!donation) return;

      const response = await fetch("/api/process-donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commitmentId: donation.id,
          userId: donation.user_id,
          charity: donation.charity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process donation");
      }

      // Remove from list
      setDonations(prev => prev.filter(d => d.id !== commitmentId));
    } catch (err: any) {
      alert(`Error processing donation: ${err.message}`);
    } finally {
      setProcessing(prev => prev.filter(id => id !== commitmentId));
    }
  };

  const processAllDonations = async () => {
    if (!confirm(`Are you sure you want to process all ${donations.length} pending donations?`)) {
      return;
    }

    for (const donation of donations) {
      await processDonation(donation.id);
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin: Pending Charity Donations</h1>
          <p className="mt-2 text-gray-600">
            Review and process failed commitments that require charity donations
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {donations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No pending donations to process</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {donations.length} pending donation{donations.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={processAllDonations}
                disabled={processing.length > 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                Process All Donations
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Charity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donation Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform Fee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Failed Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {donations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{donation.user_email}</div>
                        <div className="text-sm text-gray-500">{donation.user_id.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{donation.goal}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{donation.charity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${donation.charity_donation_amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          (of ${donation.stake.toFixed(2)} stake)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${donation.platform_fee_amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(donation.failed_at || donation.due_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => processDonation(donation.id)}
                          disabled={processing.includes(donation.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {processing.includes(donation.id) ? "Processing..." : "Process"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
