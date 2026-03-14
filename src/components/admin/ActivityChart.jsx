import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ActivityChart({ data, isLoading }) {
  if (isLoading && (!data || data.length === 0)) {
    return <div style={{ height: '400px' }}>Loading...</div>;
  }

  return (
    <div className="chart-wrapper" style={{ width: '100%', height: '400px', background: '#fff', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ marginBottom: '20px' }}>Platform Activity</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="orders" stroke="#3498db" strokeWidth={3} name="Orders" />
          <Line type="monotone" dataKey="inquiries" stroke="#2ecc71" strokeWidth={3} name="Inquiries" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}