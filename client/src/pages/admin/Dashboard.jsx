import React, { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Avatar, List, Typography, Divider, Space, Spin, Alert, Empty
} from 'antd';
import {
  UserOutlined, RiseOutlined, ApartmentOutlined, DollarOutlined, CalendarOutlined
} from '@ant-design/icons';
import apiService from '../../services/apiService'; // Adjust path according to your project structure

const { Title, Text } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // For admin dashboard, we'll need to fetch several endpoints
        const [
          usersData,
          bookingsData,
          packagesData
        ] = await Promise.all([
          apiService.adminGetAllUsers(),
          apiService.getUserBookings(), // Assuming this endpoint returns all bookings for admin
          apiService.getPackages()
        ]);
        
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
        
        // Count active memberships
        const activeMemberships = bookingsData.filter(booking => booking.status === 'Active').length;
        
        setDashboardData({
          totalUsers: usersData.length,
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
          
          return {
            id: booking._id,
            title: `New booking created`,
            description: `User purchased the ${booking.package.name} package`,
            timeAgo
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
        value: `$${dashboardData.thisMonthRevenue.toFixed(2)}`,
        prefix: <DollarOutlined />,
        color: '#faad14' // yellow color
      }
    ];
  };

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
      <Card title="Recent Activity">
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
                  description={item.description}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="No recent activities" />
        )}
      </Card>
    </Card>
  );
};

export default Dashboard;