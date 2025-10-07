import { useState } from "react";
import { Card } from "../UI/card";
import { Button } from "../UI/button";
import { Input } from "../UI/input";
import { Badge } from "../UI/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  FileText,
  BarChart3,
  RefreshCcw,
} from "lucide-react";

const regionData = [
  {
    name: "Toshkent",
    value: 12800000,
    percentage: 12.86,
    region: "Toshkent viloyati",
  },
  {
    name: "Farg'ona",
    value: 11650000,
    percentage: 11.68,
    region: "Farg'ona viloyati",
  },
  {
    name: "Samarqand",
    value: 10250000,
    percentage: 10.28,
    region: "Samarqand viloyati",
  },
  {
    name: "Buxoro",
    value: 8800000,
    percentage: 8.83,
    region: "Buxoro viloyati",
  },
  {
    name: "Andijon",
    value: 8500000,
    percentage: 8.5,
    region: "Andijon viloyati",
  },
  {
    name: "Namangan",
    value: 7900000,
    percentage: 7.93,
    region: "Namangan viloyati",
  },
  {
    name: "Qashqadaryo",
    value: 6900000,
    percentage: 6.9,
    region: "Qashqadaryo viloyati",
  },
  {
    name: "Sirdaryo",
    value: 6800000,
    percentage: 6.82,
    region: "Sirdaryo viloyati",
  },
  {
    name: "Jizzax",
    value: 6450000,
    percentage: 6.47,
    region: "Jizzax viloyati",
  },
  {
    name: "Surxon",
    value: 5900000,
    percentage: 5.92,
    region: "Surxondaryo viloyati",
  },
  {
    name: "Xorazm",
    value: 4850000,
    percentage: 4.87,
    region: "Xorazm viloyati",
  },
  {
    name: "Navoiy",
    value: 4200000,
    percentage: 4.21,
    region: "Navoiy viloyati",
  },
  {
    name: "Qoraqalpog'",
    value: 3650000,
    percentage: 3.66,
    region: "Qoraqalpog'iston Respublikasi",
  },
  {
    name: "Poymoz",
    value: 2400000,
    percentage: 2.41,
    region: "Poymoz viloyati",
  },
];

const statusData = [
  {
    name: "Hududgaz Komplektatsiya",
    value: 34,
    color: "#1E56A0",
  },
  { name: "Buxoro viloyati", value: 28, color: "#1E56A0" },
  { name: "Jizzax viloyati", value: 22, color: "#1E56A0" },
  { name: "Qashqadaryo viloyati", value: 18, color: "#1E56A0" },
  {
    name: "Qoraqalpog'iston Respublikasi",
    value: 15,
    color: "#1E56A0",
  },
  { name: "Namangan viloyati", value: 12, color: "#1E56A0" },
  { name: "Namangan viloyati", value: 10, color: "#1E56A0" },
  { name: "Samarqand viloyati", value: 8, color: "#1E56A0" },
  { name: "Sirdaryo viloyati", value: 6, color: "#1E56A0" },
];

const quickStats = [
  {
    title: "Jami buyurtmalar",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Package,
    description: "Joriy oyda",
    bgColor: "bg-gradient-to-br from-[#1E56A0]/10 to-[#1E56A0]/20",
    iconBg: "bg-gradient-to-br from-[#1E56A0] to-[#1E56A0]/90",
    iconColor: "text-white",
  },
  {
    title: "Faol viloyatlar",
    value: "14",
    change: "+2",
    trend: "up",
    icon: MapPin,
    description: "Barcha viloyatlar",
    bgColor: "bg-gradient-to-br from-[#1E56A0]/10 to-[#1E56A0]/20",
    iconBg: "bg-gradient-to-br from-[#1E56A0] to-[#1E56A0]/90",
    iconColor: "text-white",
  },
  {
    title: "Tasdiqlangan",
    value: "2,156",
    change: "+8.2%",
    trend: "up",
    icon: FileText,
    description: "Tasdiqlangan buyurtmalar",
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    iconBg: "bg-gradient-to-br from-emerald-600 to-emerald-700",
    iconColor: "text-white",
  },
  {
    title: "Jami summa",
    value: "89.2M",
    change: "-2.1%",
    trend: "down",
    icon: TrendingUp,
    description: "UZS hisobida",
    bgColor: "bg-gradient-to-br from-slate-50 to-slate-100",
    iconBg: "bg-gradient-to-br from-slate-600 to-slate-700",
    iconColor: "text-white",
  },
];

