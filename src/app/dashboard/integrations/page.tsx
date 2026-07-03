"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Link2,
  Wifi,
  WifiOff,
  AlertTriangle,
  Upload,
  FileSpreadsheet,
  Settings2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

interface Integration {
  id: string;
  name: string;
  provider: string;
  status: "connected" | "disconnected" | "error";
  lastSync: string | null;
  icon: string;
}

const initialIntegrations: Integration[] = [
  {
    id: "int-001",
    name: "Google Ads",
    provider: "google",
    status: "connected",
    lastSync: "2026-07-03T08:00:00Z",
    icon: "G",
  },
  {
    id: "int-002",
    name: "Meta Ads",
    provider: "meta",
    status: "connected",
    lastSync: "2026-07-03T07:45:00Z",
    icon: "M",
  },
  {
    id: "int-003",
    name: "TikTok Ads",
    provider: "tiktok",
    status: "disconnected",
    lastSync: null,
    icon: "T",
  },
  {
    id: "int-004",
    name: "Taboola",
    provider: "taboola",
    status: "error",
    lastSync: "2026-07-02T14:00:00Z",
    icon: "Tb",
  },
  {
    id: "int-005",
    name: "HubSpot",
    provider: "hubspot",
    status: "disconnected",
    lastSync: null,
    icon: "H",
  },
  {
    id: "int-006",
    name: "Mailchimp",
    provider: "mailchimp",
    status: "disconnected",
    lastSync: null,
    icon: "Mc",
  },
];

const providerColors: Record<string, string> = {
  google: "bg-blue-500/20 text-blue-400",
  meta: "bg-indigo-500/20 text-indigo-400",
  tiktok: "bg-pink-500/20 text-pink-400",
  taboola: "bg-orange-500/20 text-orange-400",
  hubspot: "bg-orange-400/20 text-orange-300",
  mailchimp: "bg-yellow-500/20 text-yellow-400",
};

const statusConfig = {
  connected: {
    label: "Connected",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: Wifi,
  },
  disconnected: {
    label: "Disconnected",
    color: "text-[#9CA3AF]",
    bg: "bg-white/5",
    icon: WifiOff,
  },
  error: {
    label: "Error",
    color: "text-red-400",
    bg: "bg-red-500/10",
    icon: AlertTriangle,
  },
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] =
    useState<Integration[]>(initialIntegrations);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleConnect(integration: Integration) {
    setSelectedIntegration(integration);
    setApiKey("");
    setDialogOpen(true);
  }

  function handleSaveConnection() {
    if (!selectedIntegration) return;
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === selectedIntegration.id
          ? { ...i, status: "connected" as const, lastSync: new Date().toISOString() }
          : i
      )
    );
    setDialogOpen(false);
    setSelectedIntegration(null);
  }

  function handleDisconnect(id: string) {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: "disconnected" as const, lastSync: null } : i
      )
    );
  }

  function handleCsvUpload() {
    if (!csvFile) return;
    setTimeout(() => {
      setCsvFile(null);
      setCsvDialogOpen(false);
    }, 1500);
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Connect your ad platforms and tools to consolidate all your data.
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {integrations.map((integration) => {
          const StatusIcon = statusConfig[integration.status].icon;
          return (
            <motion.div
              key={integration.id}
              variants={fadeInUp}
              className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold",
                      providerColors[integration.provider] ||
                        "bg-white/5 text-white"
                    )}
                  >
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {integration.name}
                    </h3>
                    <span
                      className={cn(
                        "text-xs font-medium flex items-center gap-1",
                        statusConfig[integration.status].color
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[integration.status].label}
                    </span>
                  </div>
                </div>
                {integration.status === "connected" && (
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="text-[#6B7280] hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {integration.lastSync && (
                <p className="text-xs text-[#6B7280] mb-4">
                  Last synced:{" "}
                  {new Date(integration.lastSync).toLocaleString()}
                </p>
              )}

              <button
                onClick={() => handleConnect(integration)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                  integration.status === "connected"
                    ? "border border-[#1F2937] text-[#9CA3AF] hover:text-white hover:bg-[#1F2937]"
                    : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                )}
              >
                {integration.status === "connected" ? (
                  <>
                    <Settings2 className="h-4 w-4" />
                    Configure
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4" />
                    Connect
                  </>
                )}
              </button>
            </motion.div>
          );
        })}

        <motion.div
          variants={fadeInUp}
          className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-all"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">CSV Import</h3>
              <span className="text-xs text-[#9CA3AF]">
                Bulk import campaign data
              </span>
            </div>
          </div>

          <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
            <DialogTrigger>
              <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#7C3AED] text-white text-sm font-medium hover:bg-[#6D28D9] transition-all">
                <Upload className="h-4 w-4" />
                Import CSV
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import CSV File</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) setCsvFile(file);
                  }}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                    dragging
                      ? "border-[#7C3AED] bg-[#7C3AED]/5"
                      : "border-[#1F2937] hover:border-[#7C3AED]/50"
                  )}
                  onClick={() =>
                    document.getElementById("csv-input")?.click()
                  }
                >
                  <Upload
                    className={cn(
                      "h-8 w-8 mx-auto mb-3 transition-colors",
                      dragging ? "text-[#7C3AED]" : "text-[#6B7280]"
                    )}
                  />
                  <p className="text-sm text-white font-medium mb-1">
                    {csvFile ? csvFile.name : "Drop CSV file here or click to browse"}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    Supported format: .csv (max 10MB)
                  </p>
                  <input
                    id="csv-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCsvFile(file);
                    }}
                  />
                </div>
                {csvFile && (
                  <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                      <span className="text-sm text-white">
                        {csvFile.name}
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        ({(csvFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() => setCsvFile(null)}
                      className="text-[#6B7280] hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setCsvDialogOpen(false);
                      setCsvFile(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleCsvUpload}
                    disabled={!csvFile}
                  >
                    {csvFile ? "Upload & Import" : "Select a file"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedIntegration?.status === "connected"
                ? "Configure"
                : "Connect"}{" "}
              {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Connection Name
              </label>
              <Input
                placeholder={`My ${selectedIntegration?.name}`}
                defaultValue={selectedIntegration?.name}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                API Key
              </label>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1.5">
                Account ID
              </label>
              <Input placeholder="Optional account identifier" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#1F2937] text-sm text-[#9CA3AF] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <Button onClick={handleSaveConnection}>
                {selectedIntegration?.status === "connected"
                  ? "Save Changes"
                  : "Connect"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
