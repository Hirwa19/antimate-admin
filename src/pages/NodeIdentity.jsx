import { useState } from "react";
import api from "../api/axios";

export default function NodeIdentity() {

  const [loading, setLoading] = useState(false);
  const [node, setNode] = useState(null);

  // generate random ID
  const generateNodeId = () => {
    return "NODE-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const generateSecretKey = () => {
    return "SK-" + crypto.randomUUID();
  };

  const handleGenerate = async () => {

    setLoading(true);

    const newNode = {
      nodeId: generateNodeId(),
      secretKey: generateSecretKey(),
      status: "inactive",
      createdAt: new Date()
    };

    try {

      // optional: save to backend
      // await api.post("/devices/create-node", newNode);

      setNode(newNode);

    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };


  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Node Identity Generator
        </h1>

        <p className="text-slate-400 text-sm">
          Generate secure identities for IoT nodes
        </p>
      </div>


      {/* Button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="
          px-6 py-3
          bg-blue-500
          hover:bg-blue-600
          rounded-lg
          font-semibold
        "
      >
        {loading ? "Generating..." : "Generate Node"}
      </button>


      {/* Result */}
      {node && (
        <div className="
          bg-white/5
          border
          border-white/10
          p-6
          rounded-xl
          space-y-3
        ">

          <div>
            <p className="text-slate-400 text-sm">Node ID</p>
            <p className="font-bold">{node.nodeId}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm">Secret Key</p>
            <p className="font-bold break-all">{node.secretKey}</p>
          </div>

          <div>
            <p className="text-slate-400 text-sm">Status</p>
            <span className="text-yellow-400">
              {node.status}
            </span>
          </div>

        </div>
      )}

    </div>
  );
}