const Dashboard: React.FC = () => {
  const [dateFrom, setDateFrom] = useState("01.01.2025");
  const [dateTo, setDateTo] = useState("18.09.2025");

  const formatYAxisValue = (value: number) => {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (absValue >= 10000000) {
      return `${sign}${(absValue / 1000000).toFixed(0)}M`;
    } else if (absValue >= 1000000) {
      return `${sign}${(absValue / 1000000).toFixed(1)}M`;
    } else if (absValue >= 1000) {
      return `${sign}${(absValue / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isNegative = data.value < 0;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900">{data.region}</p>
          <p className="text-slate-600">
            Summa:{" "}
            <span
              className={`font-semibold ${isNegative ? "text-red-600" : "text-blue-600"
                }`}
            >
              {(data.value / 1000000).toFixed(1)} mln UZS
            </span>
          </p>
          <p className="text-slate-600">
            Foiz:{" "}
            <span
              className={`font-semibold ${isNegative ? "text-red-600" : "text-blue-600"
                }`}
            >
              {data.percentage}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between animate-in slide-in-from-top-4 fade-in duration-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <BarChart3 className="w-6 h-6 text-white drop-shadow-sm transition-transform duration-300 hover:scale-110" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 transition-colors duration-300">
              Analitika
            </h1>
            <p className="text-sm text-slate-600 mt-1 transition-colors duration-300">
              barcha viloyatlar bo'yicha analitika hisobotlari
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white border border-[#1E56A0]/20 rounded-lg px-3 py-2 transition-all duration-300 hover:shadow-md hover:border-[#1E56A0]/40">
              <Calendar className="w-4 h-4 text-[#1E56A0] transition-colors duration-300" />
              <span className="text-sm text-slate-700 transition-colors duration-300">
                Sanadan:
              </span>
              <Input
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-28 h-6 text-sm border-none p-0 focus:ring-0 transition-all duration-300"
                placeholder="01.01.2025"
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-[#1E56A0]/20 rounded-lg px-3 py-2 transition-all duration-300 hover:shadow-md hover:border-[#1E56A0]/40">
              <Calendar className="w-4 h-4 text-[#1E56A0] transition-colors duration-300" />
              <span className="text-sm text-slate-700 transition-colors duration-300">
                Sanagacha:
              </span>
              <Input
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-28 h-6 text-sm border-none p-0 focus:ring-0 transition-all duration-300"
                placeholder="18.09.2025"
              />
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2 border-[#1E56A0] text-[#1E56A0] px-4 py-2 text-sm transition-all duration-300 hover:bg-[#1E56A0] hover:text-white hover:shadow-md hover:scale-105"
          >
            <RefreshCcw className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-700">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={index}
              className={`p-4 border border-slate-200 hover:shadow-lg group transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 animate-in slide-in-from-bottom-4 fade-in ${stat.bgColor}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 transition-colors duration-300">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1 transition-all duration-300 group-hover:scale-105">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 transition-transform duration-300 hover:scale-110" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 transition-transform duration-300 hover:scale-110" />
                    )}
                    <span
                      className={`text-sm font-medium transition-colors duration-300 ${stat.trend === "up" ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-xs text-slate-500 ml-1 transition-colors duration-300">
                      {stat.description}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:scale-105`}
                >
                  <IconComponent
                    className={`w-6 h-6 ${stat.iconColor} transition-transform duration-300 group-hover:scale-110`}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Bar Chart */}
        <Card className="bg-white lg:col-span-3 p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Вилоятлар бўйича товар коллисклари
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Буюртмалар сони ва сумма бўйича тақсимот
              </p>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className="bg-slate-50 text-slate-700 border-slate-200"
              >
                Сўм миллионларда
              </Badge>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                Жорий йил
              </Badge>
            </div>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={regionData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 80,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickFormatter={formatYAxisValue}
                  domain={[-3000000, 15000000]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value">
                  {regionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.value < 0 ? "#dc2626" : "#1E56A0"}
                    />
                  ))}
                </Bar>
                {/* Add a reference line at zero */}
                <ReferenceLine y={0} stroke="#000000" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Legend and Status */}
        <Card className="bg-white p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-4">
            Вилоятлар рўйхати
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {statusData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full bg-[${item.color}]`}
                  ></div>
                  <span className="text-sm text-slate-700 font-medium">
                    {item.name}
                  </span>
                </div>
                <Badge variant="outline" className="bg-slate-50 text-slate-700">
                  {item.value}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Summary */}
        <Card className="bg-white p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-900">Вилоятлар хулосаси</h4>
            <Badge variant="outline" className="bg-slate-50 text-slate-700">
              14 та вилоят
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="text-sm font-medium text-green-800">
                  Фаол вилоятлар
                </p>
                <p className="text-xs text-green-600">Буюртма берган</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-800">12</p>
                <p className="text-xs text-green-600">85.7%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Паст фаоллик
                </p>
                <p className="text-xs text-amber-600">Кам буюртма</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-amber-800">2</p>
                <p className="text-xs text-amber-600">14.3%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Ўртача буюртма
                </p>
                <p className="text-xs text-slate-600">Вилоят учун</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-slate-800">203</p>
                <p className="text-xs text-slate-600">та буюртма</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Monthly Trends */}
        <Card className="bg-white p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-900">Ойлик тенденциялар</h4>
            <Badge variant="outline" className="bg-slate-50 text-slate-700">
              Сентабр 2025
            </Badge>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Бу ой буюртмалар</span>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-slate-900">856 та</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Ўтган ой билан</span>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">+12.8%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Йиллик ўсиш</span>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-600">+24.5%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Башорат (октабр)</span>
                <span className="font-semibold text-blue-600">920 та</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
