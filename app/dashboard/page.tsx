import { PositionsTable } from '@/components/PositionsTable';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Portfolio</h1>
        <p className="text-gray-400 mt-1">View and manage your positions</p>
      </div>

      {/* Positions Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Your Positions</h2>
        <PositionsTable />
      </div>
    </div>
  );
}
