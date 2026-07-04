export default function Dashboard() {
  return (
    <div className="space-y-6 w-full">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400 text-sm">
          System overview & real-time status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">

        <Card title="Users" value="124" />
        <Card title="Gateways" value="8" />
        <Card title="Active Nodes" value="32" />
        <Card title="Alerts" value="3" />

      </div>

      {/* Chart */}
      <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 h-64">
        Live analytics chart (coming next)
      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}