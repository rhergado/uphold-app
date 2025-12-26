"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  SUPER_ADMIN_EMAIL,
  ADDITIONAL_ADMIN_EMAILS,
  isAdminEmail,
  isSuperAdmin,
  addAdminEmail,
  removeAdminEmail,
  getAllAdminEmails,
} from "@/lib/admin-config";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load admin emails on mount
  useEffect(() => {
    setAdminEmails(getAllAdminEmails());
  }, []);

  // Redirect non-admin users or non-super-admin
  useEffect(() => {
    if (!authLoading && (!user || !user.is_admin || !isSuperAdmin(user.email))) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleAddEmail = () => {
    setMessage(null);

    if (!newEmail || !newEmail.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    if (isAdminEmail(newEmail)) {
      setMessage({ type: "error", text: "This email already has admin access" });
      return;
    }

    if (addAdminEmail(newEmail)) {
      setAdminEmails(getAllAdminEmails());
      setNewEmail("");
      setMessage({
        type: "success",
        text: `Added ${newEmail} as admin. They will have access after logging in with is_admin = true in database.`
      });
    } else {
      setMessage({ type: "error", text: "Failed to add admin email" });
    }
  };

  const handleRemoveEmail = (email: string) => {
    setMessage(null);

    if (email === SUPER_ADMIN_EMAIL) {
      setMessage({ type: "error", text: "Cannot remove super admin" });
      return;
    }

    if (removeAdminEmail(email)) {
      setAdminEmails(getAllAdminEmails());
      setMessage({ type: "success", text: `Removed ${email} from admin access` });
    } else {
      setMessage({ type: "error", text: "Failed to remove admin email" });
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not super admin (will redirect)
  if (!user || !user.is_admin || !isSuperAdmin(user.email)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/donations">
              <Button variant="outline" size="sm">
                ← Back to Donations
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage admin access and system configuration
          </p>
        </div>

        {/* Super Admin Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            👑 Super Admin
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            You are the super admin with full access to all admin features.
          </p>
          <div className="px-4 py-3 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-sm font-mono text-blue-900">{SUPER_ADMIN_EMAIL}</p>
          </div>
        </div>

        {/* Admin Emails Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Access List</h2>
          <p className="text-sm text-gray-600 mb-6">
            Users with these email addresses AND <code className="bg-gray-100 px-2 py-1 rounded">is_admin = true</code> in the database will have admin access.
          </p>

          {/* Current Admin Emails */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Current Admins ({adminEmails.length})
            </label>
            <div className="space-y-2">
              {adminEmails.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {email === SUPER_ADMIN_EMAIL && (
                      <span className="text-lg">👑</span>
                    )}
                    <span className="text-sm font-mono text-gray-900">{email}</span>
                    {email === SUPER_ADMIN_EMAIL && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Super Admin
                      </span>
                    )}
                  </div>
                  {email !== SUPER_ADMIN_EMAIL && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Admin */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add New Admin Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddEmail();
                  }
                }}
                placeholder="admin@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                onClick={handleAddEmail}
                disabled={!newEmail}
              >
                Add Admin
              </Button>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            ⚠️ Important: Database Setup Required
          </h3>
          <p className="text-sm text-yellow-800 mb-3">
            After adding an admin email, you must also grant them admin access in the database:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800 mb-4">
            <li>Go to Supabase Dashboard → SQL Editor</li>
            <li>Run this SQL command:
              <pre className="mt-2 bg-yellow-100 p-3 rounded text-xs overflow-x-auto">
{`UPDATE users
SET is_admin = TRUE
WHERE email = 'their-email@example.com';`}
              </pre>
            </li>
            <li>The user must log out and log back in</li>
            <li>They will now see the Admin button in navigation</li>
          </ol>
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Admin emails are stored in <code className="bg-yellow-100 px-2 py-1 rounded">lib/admin-config.ts</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
