'use client'

import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'

interface AnalyticsChartsProps {
  statusData: Array<{ status: string; count: number }>
  platformData: Array<{ name: string; value: number }>
  approvalData: Array<{ name: string; value: number }>
  timelineData: Array<{ date: string; created: number; approved: number; published: number }>
}

const COLORS = ['#2563eb', '#059669', '#f59e0b', '#dc2626', '#8b5cf6', '#6366f1']

export default function AnalyticsCharts({
  statusData,
  platformData,
  approvalData,
  timelineData
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Messages Over Time */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Message Activity (30 days)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#2563eb" name="Created" />
              <Line type="monotone" dataKey="approved" stroke="#059669" name="Approved" />
              <Line type="monotone" dataKey="published" stroke="#8b5cf6" name="Published" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Platform Distribution</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Message Status */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Message Status</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Approval Metrics */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Approval Outcomes</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={approvalData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {approvalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.name === 'APPROVED' ? '#059669' :
                    entry.name === 'REJECTED' ? '#dc2626' :
                    '#f59e0b'
                  } />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}