import React, { useState } from "react";
import axios from "axios";

const API =
  import.meta.env.VITE_API_URL ||
  "https://brooder-backend.onrender.com";

export default function GenerateDevice() {
  const token = localStorage.getItem("token");

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(true);

  // =========================
  // GENERATE DEVICE
  // =========================

  const generateDevice = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/api/devices/register`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("REGISTER RESPONSE:", res.data);

      setDevice(res.data.device);
      setShowKey(true);
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message ||
          "Generation failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DOWNLOAD LABEL
  // =========================

  const downloadLabel = async () => {
    if (!device) return;

    try {
      const res = await axios.get(
        `${API}/api/devices/label/${device.deviceId}`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const file = new Blob([res.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(file);

      const link = document.createElement("a");

      link.href = url;
      link.download = `${device.deviceId}-label.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);

      alert("Failed to download PDF");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold mb-8">
          Generate Device Identity
        </h1>

        <div className="bg-slate-900 rounded-xl border border-slate-700 p-6">

          <button
            onClick={generateDevice}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 p-3 font-semibold"
          >
            {loading ? "Generating..." : "Generate Device"}
          </button>

          {device && (
            <div className="mt-8 space-y-5">

              <div>
                <p className="text-gray-400 mb-2">
                  Device ID
                </p>

                <div className="bg-black rounded p-3">
                  {device.deviceId}
                </div>
              </div>

              <div>
                <p className="text-gray-400 mb-2">
                  Default Key
                </p>

                <div className="bg-black rounded p-3 flex justify-between items-center">

                  <span>
                    {showKey
                      ? device.secretKey
                      : "••••••••••••"}
                  </span>

                  <button
                    onClick={() =>
                      setShowKey(!showKey)
                    }
                    className="text-blue-400"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>

                </div>
              </div>

              <div>
                <p className="text-gray-400 mb-2">
                  QR Token
                </p>

                <div className="bg-black rounded p-3 break-all text-sm">
                  {device.qrToken}
                </div>
              </div>

              <button
                onClick={downloadLabel}
                className="w-full rounded-lg bg-green-600 hover:bg-green-700 p-3 font-semibold"
              >
                Download PDF Label
              </button>

              <div className="rounded-lg bg-yellow-900/20 border border-yellow-600 p-4 text-yellow-300 text-sm">
                <strong>Important:</strong> Save the Default Key before closing this page.
                Users will never be able to retrieve it again after device provisioning.
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}