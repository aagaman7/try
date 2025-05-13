import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Tag, Modal, Form, 
  Input, InputNumber, Select, Switch, message, Tooltip, Popconfirm
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  CheckCircleOutlined, CloseCircleOutlined,
  PercentageOutlined, CalendarOutlined
} from '@ant-design/icons';
import apiService from '../../services/apiService';

const { Option } = Select;

const DiscountPanel = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState(null);
  const [form] = Form.useForm();
  const [tableLoading, setTableLoading] = useState(true);

  // Fetch discounts on component mount
  useEffect(() => {
    fetchDiscounts();
  }, []);

  // Fetch discounts using the API service
  const fetchDiscounts = async () => {
    setTableLoading(true);
    try {
      const response = await apiService.getAllDiscounts();
      setDiscounts(response);
      setTableLoading(false);
    } catch (error) {
      console.error('Error fetching discounts:', error);
      message.error('Failed to fetch discounts.');
      setTableLoading(false);
    }
  };

  // Handle add new discount
  const handleAddDiscount = () => {
    setIsEditing(false);
    setCurrentDiscount(null);
    form.resetFields();
    // Set default values
    form.setFieldsValue({
      active: true,
      percentage: 10
    });
    setModalVisible(true);
  };

  // Handle edit discount
  const handleEditDiscount = (discount) => {
    setIsEditing(true);
    setCurrentDiscount(discount);
    form.setFieldsValue({
      name: discount.name,
      percentage: discount.percentage,
      paymentInterval: discount.paymentInterval,
      active: discount.active
    });
    setModalVisible(true);
  };

  // Handle delete discount using the API service
  const handleDeleteDiscount = async (discountId) => {
    try {
      await apiService.deleteDiscount(discountId);
      message.success('Discount deleted successfully.');
      fetchDiscounts(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting discount:', error);
      message.error('Failed to delete discount.');
    }
  };

  // Handle toggle discount active status using the API service
  const handleToggleStatus = async (discount) => {
    try {
      const updatedData = { 
        ...discount, 
        active: !discount.active 
      };
      await apiService.updateDiscount(discount._id, updatedData);
      message.success(`Discount ${!discount.active ? 'activated' : 'deactivated'} successfully.`);
      fetchDiscounts(); // Refresh the list after update
    } catch (error) {
      console.error('Error updating discount status:', error);
      message.error('Failed to update discount status.');
    }
  };

  // Handle save discount (create or update) using the API service
  const handleSaveDiscount = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (isEditing) {
        // Update existing discount
        await apiService.updateDiscount(currentDiscount._id, values);
        message.success('Discount updated successfully.');
      } else {
        // Create new discount
        await apiService.createDiscount(values);
        message.success('Discount created successfully.');
      }
      
      setModalVisible(false);
      setLoading(false);
      fetchDiscounts(); // Refresh the list after creating/updating
    } catch (error) {
      console.error('Error saving discount:', error);
      message.error('Failed to save discount. Please check the form.');
      setLoading(false);
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
      title: 'Discount Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => (
        <Tag color="blue" icon={<PercentageOutlined />}>
          {percentage}%
        </Tag>
      ),
      sorter: (a, b) => a.percentage - b.percentage,
    },
    {
      title: 'Payment Interval',
      dataIndex: 'paymentInterval',
      key: 'paymentInterval',
      render: (interval) => {
        let color;
        switch(interval) {
          case 'Monthly': color = 'green'; break;
          case '3 Months': color = 'purple'; break;
          case 'Yearly': color = 'orange'; break;
          default: color = 'default';
        }
        return (
          <Tag color={color} icon={<CalendarOutlined />}>
            {interval}
          </Tag>
        );
      },
      filters: [
        { text: 'Monthly', value: 'Monthly' },
        { text: '3 Months', value: '3 Months' },
        { text: 'Yearly', value: 'Yearly' },
      ],
      onFilter: (value, record) => record.paymentInterval === value,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active ? 'success' : 'error'} icon={active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.active === value,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={record.active ? 'Deactivate' : 'Activate'}>
            <Button
              type={record.active ? 'default' : 'primary'}
              icon={record.active ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              size="small"
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditDiscount(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this discount?"
              onConfirm={() => handleDeleteDiscount(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Discount Management"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddDiscount}
        >
          Add Discount
        </Button>
      }
    >
      <Table
        dataSource={discounts}
        columns={columns}
        rowKey="_id"
        loading={tableLoading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
      />

      {/* Discount Form Modal */}
      <Modal
        title={isEditing ? "Edit Discount" : "Create New Discount"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSaveDiscount}>
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
            label="Discount Name"
            rules={[{ required: true, message: 'Please enter discount name' }]}
          >
            <Input placeholder="Enter discount name" />
          </Form.Item>

          <Form.Item
            name="percentage"
            label="Discount Percentage"
            rules={[
              { required: true, message: 'Please enter discount percentage' },
              { type: 'number', min: 1, max: 100, message: 'Percentage must be between 1 and 100' }
            ]}
          >
            <InputNumber
              min={1}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="paymentInterval"
            label="Payment Interval"
            rules={[{ required: true, message: 'Please select payment interval' }]}
          >
            <Select placeholder="Select payment interval">
              <Option value="Monthly">Monthly</Option>
              <Option value="3 Months">3 Months</Option>
              <Option value="Yearly">Yearly</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="active"
            label="Status"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default DiscountPanel;