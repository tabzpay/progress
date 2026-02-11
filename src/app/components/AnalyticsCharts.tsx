import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { motion } from 'motion/react';

interface ChartProps {
    data: any[];
    currency: string;
}

export const LendingTrendChart = ({ data, currency }: ChartProps) => {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                    />
                    <YAxis
                        hide
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                        formatter={(value: number) => [`${currency} ${value.toLocaleString()}`, "Lent"]}
                    />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366F1"
                        strokeWidth={4}
                        dot={{ r: 4, fill: '#6366F1', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

const COLORS = ['#10B981', '#6366F1', '#F43F5E', '#F59E0B'];

export const StatusDistributionChart = ({ data }: { data: any[] }) => {
    return (
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const BorrowerConcentrationChart = ({ data, currency }: ChartProps) => {
    return (
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${currency} ${value.toLocaleString()}`, "Total"]}
                    />
                    <Bar
                        dataKey="amount"
                        fill="#6366F1"
                        radius={[0, 8, 8, 0]}
                        barSize={12}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const CashFlowForecastChart = ({ data, currency }: ChartProps) => {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis hide />
                    <Tooltip
                        cursor={{ fill: '#F8FAFC' }}
                        contentStyle={{
                            borderRadius: '16px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        iconType="circle"
                        formatter={(value) => <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{value}</span>}
                    />
                    <Bar dataKey="inflow" fill="#10B981" radius={[4, 4, 0, 0]} name="Inflow" />
                    <Bar dataKey="outflow" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Outflow" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
