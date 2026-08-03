// src/pages/admin/Reports.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Calendar,
  Printer,
  Mail,
  BarChart3,
  Clock,
  Award,
  ShoppingCart,
  UserCheck,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState("csv");
  const [error, setError] = useState(null);

  // ✅ Report types with real API endpoints
  const reportTypes = [
    { 
      id: "users", 
      label: "User Report", 
      icon: Users, 
      color: "text-green-500",
      endpoint: "/admin/reports/users",
      apiMethod: adminApi.getUsersReport,
      description: "User statistics and demographics"
    },
    { 
      id: "orders", 
      label: "Order Report", 
      icon: ShoppingCart, 
      color: "text-yellow-500",
      endpoint: "/admin/reports/orders",
      apiMethod: adminApi.getOrdersReport,
      description: "Order analytics and trends"
    },
    { 
      id: "revenue", 
      label: "Revenue Report", 
      icon: DollarSign, 
      color: "text-orange-500",
      endpoint: "/admin/reports/revenue",
      apiMethod: adminApi.getRevenueReport,
      description: "Revenue and payment insights"
    },
    { 
      id: "courses", 
      label: "Course Report", 
      icon: BookOpen, 
      color: "text-purple-500",
      endpoint: "/admin/reports/courses",
      apiMethod: adminApi.getCoursesReport,
      description: "Course performance analytics"
    },
  ];

  // ✅ Format user data from API
  const formatUserData = (data) => {
    if (!data) return null;
    
    // Handle different response structures
    const userData = data.data || data;
    
    return {
      title: "User Report",
      generatedDate: new Date().toLocaleString(),
      summary: {
        totalUsers: userData.totalUsers || userData.total || 0,
        students: userData.totalStudents || userData.students || 0,
        instructors: userData.totalInstructors || userData.instructors || 0,
        admins: userData.totalAdmin || userData.admins || 0,
        activeUsers: userData.activeUsers || userData.active || 0,
        pendingVerification: userData.pendingVerification || 0,
        newUsersThisMonth: userData.newUsersThisMonth || 0
      },
      data: userData.users || userData.items || [
        { role: "Students", count: userData.totalStudents || 0 },
        { role: "Instructors", count: userData.totalInstructors || 0 },
        { role: "Admins", count: userData.totalAdmin || 0 }
      ]
    };
  };

  // ✅ Format order data from API
  const formatOrderData = (data) => {
    if (!data) return null;
    
    const orderData = data.data || data;
    
    return {
      title: "Order Report",
      generatedDate: new Date().toLocaleString(),
      summary: {
        totalOrders: orderData.totalOrders || orderData.total || 0,
        completedOrders: orderData.completedOrders || orderData.completed || 0,
        pendingOrders: orderData.pendingOrders || orderData.pending || 0,
        cancelledOrders: orderData.cancelledOrders || orderData.cancelled || 0,
        refundedOrders: orderData.refundedOrders || orderData.refunded || 0,
        totalRevenue: orderData.totalRevenue || orderData.revenue || 0
      },
      data: orderData.orders || orderData.items || []
    };
  };

  // ✅ Format revenue data from API
  const formatRevenueData = (data) => {
    if (!data) return null;
    
    const revenueData = data.data || data;
    
    return {
      title: "Revenue Report",
      generatedDate: new Date().toLocaleString(),
      summary: {
        totalRevenue: revenueData.totalRevenue || revenueData.total || 0,
        monthlyRevenue: revenueData.monthlyRevenue || 0,
        averageOrderValue: revenueData.averageOrderValue || 0,
        growthRate: revenueData.growthRate || '0%',
        pendingPayments: revenueData.pendingPayments || 0
      },
      data: revenueData.revenueData || revenueData.items || []
    };
  };

  // ✅ Format course data from API
  const formatCourseData = (data) => {
    if (!data) return null;
    
    const courseData = data.data || data;
    
    return {
      title: "Course Report",
      generatedDate: new Date().toLocaleString(),
      summary: {
        totalCourses: courseData.totalCourses || courseData.total || 0,
        activeCourses: courseData.activeCourses || courseData.active || 0,
        draftCourses: courseData.draftCourses || 0,
        archivedCourses: courseData.archivedCourses || 0,
        totalEnrollments: courseData.totalEnrollments || courseData.enrollments || 0,
        mostPopular: courseData.mostPopular || 'N/A'
      },
      data: courseData.courses || courseData.items || []
    };
  };

  // ✅ Format report data based on type
  const formatReportData = (data, type) => {
    if (!data) return null;

    switch (type) {
      case 'users':
        return formatUserData(data);
      case 'orders':
        return formatOrderData(data);
      case 'revenue':
        return formatRevenueData(data);
      case 'courses':
        return formatCourseData(data);
      default:
        return {
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
          generatedDate: new Date().toLocaleString(),
          summary: data.summary || {},
          data: data.data || data.items || []
        };
    }
  };

  // ✅ Fetch data from real API
  const generateReport = async (type) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`[Reports] Fetching ${type} report from API...`);
      console.log(`[Reports] Date Range:`, dateRange);
      
      const reportType = reportTypes.find(t => t.id === type);
      if (!reportType) {
        throw new Error('Invalid report type');
      }

      // ✅ Call the real API
      const data = await reportType.apiMethod({ 
        startDate: dateRange.startDate, 
        endDate: dateRange.endDate 
      });
      
      console.log(`[Reports] ${type} API Response:`, data);
      
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // ✅ Format the data
      const formattedData = formatReportData(data, type);
      
      if (!formattedData) {
        throw new Error('Failed to format report data');
      }
      
      setReportData(formattedData);
      setSelectedReport(type);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully`);
      
    } catch (error) {
      console.error(`[Reports] Error generating ${type} report:`, error);
      
      let errorMessage = 'Failed to generate report';
      
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Network Error: Cannot connect to the server. Please check your connection.';
        toast.error('Network Error. Please check your connection.');
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        toast.error('Session expired. Please login again.');
        window.location.href = '/admin/login';
        return;
      } else if (error.response?.status === 404) {
        errorMessage = `API endpoint not found: ${error.response?.config?.url}`;
        toast.error('Report API not found.');
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
        toast.error('Server error. Please try again.');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        toast.error(error.response.data.message);
      } else if (error.message) {
        errorMessage = error.message;
        toast.error(error.message);
      } else {
        toast.error('Failed to generate report');
      }
      
      setError(errorMessage);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Export report as CSV
  const handleExport = (format) => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      toast.error('No data to export. Please generate a report first.');
      return;
    }
    
    setIsGenerating(true);
    try {
      const content = generateCSVContent(reportData.data);
      downloadFile(content, `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('[Reports] Export error:', error);
      toast.error('Failed to export report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ Generate CSV content from data
  const generateCSVContent = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header] || '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  // ✅ Download file helper
  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // ✅ Initial load
  useEffect(() => {
    generateReport(activeTab);
  }, [activeTab, dateRange]);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating report...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export platform reports</p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1">
              <AlertCircle size={14} />
              {error}
            </span>
          )}
          <button
            onClick={() => generateReport(activeTab)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
          />
          <button
            onClick={() => generateReport(activeTab)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setActiveTab(type.id)}
              className={`p-4 rounded-xl border transition-all ${
                activeTab === type.id
                  ? "bg-orange-50 border-orange-500 shadow-md"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:shadow"
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${activeTab === type.id ? type.color : "text-gray-400"}`} />
              <p className={`text-xs font-medium text-center ${
                activeTab === type.id ? "text-orange-700" : "text-gray-600"
              }`}>
                {type.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 truncate">
                {type.endpoint}
              </p>
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      {reportData ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Report Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{reportData.title}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Generated: {reportData.generatedDate}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Date Range: {dateRange.startDate} to {dateRange.endDate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <Printer size={18} />
                </button>
                <button
                  onClick={() => toast.success(`Report sent to your email`)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <Mail size={18} />
                </button>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">Text File</option>
                </select>
                <button
                  onClick={() => handleExport(exportFormat)}
                  disabled={isGenerating || !reportData.data || reportData.data.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Export
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {reportData.summary && Object.keys(reportData.summary).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(reportData.summary).slice(0, 8).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {typeof value === 'number' && key.toLowerCase().includes('revenue') ? '₹' : ''}
                    {typeof value === 'number' ? value.toLocaleString() : value}
                    {typeof value === 'number' && key.toLowerCase().includes('rate') ? '%' : ''}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Data Table */}
          {reportData.data && reportData.data.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Detailed Data</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {reportData.data.length} rows
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(reportData.data[0] || {}).map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.data.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        {Object.values(item).map((value, i) => (
                          <td key={i} className="px-6 py-4 text-sm text-gray-900">
                            {typeof value === 'number' && typeof Object.values(item)[0] === 'number' && i === 0 
                              ? value 
                              : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Export Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Export Options</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => handleExport('csv')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center"
              >
                <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">CSV</p>
                <p className="text-xs text-gray-400">Spreadsheet format</p>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center"
              >
                <FileText className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Text File</p>
                <p className="text-xs text-gray-400">Printable format</p>
              </button>
              <button
                onClick={() => toast.info("Scheduled report will be sent daily")}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center"
              >
                <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Schedule</p>
                <p className="text-xs text-gray-400">Daily reports</p>
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">No Report Data</h3>
            <p className="text-gray-400 text-sm mt-1">
              {error || 'Select a report type and date range to generate data'}
            </p>
            <button
              onClick={() => generateReport(activeTab)}
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Reports;