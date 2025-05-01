import React from 'react';
import { 
  Card, Row, Col, Statistic, Avatar, List, Typography, Divider, Space 
} from 'antd';
import { 
  UserOutlined, RiseOutlined, ApartmentOutlined, DollarOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard = () => {
  // Sample data for dashboard stats
  const stats = [
    { 
      label: 'Total Users', 
      value: '124', 
      prefix: <UserOutlined />,
      color: '#1890ff'  // blue color
    },
    { 
      label: 'Active Memberships', 
      value: '78', 
      prefix: <RiseOutlined />,
      color: '#52c41a'  // green color
    },
    { 
      label: 'Packages', 
      value: '5', 
      prefix: <ApartmentOutlined />,
      color: '#722ed1'  // purple color
    },
    { 
      label: 'This Month Revenue', 
      value: '$8,245', 
      prefix: <DollarOutlined />,
      color: '#faad14'  // yellow color
    }
  ];

  // Sample data for recent activities
  const recentActivities = [
    {
      id: 1,
      title: 'New membership purchased',
      description: 'John Doe purchased the Premium package',
      timeAgo: '2h ago'
    },
    {
      id: 2,
      title: 'Booking updated',
      description: 'Jane Smith changed her booking time slot',
      timeAgo: '3h ago'
    },
    {
      id: 3,
      title: 'New user registered',
      description: 'Robert Johnson created a new account',
      timeAgo: '5h ago'
    },
    {
      id: 4,
      title: 'Payment received',
      description: 'Mike Wilson paid for 3-month membership',
      timeAgo: '6h ago'
    },
    {
      id: 5,
      title: 'Service added',
      description: 'Admin added "Yoga Classes" to available services',
      timeAgo: '8h ago'
    }
  ];

  return (
    <Card title={<Title level={4}>Dashboard</Title>}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
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
        <List
          itemLayout="horizontal"
          dataSource={recentActivities}
          renderItem={item => (
            <List.Item
              extra={<Text type="secondary">{item.timeAgo}</Text>}
            >
              <List.Item.Meta
                avatar={<Avatar src={`/api/placeholder/32/32`} />}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>
    </Card>
  );
};

export default Dashboard;