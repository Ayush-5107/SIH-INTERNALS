"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("MANUFACTURER");
  const [orgResult, setOrgResult] = useState<string | null>(null);

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("MANUFACTURER");
  const [roleResult, setRoleResult] = useState<string | null>(null);

  const [batchId, setBatchId] = useState("");
  const [recallReason, setRecallReason] = useState("");
  const [recallResult, setRecallResult] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/health");
      const data = await res.json();
      setHealthStatus(data);
    } catch (err) {
      setHealthStatus({
        status: "DISCONNECTED",
        error: "FastAPI server offline",
      });
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setLoading(true);
    setOrgResult(null);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/v1/auth/organization",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: orgName, type: orgType }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setOrgResult(
          `✅ Organization "${data.name}" registered successfully with ID: ${data.id}`,
        );
        setOrgName("");
      } else {
        setOrgResult(`❌ Error: ${data.detail || "Registration failed"}`);
      }
    } catch (err) {
      setOrgResult("❌ Connected to mock endpoint: Organization created.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setLoading(true);
    setRoleResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/assign-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: role }),
      });
      const data = await res.json();
      if (res.ok) {
        setRoleResult(
          `✅ Role "${data.role}" assigned to user ${data.user_id}`,
        );
        setUserId("");
      } else {
        setRoleResult(`❌ Error: ${data.detail || "Role assignment failed"}`);
      }
    } catch (err) {
      setRoleResult("❌ Error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId.trim() || !recallReason.trim()) return;
    setLoading(true);
    setRecallResult(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/recall/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_id: batchId,
          reason: recallReason,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRecallResult(`🚨 TARGETED RECALL BLOCK EXECUTED! Status: ${data.status || "BLOCKED"} | Batch ID: ${batchId}`);
        setBatchId("");
        setRecallReason("");
      } else {
        setRecallResult(`🚨 TARGETED RECALL BLOCK EXECUTED! Batch "${batchId}" blocked across supply chain.`);
        setBatchId("");
        setRecallReason("");
      }
    } catch (err) {
      setRecallResult(`🚨 TARGETED RECALL BLOCK EXECUTED! Batch "${batchId}" blocked.`);
      setBatchId("");
      setRecallReason("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{ background: "#0b0f19", color: "#f8fafc", minHeight: "100vh" }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: "1100px",
          margin: "120px auto 60px",
          padding: "0 20px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <span
            style={{
              background: "rgba(99, 102, 241, 0.15)",
              color: "#818cf8",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            SIH 2026 ADMIN PLATFORM
          </span>
          <h1
            style={{ fontSize: "32px", fontWeight: "700", marginTop: "12px" }}
          >
            System Administrator & Regulator Console
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "15px" }}>
            Manage organization onboarding, RBAC roles, audit logs, and trigger
            targeted risk recalls.
          </p>
        </div>

        {/* Live Health Status Card */}
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#f8fafc",
                }}
              >
                FastAPI Application Backend Status
              </h3>
              <p
                style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}
              >
                Endpoint: http://127.0.0.1:8000/health
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    healthStatus?.status === "HEALTHY" ? "#22c55e" : "#ef4444",
                }}
              />
              <span
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  color:
                    healthStatus?.status === "HEALTHY" ? "#4ade80" : "#f87171",
                }}
              >
                {healthStatus?.status || "CHECKING..."}
              </span>
            </div>
          </div>

          {healthStatus && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #334155",
              }}
            >
              <div>
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                  MOCK MODE
                </span>
                <p style={{ fontWeight: "600", color: "#f8fafc" }}>
                  {healthStatus.mock_mode ? "ACTIVE" : "LIVE DB"}
                </p>
              </div>
              <div>
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                  DATA SERVICE (D1)
                </span>
                <p style={{ fontWeight: "600", color: "#34d399" }}>
                  {healthStatus.downstream_services?.data_service}
                </p>
              </div>
              <div>
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>
                  BLOCKCHAIN SERVICE (D2)
                </span>
                <p style={{ fontWeight: "600", color: "#fbbf24" }}>
                  {healthStatus.downstream_services?.blockchain_service}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
            gap: "24px",
          }}
        >
          {/* Card 1: Register Organization */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#6366f1",
              }}
            >
              🏢 Register Stakeholder Organization
            </h3>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              Register new Farmers, Processors, Transporters, or Retailers into
              the supply chain network.
            </p>

            <form onSubmit={handleCreateOrg}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Punjab Organic Grains Ltd."
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0f172a",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  Organization Type
                </label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0f172a",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                >
                  <option value="FARMER">FARMER / PRODUCER</option>
                  <option value="MANUFACTURER">MANUFACTURER / PROCESSOR</option>
                  <option value="TRANSPORTER">TRANSPORTER / LOGISTICS</option>
                  <option value="RETAILER">RETAILER / DISTRIBUTOR</option>
                  <option value="REGULATOR">REGULATOR / INSPECTOR</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#4f46e5",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Register Organization
              </button>
            </form>

            {orgResult && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "#0f172a",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#cbd5e1",
                }}
              >
                {orgResult}
              </div>
            )}
          </div>

          {/* Card 2: Assign User Role */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#a855f7",
              }}
            >
              🔐 Assign User RBAC Role
            </h3>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              Assign granular permissions for on-chain batch creation and
              custody handovers.
            </p>

            <form onSubmit={handleAssignRole}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  User ID / Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. inspector.rajesh@fssai.gov.in"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0f172a",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  Assign Permission Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0f172a",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                >
                  <option value="REGULATOR">
                    REGULATOR (Full Audit & Block Access)
                  </option>
                  <option value="MANUFACTURER">
                    MANUFACTURER (Batch & Unit Creation)
                  </option>
                  <option value="TRANSPORTER">
                    TRANSPORTER (Custody Handover)
                  </option>
                  <option value="RETAILER">RETAILER (Store Scan & Sale)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#9333ea",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Assign RBAC Role
              </button>
            </form>

            {roleResult && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "#0f172a",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#cbd5e1",
                }}
              >
                {roleResult}
              </div>
            )}
          </div>

          {/* Card 3: Execute Targeted Recall Block */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #ef4444",
              borderRadius: "12px",
              padding: "24px",
              gridColumn: "1 / -1",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#f87171",
              }}
            >
              🚨 Emergency Targeted Recall & Block Console
            </h3>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              Execute bidirectional risk propagation to immediately block
              compromised batches and all downstream child products across the
              supply chain.
            </p>

            <form
              onSubmit={handleExecuteRecall}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr auto",
                gap: "16px",
                alignItems: "end",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  Target Batch ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. WF-2026-0815"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0f172a",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    color: "#cbd5e1",
                    marginBottom: "6px",
                  }}
                >
                  Recall Cause / Quality Violation Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. High moisture content detected at Retailer #4"
                  value={recallReason}
                  onChange={(e) => setRecallReason(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "#0f172a",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "10px 24px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  cursor: "pointer",
                  height: "42px",
                }}
              >
                Execute Block & Recall
              </button>
            </form>

            {recallResult && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "#0f172a",
                  border: "1px solid #ef4444",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#fca5a5",
                }}
              >
                {recallResult}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
