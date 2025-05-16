import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Avatar, Tag, Modal, Form, 
  Input, Select, message, Tooltip, Tabs, Badge, Descriptions
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined,
  DollarOutlined, CalendarOutlined, CreditCardOutlined
} from '@ant-design/icons';
import apiService from '../../services/apiService'; // Import your API service

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
  const [tableLoading, setTableLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch all required data
  const fetchAllData = async () => {
    setTableLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchPayments(),
        fetchBookings()
      ]);
    } catch (error) {
      message.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setTableLoading(false);
    }
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      const response = await apiService.adminGetAllUsers();
      // Ensure response is an array
      const usersArray = Array.isArray(response) ? response : (response.users || []);
      setUsers(usersArray);
      return usersArray; // Return for use in other functions
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
      return []; // Return empty array on error
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    try {
      // Get all users first
      const allUsers = await fetchUsers(); // Reuse the function to ensure consistent data
      
      if (!Array.isArray(allUsers)) {
        throw new Error('Users data is not an array');
      }
      
      // Array to store all payments
      let allPayments = [];
      
      // For each user, fetch their membership history which contains payment info
      await Promise.all(allUsers.map(async (user) => {
        if (!user || !user._id) return; // Skip if user or user ID is invalid
        
        try {
          const membershipHistory = await apiService.adminGetUserMembershipHistory(user._id);
          const userMembershipHistory = Array.isArray(membershipHistory) ? 
            membershipHistory : (membershipHistory.history || []);
          
          // Extract payments from membership history
          const userPayments = userMembershipHistory.map(membership => ({
            _id: membership._id || `temp-${Date.now()}-${Math.random()}`,
            user: user._id,
            booking: membership.bookingId,
            amount: membership.paymentAmount,
            status: membership.paymentStatus || 'Unknown',
            transactionId: membership.transactionId || 'N/A',
            createdAt: membership.paymentDate || new Date().toISOString()
          }));
          
          allPayments = [...allPayments, ...userPayments];
        } catch (err) {
          console.error(`Error fetching membership history for user ${user._id}:`, err);
        }
      }));
      
      setPayments(allPayments);
      return allPayments;
    } catch (error) {
      console.error('Error fetching payments data:', error);
      message.error('Failed to fetch payment information');
      return [];
    }
  };

  // Fetch bookings data using the new adminGetAllBookings API
  const fetchBookings = async () => {
    try {
      const response = await apiService.adminGetAllBookings();
      
      if (!response || !response.success || !Array.isArray(response.data)) {
        throw new Error('Invalid bookings response format');
      }
      
      // Transform the booking data to match the component's expected format
      const formattedBookings = response.data.map(booking => ({
        _id: booking._id,
        user: booking.user?._id,
        userName: booking.user?.name || 'Unknown User',
        userEmail: booking.user?.email || 'No Email',
        package: booking.package?.name || 'Unknown Package',
        timeSlot: booking.timeSlot,
        workoutDaysPerWeek: booking.workoutDaysPerWeek,
        paymentInterval: booking.paymentInterval || 'Monthly',
        totalPrice: booking.totalPrice || 0,
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status || 'Unknown',
        stripePaymentId: booking.stripePaymentId,
        customServices: booking.customServices || []
      }));
      
      setBookings(formattedBookings);
      return formattedBookings;
    } catch (error) {
      console.error('Error fetching bookings data:', error);
      message.error('Failed to fetch booking information');
      return [];
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setIsEditing(true);
    setCurrentUser(user);
    
    // Format user data for the form
    const formData = {
      ...user,
      role: user.role // Ensure role is properly set
    };
    
    form.setFieldsValue(formData);
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
  const handleDelete = async (userId) => {
    try {
      setLoading(true);
      
      // Using the admin toggle user status API to deactivate user
      await apiService.adminToggleUserStatus(userId, { active: false });
      
      message.success('User deactivated successfully!');
      
      // Refresh the user list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
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
      
      if (isEditing) {
        // Update existing user
        await apiService.adminUpdateUserRole(currentUser._id, { role: values.role });
        
        message.success('User updated successfully!');
      } else {
        // Register new user
        await apiService.register({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role
        });
        
        message.success('User created successfully!');
      }
      
      // Refresh the users list
      fetchUsers();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving user:', error);
      message.error(`Error: ${error.message || 'Please check the form and try again'}`);
    } finally {
      setLoading(false);
    }
  };

  // View user payments and bookings
  const handleViewPayments = async (userId) => {
    try {
      // Get user profile
      const user = users.find(u => u._id === userId);
      
      if (!user) {
        message.error('User not found');
        return;
      }
      
      // Get user payments
      const userPayments = payments.filter(payment => payment.user === userId);
      
      // Get user bookings
      const userBookings = bookings.filter(booking => booking.user === userId);
      
      // Set data for the modal
      setSelectedUserPayments(userPayments);
      setSelectedUserBookings(userBookings);
      setCurrentUser(user);
      setPaymentModalVisible(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      message.error('Failed to load user details');
    }
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
    if (!date) return 'N/A';
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
          <Avatar src={record.profileImage || `/api/placeholder/40/40`} icon={<UserOutlined />} />
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
        return <Tag color={color}>{role || 'Member'}</Tag>;
      },
    },
    {
      title: 'Membership',
      key: 'currentMembership',
      render: (_, record) => {
        // Find user's active booking
        const activeBooking = bookings.find(
          b => b.user === record._id && b.status === 'Active'
        );
        
        return activeBooking ? activeBooking.package : 'None';
      }
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
      render: amount => `$${amount ? amount.toFixed(2) : '0.00'}`,
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
      render: price => `$${price ? price.toFixed(2) : '0.00'}`,
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
        rowKey={record => record._id || `temp-${Date.now()}-${Math.random()}`}
        loading={tableLoading}
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
        title={`${currentUser?.name || 'User'} - Payment & Booking Details`}
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
                  .reduce((sum, p) => sum + (p.amount || 0), 0)
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
              rowKey={record => record._id || `temp-${Date.now()}-${Math.random()}`}
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
              rowKey={record => record._id || `temp-${Date.now()}-${Math.random()}`}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </Card>
  );
};

export default UsersPanel;