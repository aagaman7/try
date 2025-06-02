import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Avatar, List, Typography, Divider, Space, Spin, Alert, Empty,
  Table, Tag
} from 'antd';
import {
  UserOutlined, RiseOutlined, ApartmentOutlined, DollarOutlined, CalendarOutlined,
  ClockCircleOutlined, AimOutlined
} from '@ant-design/icons';
import moment from 'moment';
import apiService from '../../services/apiService'; // Adjust path according to your project structure

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState({});
  
  // Filter and search states
  const [filters, setFilters] = useState({
    userName: "",
    userId: "",
    dateRange: null,
    status: null,
    paymentInterval: null,
  });

  // Sorting state
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc"); // 'desc' or 'asc'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch bookings using the new API
        const bookingsResponse = await apiService.adminGetAllBookings();
        const bookingsData = bookingsResponse.data || [];
        
        // Fetch users data
        const usersData = await apiService.adminGetAllUsers();
        const packagesData = await apiService.getPackages();
        
        // Create a map of users for easy lookup
        const usersMap = {};
        usersData.users.forEach(user => {
          usersMap[user._id] = user;
        });
        setUsers(usersMap);
        setBookings(bookingsData); // Set the bookings directly from the response

        // Calculate revenue from bookings
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const thisMonthRevenue = bookingsData
          .filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return bookingDate.getMonth() === currentMonth && 
                   bookingDate.getFullYear() === currentYear;
          })
          .reduce((total, booking) => total + booking.totalPrice, 0);

        // Count unique users who have bookings
        const uniqueBookingUsers = new Set(bookingsData.map(booking => booking.user._id));
        
        // Count active memberships
        const activeMemberships = bookingsData.filter(booking => booking.status === 'Active').length;
        
        setDashboardData({
          totalUsers: usersData.users.length,
          activeUsers: uniqueBookingUsers.size,
          activeMemberships,
          totalPackages: packagesData.length,
          thisMonthRevenue
        });
        
        // Create recent activities from the latest bookings
        const sortedBookings = [...bookingsData].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 5);
        
        const activities = sortedBookings.map(booking => {
          const timeAgo = getTimeAgo(new Date(booking.createdAt));
          const packageName = booking.package?.name || "Unknown Package";
          
          return {
            id: booking._id,
            title: `New booking created`,
            description: `${booking.user.name} purchased the ${packageName} package`,
            timeAgo,
            goal: booking.goals && booking.goals.length > 0 ? booking.goals[0] : "No goal specified"
          };
        });
        
        setRecentActivities(activities);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval > 1 ? 's' : ''} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval > 1 ? 's' : ''} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval > 1 ? 's' : ''} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval > 1 ? 's' : ''} ago`;
    
    return `${Math.floor(seconds)} second${Math.floor(seconds) !== 1 ? 's' : ''} ago`;
  };

  // Define stat cards data based on the fetched information
  const generateStats = () => {
    if (!dashboardData) return [];
    
    return [
      {
        label: 'Total Users',
        value: dashboardData.totalUsers,
        prefix: <UserOutlined />,
        color: '#1890ff' // blue color
      },
      {
        label: 'Active Memberships',
        value: dashboardData.activeMemberships,
        prefix: <RiseOutlined />,
        color: '#52c41a' // green color
      },
      {
        label: 'Packages',
        value: dashboardData.totalPackages,
        prefix: <ApartmentOutlined />,
        color: '#722ed1' // purple color
      },
      {
        label: 'This Month Revenue',
        value: `Nrs ${dashboardData.thisMonthRevenue.toFixed(2)}`,
        prefix: <DollarOutlined />,
        color: '#faad14' // yellow color
      }
    ];
  };

  // Table columns configuration for recent bookings - updated for new data structure
  const recentBookingsColumns = [
    {
      title: "User",
      key: "user",
      render: (record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{record.user?.name || "Unknown User"}</span>
        </Space>
      ),
    },
    {
      title: "Package",
      key: "packageName",
      render: (record) => record.package?.name || "Unknown Package",
    },
    {
      title: "Time Slot",
      dataIndex: "timeSlot",
      key: "timeSlot",
      render: (timeSlot) => timeSlot || "Not specified",
    },
    {
      title: "Goal",
      dataIndex: "goals",
      key: "goals",
      render: (goals) => goals && goals.length > 0 ? goals[0] : "Not specified",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => moment(text).format("MMM DD, YYYY"),
    },
    {
      title: "Payment",
      dataIndex: "paymentInterval",
      key: "paymentInterval",
    },
    {
      title: "Price",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text) => `Nrs ${text.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color =
          status === "Active"
            ? "green"
            : status === "Expired"
            ? "volcano"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading dashboard data...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card title={<Title level={4}>Dashboard</Title>}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {generateStats().map((stat, index) => (
          <Col xs={24} sm={12} md={12} lg={6} key={index}>
            <Card>
              <Space direction="horizontal" size="middle" align="center">
                <Avatar
                  size={48}
                  style={{ backgroundColor: stat.color }}
                  icon={stat.prefix}
                />
                <Statistic
                  title={stat.label}
                  value={stat.value}
                  valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
                />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Activity */}
      <Card title="Recent Activity" style={{ marginBottom: 24 }}>
        {recentActivities.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={recentActivities}
            renderItem={item => (
              <List.Item
                extra={<Text type="secondary">{item.timeAgo}</Text>}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<CalendarOutlined />} />}
                  title={item.title}
                  description={
                    <>
                      <div>{item.description}</div>
                      <div>
                        <Space>
                          <AimOutlined /> 
                          <Text type="secondary">Goal: {item.goal}</Text>
                        </Space>
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No recent activities" />
        )}
      </Card>

      {/* Recent Bookings Table */}
      <Card title="Recent Bookings">
        <Table 
          dataSource={bookings.slice(0, 5)}
          columns={recentBookingsColumns}
          rowKey="_id"
          pagination={false}
          size="small"
        />
      </Card>
    </Card>
  );
};

export default Dashboard;