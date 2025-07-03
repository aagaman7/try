import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Tag, Modal, Form, 
  Input, InputNumber, Select, Switch, message, Tooltip, Popconfirm
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  CheckCircleOutlined, CloseCircleOutlined,
  DollarOutlined, AppstoreOutlined
} from '@ant-design/icons';
import apiService from '../../services/apiService';

const { Option } = Select;
const { TextArea } = Input;

const ServicesPanel = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [form] = Form.useForm();
  const [tableLoading, setTableLoading] = useState(true);

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch services function using API service
  const fetchServices = async () => {
    setTableLoading(true);
    try {
      const response = await apiService.getServices();
      setServices(response);
      setTableLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error('Failed to fetch services.');
      setTableLoading(false);
    }
  };

  // Handle add new service
  const handleAddService = () => {
    setIsEditing(false);
    setCurrentService(null);
    form.resetFields();
    // Set default values
    form.setFieldsValue({
      active: true,
      category: 'Fitness'
    });
    setModalVisible(true);
  };

  // Handle edit service
  const handleEditService = (service) => {
    setIsEditing(true);
    setCurrentService(service);
    form.setFieldsValue({
      name: service.name,
      price: service.price,
      description: service.description,
      category: service.category,
      active: service.active
    });
    setModalVisible(true);
  };

  // Handle delete service using API service
  const handleDeleteService = async (serviceId) => {
    try {
      await apiService.deleteService(serviceId);
      message.success('Service deleted successfully.');
      fetchServices(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting service:', error);
      message.error('Failed to delete service.');
    }
  };

  // Handle toggle service active status using API service
  const handleToggleStatus = async (service) => {
    try {
      const updatedData = { 
        ...service, 
        active: !service.active 
      };
      await apiService.updateService(service._id, updatedData);
      message.success(`Service ${!service.active ? 'activated' : 'deactivated'} successfully.`);
      fetchServices(); // Refresh the list after update
    } catch (error) {
      console.error('Error updating service status:', error);
      message.error('Failed to update service status.');
    }
  };

  // Handle save service (create or update) using API service
  const handleSaveService = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (isEditing) {
        // Update existing service
        await apiService.updateService(currentService._id, values);
        message.success('Service updated successfully.');
      } else {
        // Create new service
        await apiService.createService(values);
        message.success('Service created successfully.');
      }
      
      setModalVisible(false);
      setLoading(false);
      fetchServices(); // Refresh the list after creating/updating
    } catch (error) {
      console.error('Error saving service:', error);
      message.error('Failed to save service. Please check the form.');
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

  // Format price for display
  const formatPrice = (price) => {
    return `Nrs ${price.toFixed(2)}`;
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Tag color="green" icon={<DollarOutlined />}>
          {formatPrice(price)}
        </Tag>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => {
        let color;
        switch(category) {
          case 'Fitness': color = 'blue'; break;
          case 'Wellness': color = 'purple'; break;
          default: color = 'default';
        }
        return (
          <Tag color={color} icon={<AppstoreOutlined />}>
            {category}
          </Tag>
        );
      },
      filters: [
        { text: 'Fitness', value: 'Fitness' },
        { text: 'Wellness', value: 'Wellness' },
      ],
      onFilter: (value, record) => record.category === value,
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
              onClick={() => handleEditService(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this service?"
              onConfirm={() => handleDeleteService(record._id)}
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

  // Expandable row to show description
  const expandedRowRender = (record) => {
    return (
      <p style={{ margin: 0 }}>
        <strong>Description:</strong> {record.description}
      </p>
    );
  };

  return (
    <Card
      title="Service Management"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddService}
        >
          Add Service
        </Button>
      }
    >
      <Table
        dataSource={services}
        columns={columns}
        rowKey="_id"
        loading={tableLoading}
        expandable={{
          expandedRowRender,
          rowExpandable: record => record.description && record.description.length > 0,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
      />

      {/* Service Form Modal */}
      <Modal
        title={isEditing ? "Edit Service" : "Create New Service"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSaveService}>
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
            label="Service Name"
            rules={[{ required: true, message: 'Please enter service name' }]}
          >
            <Input placeholder="Enter service name" />
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[
              { required: true, message: 'Please enter service price' },
              { type: 'number', min: 0, message: 'Price must be greater than or equal to 0' }
            ]}
          >
            <InputNumber
              min={0}
              formatter={value => `Nrs ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/[^\d.]/g, '')}
              style={{ width: '100%' }}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea 
              placeholder="Enter service description" 
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category">
              <Option value="Fitness">Fitness</Option>
              <Option value="Wellness">Wellness</Option>
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

export default ServicesPanel;