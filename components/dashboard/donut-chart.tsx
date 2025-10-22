import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DonutChartProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  colors: string[];
}

export function DonutChart({ title, data, colors }: DonutChartProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="w-72 h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="white"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[index % colors.length]}
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Enhanced Legend */}
        <div className="mt-6 space-y-3">
          {data.map((item, index) => (
            <div key={item.name} className="group flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
              <div className="flex items-center space-x-4">
                <div 
                  className="w-5 h-5 rounded-full shadow-md group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {item.value.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
