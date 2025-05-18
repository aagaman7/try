import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Tag, Modal, Form, 
  Input, Select, Switch, message, Tooltip, Popconfirm,
  Upload, TimePicker, Avatar
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  CheckCircleOutlined, CloseCircleOutlined,
  UserOutlined, UploadOutlined, PhoneOutlined,
  MailOutlined, TrophyOutlined, CalendarOutlined
} from '@ant-design/icons';
import apiService from '../../services/apiService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const TrainerPanel = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState(null);
  const [form] = Form.useForm();
  const [tableLoading, setTableLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  // Days of the week for availability
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday'
  ];

  // Fetch trainers on component mount
  useEffect(() => {
    fetchTrainers();
  }, []);

  // Fetch trainers function
  const fetchTrainers = async () => {
    setTableLoading(true);
    try {
      const response = await apiService.adminGetAllTrainers();
      setTrainers(response);
      setTableLoading(false);
    } catch (error) {
      console.error('Error fetching trainers:', error);
      message.error('Failed to fetch trainers.');
      setTableLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    try {
      // Here you would typically upload the file to your server or cloud storage
      // For now, we'll just create a local URL
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return false; // Prevent default upload behavior
    } catch (error) {
      message.error('Failed to upload image.');
      return false;
    }
  };

  // Handle add new trainer
  const handleAddTrainer = () => {
    setIsEditing(false);
    setCurrentTrainer(null);
    setImageUrl('');
    form.resetFields();
    form.setFieldsValue({
      active: true,
      availability: [{ day: 'Monday', startTime: null, endTime: null }]
    });
    setModalVisible(true);
  };

  // Handle edit trainer
  const handleEditTrainer = (trainer) => {
    setIsEditing(true);
    setCurrentTrainer(trainer);
    setImageUrl(trainer.image);
    
    // Convert availability times to dayjs objects for TimePicker
    const formattedAvailability = trainer.availability?.map(slot => ({
      ...slot,
      startTime: slot.startTime ? dayjs(slot.startTime, 'HH:mm') : null,
      endTime: slot.endTime ? dayjs(slot.endTime, 'HH:mm') : null
    })) || [];

    form.setFieldsValue({
      name: trainer.name,
      email: trainer.email,
      phone: trainer.phone,
      specialization: trainer.specialization,
      bio: trainer.bio,
      active: trainer.isActive,
      availability: formattedAvailability
    });
    setModalVisible(true);
  };

  // Handle delete trainer
  const handleDeleteTrainer = async (trainerId) => {
    try {
      await apiService.adminDeleteTrainer(trainerId);
      message.success('Trainer deleted successfully.');
      fetchTrainers();
    } catch (error) {
      console.error('Error deleting trainer:', error);
      message.error('Failed to delete trainer.');
    }
  };

  // Handle save trainer
  const handleSaveTrainer = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format availability times
      const formattedAvailability = values.availability?.map(slot => ({
        day: slot.day,
        startTime: slot.startTime?.format('HH:mm'),
        endTime: slot.endTime?.format('HH:mm')
      })).filter(slot => slot.day && slot.startTime && slot.endTime);

      const trainerData = {
        ...values,
        image: imageUrl || '/api/placeholder/300/300',
        availability: formattedAvailability
      };

      if (isEditing) {
        await apiService.adminUpdateTrainer(currentTrainer._id, trainerData);
        message.success('Trainer updated successfully.');
      } else {
        await apiService.adminAddTrainer(trainerData);
        message.success('Trainer created successfully.');
      }

      setModalVisible(false);
      setLoading(false);
      fetchTrainers();
    } catch (error) {
      console.error('Error saving trainer:', error);
      message.error('Failed to save trainer.');
      setLoading(false);
    }
  };

  // Add availability slot
  const handleAddAvailability = () => {
    const availability = form.getFieldValue('availability') || [];
    form.setFieldsValue({
      availability: [...availability, { day: undefined, startTime: null, endTime: null }]
    });
  };

  // Remove availability slot
  const handleRemoveAvailability = (index) => {
    const availability = form.getFieldValue('availability');
    form.setFieldsValue({
      availability: availability.filter((_, i) => i !== index)
    });
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
      title: 'Trainer',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar src={record.image} icon={<UserOutlined />} />
          <div>
            <div><strong>{text}</strong></div>
            <div className="text-gray-500 text-sm">{record.specialization}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>
            <MailOutlined className="mr-2" />{record.email}
          </span>
          <span>
            <PhoneOutlined className="mr-2" />{record.phone || 'N/A'}
          </span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <Tag color={active ? 'success' : 'error'} icon={active ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
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
          <Tooltip title="Edit">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => handleEditTrainer(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this trainer?"
              onConfirm={() => handleDeleteTrainer(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Expandable row to show availability and bio
  const expandedRowRender = (record) => {
    return (
      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Bio</h4>
          <p>{record.bio || 'No bio available'}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Availability</h4>
          {record.availability && record.availability.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {record.availability.map((slot, index) => (
                <Tag key={index} className="p-2">
                  <CalendarOutlined className="mr-2" />
                  {slot.day}: {slot.startTime} - {slot.endTime}
                </Tag>
              ))}
            </div>
          ) : (
            <p>No availability set</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          <span>Trainer Management</span>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddTrainer}
        >
          Add Trainer
        </Button>
      }
    >
      <Table
        dataSource={trainers}
        columns={columns}
        rowKey="_id"
        loading={tableLoading}
        expandable={{
          expandedRowRender,
          rowExpandable: record => true,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
      />

      {/* Trainer Form Modal */}
      <Modal
        title={isEditing ? "Edit Trainer" : "Add New Trainer"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={handleSaveTrainer}>
            Save
          </Button>
        ]}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Form.Item
                name="image"
                label="Profile Image"
              >
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter trainer name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Enter trainer name" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
              </Form.Item>
            </div>

            <div>
              <Form.Item
                name="specialization"
                label="Specialization"
                rules={[{ required: true, message: 'Please enter specialization' }]}
              >
                <Input prefix={<TrophyOutlined />} placeholder="Enter specialization" />
              </Form.Item>

              <Form.Item
                name="bio"
                label="Bio"
                rules={[{ required: true, message: 'Please enter trainer bio' }]}
              >
                <TextArea 
                  placeholder="Enter trainer bio" 
                  rows={4}
                  maxLength={500}
                  showCount
                />
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
            </div>
          </div>

          {/* Availability Section */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Availability</h3>
              <Button type="dashed" onClick={handleAddAvailability} icon={<PlusOutlined />}>
                Add Time Slot
              </Button>
            </div>

            <Form.List name="availability">
              {(fields, { add, remove }) => (
                <div className="grid gap-4">
                  {fields.map((field, index) => (
                    <div key={field.key} className="flex items-center gap-4 bg-gray-50 p-4 rounded">
                      <Form.Item
                        {...field}
                        name={[field.name, 'day']}
                        label="Day"
                        className="mb-0 flex-1"
                      >
                        <Select placeholder="Select day">
                          {daysOfWeek.map(day => (
                            <Option key={day} value={day}>{day}</Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, 'startTime']}
                        label="Start Time"
                        className="mb-0 flex-1"
                      >
                        <TimePicker format="HH:mm" className="w-full" />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, 'endTime']}
                        label="End Time"
                        className="mb-0 flex-1"
                      >
                        <TimePicker format="HH:mm" className="w-full" />
                      </Form.Item>

                      <Button
                        type="text"
                        danger
                        className="mt-6"
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveAvailability(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Form.List>
          </div>
        </Form>
      </Modal>
    </Card>
  );
};

export default TrainerPanel;