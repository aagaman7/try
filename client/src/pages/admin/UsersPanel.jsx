import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Avatar, Tag, Modal, Form, 
  Input, Select, message, Tooltip, Tabs, Badge, Descriptions
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined,
  DollarOutlined, CalendarOutlined, CreditCardOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TabPane } = Tabs;

const UsersPanel = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUserPayments, setSelectedUserPayments] = useState([]);
  const [selectedUserBookings, setSelectedUserBookings] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
    fetchPayments();
    fetchBookings();
  }, []);

  // Sample fetch functions (would use real API calls in a real app)
  const fetchUsers = () => {
    // Simulated API call
    const sampleUsers = [
      { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'Member', currentMembership: 'Premium Package' },
      { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Member', currentMembership: 'Basic Package' },
      { _id: '3', name: 'Admin User', email: 'admin@example.com', role: 'Admin', currentMembership: null },
      { _id: '4', name: 'Mike Johnson', email: 'mike@example.com', role: 'Member', currentMembership: 'Pro Package' }
    ];
    setUsers(sampleUsers);
  };

  const fetchPayments = () => {
    // Simulated API call
    const samplePayments = [
      { _id: 'p1', user: '1', booking: 'b1', amount: 99.99, status: 'Success', transactionId: 'tx_123456', createdAt: new Date('2025-03-15') },
      { _id: 'p2', user: '1', booking: 'b2', amount: 49.99, status: 'Success', transactionId: 'tx_234567', createdAt: new Date('2025-04-15') },
      { _id: 'p3', user: '2', booking: 'b3', amount: 29.99, status: 'Failed', transactionId: 'tx_345678', createdAt: new Date('2025-04-10') },
      { _id: 'p4', user: '2', booking: 'b4', amount: 29.99, status: 'Success', transactionId: 'tx_456789', createdAt: new Date('2025-04-12') },
      { _id: 'p5', user: '4', booking: 'b5', amount: 149.99, status: 'Success', transactionId: 'tx_567890', createdAt: new Date('2025-04-01') }
    ];
    setPayments(samplePayments);
  };

  const fetchBookings = () => {
    // Simulated API call
    const sampleBookings = [
      { 
        _id: 'b1', 
        user: '1', 
        package: 'Premium', 
        timeSlot: 'Morning', 
        workoutDaysPerWeek: 5, 
        paymentInterval: 'Monthly', 
        totalPrice: 99.99,
        startDate: new Date('2025-03-15'),
        endDate: new Date('2025-04-15'),
        status: 'Active'
      },
      { 
        _id: 'b2', 
        user: '1', 
        package: 'Premium', 
        timeSlot: 'Morning', 
        workoutDaysPerWeek: 5, 
        paymentInterval: 'Monthly', 
        totalPrice: 49.99,
        startDate: new Date('2025-04-15'),
        endDate: new Date('2025-05-15'),
        status: 'Active'
      },
      { 
        _id: 'b3', 
        user: '2', 
        package: 'Basic', 
        timeSlot: 'Evening', 
        workoutDaysPerWeek: 3, 
        paymentInterval: 'Monthly', 
        totalPrice: 29.99,
        startDate: new Date('2025-04-10'),
        endDate: new Date('2025-05-10'),
        status: 'Cancelled'
      },
      { 
        _id: 'b4', 
        user: '2', 
        package: 'Basic', 
        timeSlot: 'Evening', 
        workoutDaysPerWeek: 3, 
        paymentInterval: 'Monthly', 
        totalPrice: 29.99,
        startDate: new Date('2025-04-12'),
        endDate: new Date('2025-05-12'),
        status: 'Active'
      },
      { 
        _id: 'b5', 
        user: '4', 
        package: 'Pro', 
        timeSlot: 'Afternoon', 
        workoutDaysPerWeek: 7, 
        paymentInterval: '3 Months', 
        totalPrice: 149.99,
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-07-01'),
        status: 'Active'
      }
    ];
    setBookings(sampleBookings);
  };

  // Handle edit user
  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  // Handle add new user
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Handle delete user
  const handleDelete = (userId) => {
    // In a real app, make an API call to delete the user
    message.success(`User ${userId} deleted successfully!`);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    form.resetFields();
  };

  // Handle save user
  const handleSaveUser = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // In a real app, make an API call to update or create user
      setTimeout(() => {
        if (isEditing) {
          message.success("User updated successfully!");
        } else {
          message.success("User created successfully!");
        }
        setLoading(false);
        setModalVisible(false);
      }, 500);
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Error saving user. Please check the form and try again.");
      setLoading(false);
    }
  };

  // View user payments and bookings
  const handleViewPayments = (userId) => {
    const userPayments = payments.filter(payment => payment.user === userId);
    const userBookings = bookings.filter(booking => booking.user === userId);
    const user = users.find(u => u._id === userId);
    
    setSelectedUserPayments(userPayments);
    setSelectedUserBookings(userBookings);
    setCurrentUser(user);
    setPaymentModalVisible(true);
  };

  // Get payment status badge color
  const getPaymentStatusColor = (status) => {
    return status === 'Success' ? 'green' : 'red';
  };

  // Get booking status badge color
  const getBookingStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'green';
      case 'Expired': return 'grey';
      case 'Cancelled': return 'red';
      default: return 'blue';
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={`/api/placeholder/40/40`} icon={<UserOutlined />} />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = role === 'Admin' ? 'purple' : role === 'Trainer' ? 'blue' : 'green';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Membership',
      dataIndex: 'currentMembership',
      key: 'currentMembership',
      render: (text) => text || 'None',
    },
    {
      title: 'Payment Status',
      key: 'paymentStatus',
      render: (_, record) => {
        const userPayments = payments.filter(payment => payment.user === record._id);
        const userBookings = bookings.filter(booking => booking.user === record._id);
        
        if (userPayments.length === 0) {
          return <Tag color="orange">No Payments</Tag>;
        }
        
        const latestPayment = userPayments.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        
        const activeBooking = userBookings.find(booking => booking.status === 'Active');
        
        if (!activeBooking) {
          return <Tag color="orange">No Active Booking</Tag>;
        }
        
        return (
          <Space>
            <Badge 
              status={latestPayment.status === 'Success' ? 'success' : 'error'} 
              text={latestPayment.status}
            />
            <Button 
              type="link" 
              size="small" 
              onClick={() => handleViewPayments(record._id)}
            >
              Details
            </Button>
          </Space>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Payments">
            <Button 
              type="default" 
              icon={<DollarOutlined />} 
              size="small"
              onClick={() => handleViewPayments(record._id)}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button 
              type="default" 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete User">
            <Button 
              danger
              icon={<DeleteOutlined />} 
              size="small"
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Payment table columns
  const paymentColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => formatDate(date),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => `$${amount.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={getPaymentStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
    },
  ];

  // Booking table columns
  const bookingColumns = [
    {
      title: 'Package',
      dataIndex: 'package',
      key: 'package',
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        <span>
          {formatDate(record.startDate)} - {formatDate(record.endDate)}
        </span>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: price => `$${price.toFixed(2)}`,
    },
    {
      title: 'Interval',
      dataIndex: 'paymentInterval',
      key: 'paymentInterval',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={getBookingStatusColor(status)}>{status}</Tag>
      ),
    },
  ];

  return (
    <Card 
      title="Users Management"
      extra={
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add User
        </Button>
      }
    >
      {/* Users Table */}
      <Table 
        dataSource={users}
        columns={columns}
        rowKey="_id"
        pagination={{ 
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50']
        }}
      />

      {/* User Form Modal */}
      <Modal
        title={isEditing ? "Edit User" : "Create New User"}
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="cancel" onClick={handleModalClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSaveUser}>
            Save
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter user name' }]}
          >
            <Input placeholder="Enter user name" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select role">
              <Option value="Member">Member</Option>
              <Option value="Admin">Admin</Option>
              <Option value="Trainer">Trainer</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="currentMembership"
            label="Current Membership"
          >
            <Select placeholder="Select membership" allowClear>
              <Option value="Basic Package">Basic Package</Option>
              <Option value="Premium Package">Premium Package</Option>
              <Option value="Pro Package">Pro Package</Option>
            </Select>
          </Form.Item>
          
          {!isEditing && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password' }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Payment Details Modal */}
      <Modal
        title={`${currentUser?.name} - Payment & Booking Details`}
        visible={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPaymentModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <Tabs defaultActiveKey="1">
          <TabPane 
            tab={
              <span>
                <CreditCardOutlined /> Payments
              </span>
            } 
            key="1"
          >
            <Descriptions title="Payment Summary" bordered style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Total Payments">
                {selectedUserPayments.length}
              </Descriptions.Item>
              <Descriptions.Item label="Successful Payments">
                {selectedUserPayments.filter(p => p.status === 'Success').length}
              </Descriptions.Item>
              <Descriptions.Item label="Failed Payments">
                {selectedUserPayments.filter(p => p.status === 'Failed').length}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount Paid">
                ${selectedUserPayments
                  .filter(p => p.status === 'Success')
                  .reduce((sum, p) => sum + p.amount, 0)
                  .toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="Latest Payment" span={2}>
                {selectedUserPayments.length > 0 
                  ? formatDate(selectedUserPayments.sort((a, b) => 
                      new Date(b.createdAt) - new Date(a.createdAt)
                    )[0].createdAt)
                  : 'No payments'}
              </Descriptions.Item>
            </Descriptions>
            
            <Table 
              dataSource={selectedUserPayments}
              columns={paymentColumns}
              rowKey="_id"
              pagination={false}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <CalendarOutlined /> Bookings
              </span>
            } 
            key="2"
          >
            <Descriptions title="Booking Summary" bordered style={{ marginBottom: 20 }}>
              <Descriptions.Item label="Total Bookings">
                {selectedUserBookings.length}
              </Descriptions.Item>
              <Descriptions.Item label="Active Bookings">
                {selectedUserBookings.filter(b => b.status === 'Active').length}
              </Descriptions.Item>
              <Descriptions.Item label="Cancelled/Expired">
                {selectedUserBookings.filter(b => b.status !== 'Active').length}
              </Descriptions.Item>
              <Descriptions.Item label="Current Package" span={3}>
                {selectedUserBookings.find(b => b.status === 'Active')?.package || 'None'}
              </Descriptions.Item>
            </Descriptions>
            
            <Table 
              dataSource={selectedUserBookings}
              columns={bookingColumns}
              rowKey="_id"
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </Card>
  );
};

export default UsersPanel;