import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, Tag, Modal, Form, 
  Input, Select, Switch, message, Tooltip, Popconfirm,
  Upload, TimePicker, Avatar, InputNumber, List, DatePicker
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  CheckCircleOutlined, CloseCircleOutlined,
  UserOutlined, UploadOutlined, PhoneOutlined,
  MailOutlined, TrophyOutlined, CalendarOutlined,
  DollarOutlined, LoadingOutlined, StarOutlined,
  ClockCircleOutlined
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
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [showSlots, setShowSlots] = useState(false);
  const [selectedTrainerSlots, setSelectedTrainerSlots] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [loadingSlots, setLoadingSlots] = useState(false);

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
      setUploading(true);
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        setUploading(false);
        return false;
      }
      // Validate file size (max 5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        setUploading(false);
        return false;
      }
      setImageUrl(URL.createObjectURL(file));
      setImageFile(file);
      setUploading(false);
      return false; // Prevent Upload from auto-uploading
    } catch (error) {
      console.error('Upload handler error:', error);
      setUploading(false);
      message.error('Failed to process image');
      return false;
    }
  };

  // Handle add new trainer
  const handleAddTrainer = () => {
    setIsEditing(false);
    setCurrentTrainer(null);
    setImageUrl('');
    setImageFile(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      availability: [{ date: null, startTime: null, endTime: null }]
    });
    setModalVisible(true);
  };

  // Handle edit trainer
  const handleEditTrainer = (trainer) => {
    setIsEditing(true);
    setCurrentTrainer(trainer);
    setImageUrl(trainer.image);
    setImageFile(null);
    
    // Convert availability times to dayjs objects for TimePicker and DatePicker
    const formattedAvailability = trainer.availability?.map(slot => ({
      ...slot,
      date: slot.date ? dayjs(slot.date) : null,
      startTime: slot.startTime ? dayjs(slot.startTime, 'HH:mm') : null,
      endTime: slot.endTime ? dayjs(slot.endTime, 'HH:mm') : null
    })) || [];

    form.setFieldsValue({
      name: trainer.name,
      bio: trainer.bio,
      isActive: trainer.isActive,
      pricePerSession: trainer.pricePerSession,
      qualifications: trainer.qualifications,
      specializations: trainer.specializations,
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
      // Format availability times and dates
      const formattedAvailability = values.availability?.map(slot => ({
        date: slot.date?.format('YYYY-MM-DD'),
        startTime: slot.startTime?.format('HH:mm'),
        endTime: slot.endTime?.format('HH:mm')
      })).filter(slot => slot.date && slot.startTime && slot.endTime);

      const trainerData = {
        ...values,
        image: imageFile,
        availability: JSON.stringify(formattedAvailability),
        qualifications: JSON.stringify(values.qualifications || []),
        specializations: JSON.stringify(values.specializations || [])
      };

      if (isEditing) {
        await apiService.adminUpdateTrainer(currentTrainer._id, trainerData);
        message.success('Trainer updated successfully.');
      } else {
        await apiService.adminCreateTrainer(trainerData);
        message.success('Trainer created successfully.');
      }
      setModalVisible(false);
      setImageFile(null);
      setImageUrl('');
      setLoading(false);
      fetchTrainers();
    } catch (error) {
      console.error('Error saving trainer:', error);
      message.error('Failed to save trainer.');
      setLoading(false);
    }
  };

  // Handle view bookings
  const handleViewBookings = async (trainerId) => {
    try {
      const response = await apiService.adminGetTrainerBookings(trainerId);
      setBookings(response);
      setShowBookings(true);
    } catch (error) {
      message.error('Failed to fetch trainer bookings.');
    }
  };

  // Add this new function after handleViewBookings
  const handleViewSlots = async (trainer) => {
    try {
      setLoadingSlots(true);
      setSelectedTrainerSlots(trainer);
      const slots = await apiService.getTrainerAvailableSlots(trainer._id);
      
      const groupedSlots = slots.reduce((acc, slot) => {
        const slotDate = new Date(slot.date);
        const dateKey = slotDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push({ ...slot, dateObj: slotDate });
        return acc;
      }, {});
      
      setAvailableSlots(groupedSlots);
      setShowSlots(true);
    } catch (err) {
      message.error('Failed to fetch trainer slots.');
    } finally {
      setLoadingSlots(false);
    }
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
            <div className="text-gray-500 text-sm">
              {record.specializations?.join(', ')}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Rating',
      key: 'rating',
      render: (_, record) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          <span>{record.averageRating.toFixed(1)}</span>
          <span className="text-gray-500">({record.totalRatings})</span>
        </Space>
      ),
      sorter: (a, b) => a.averageRating - b.averageRating,
    },
    {
      title: 'Price',
      dataIndex: 'pricePerSession',
      key: 'pricePerSession',
      render: (price) => (
        <Tag color="blue" icon={<DollarOutlined />}>
          Nrs {price}
        </Tag>
      ),
      sorter: (a, b) => a.pricePerSession - b.pricePerSession,
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Slots">
            <Button
              type="primary"
              onClick={() => handleViewSlots(record)}
            >
              Slots
            </Button>
          </Tooltip>
          <Tooltip title="View Bookings">
            <Button
              type="primary"
              onClick={() => handleViewBookings(record._id)}
            >
              Bookings
            </Button>
          </Tooltip>
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
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
      />

      {/* Trainer Form Modal */}
      <Modal
        title={isEditing ? "Edit Trainer" : "Add New Trainer"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setImageFile(null);
          setImageUrl('');
        }}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalVisible(false);
            setImageFile(null);
            setImageUrl('');
          }}>
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
                label="Profile Image"
              >
                <Upload
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={handleImageUpload}
                  disabled={uploading}
                  accept="image/*"
                >
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt="avatar" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div>
                      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                      <div style={{ marginTop: 8 }}>{uploading ? 'Uploading...' : 'Upload'}</div>
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
                name="pricePerSession"
                label="Price per Session"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  prefix={<DollarOutlined />}
                  placeholder="Enter price"
                  min={0}
                  step={0.01}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </div>

            <div>
              <Form.Item
                name="specializations"
                label="Specializations"
                rules={[{ required: true, message: 'Please enter specializations' }]}
              >
                <Select
                  mode="tags"
                  placeholder="Enter specializations"
                  tokenSeparators={[',']}
                />
              </Form.Item>

              <Form.Item
                name="qualifications"
                label="Qualifications"
                rules={[{ required: true, message: 'Please enter qualifications' }]}
              >
                <Select
                  mode="tags"
                  placeholder="Enter qualifications"
                  tokenSeparators={[',']}
                />
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
                name="isActive"
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
              <Button type="dashed" onClick={() => {
                const availability = form.getFieldValue('availability') || [];
                form.setFieldsValue({
                  availability: [...availability, { date: null, startTime: null, endTime: null }]
                });
              }} icon={<PlusOutlined />}>
                Add Time Slot
              </Button>
            </div>

            <Form.List name="availability">
              {(fields, { add, remove }) => (
                <div className="grid gap-4">
                  {fields.map((field, index) => (
                    <div key={field.key} className="flex items-center gap-4 bg-gray-50 p-4 rounded">
                      <Form.Item
                        name={[field.name, 'date']}
                        label="Date"
                        className="mb-0 flex-1"
                        rules={[{ required: true, message: 'Please select a date' }]}
                      >
                        <DatePicker 
                          className="w-full" 
                          format="YYYY-MM-DD"
                          disabledDate={(current) => {
                            return current && current < dayjs().startOf('day');
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'startTime']}
                        label="Start Time"
                        className="mb-0 flex-1"
                        rules={[{ required: true, message: 'Please select start time' }]}
                      >
                        <TimePicker format="HH:mm" className="w-full" />
                      </Form.Item>

                      <Form.Item
                        name={[field.name, 'endTime']}
                        label="End Time"
                        className="mb-0 flex-1"
                        rules={[{ required: true, message: 'Please select end time' }]}
                      >
                        <TimePicker format="HH:mm" className="w-full" />
                      </Form.Item>

                      <Button
                        type="text"
                        danger
                        className="mt-6"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(field.name)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Form.List>
          </div>
        </Form>
      </Modal>

      {/* Bookings Modal */}
      <Modal
        title="Trainer Bookings"
        open={showBookings}
        onCancel={() => setShowBookings(false)}
        width={800}
        footer={null}
      >
        <List
          dataSource={bookings}
          renderItem={booking => (
            <List.Item
              actions={[
                <Select
                  key="status"
                  value={booking.status}
                  style={{ minWidth: 120 }}
                  onChange={async (newStatus) => {
                    try {
                      await apiService.adminUpdateTrainerBookingStatus(booking._id, newStatus);
                      message.success('Booking status updated');
                      // Update local state
                      setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: newStatus } : b));
                    } catch (err) {
                      message.error('Failed to update status');
                    }
                  }}
                >
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="confirmed">Confirmed</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="cancelled">Cancelled</Select.Option>
                </Select>
              ]}
            >
              <List.Item.Meta
                title={`Booking on ${new Date(booking.bookingDate).toLocaleDateString()}`}
                description={
                  <Space direction="vertical">
                    <div>Time: {booking.startTime} - {booking.endTime}</div>
                    <div>Status: <Tag color={
                      booking.status === 'confirmed' ? 'success' :
                      booking.status === 'pending' ? 'warning' :
                      booking.status === 'cancelled' ? 'error' : 'default'
                    }>{booking.status}</Tag></div>
                    <div>User: {booking.user?.name}</div>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>

      {/* Slots Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>Trainer Available Slots</span>
          </Space>
        }
        open={showSlots}
        onCancel={() => {
          setShowSlots(false);
          setAvailableSlots({});
        }}
        width={800}
        footer={null}
        className="trainer-slots-modal"
      >
        {loadingSlots ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : Object.keys(availableSlots).length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg dark:bg-gray-800">
            <p className="text-gray-600 dark:text-gray-400">No available slots found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedTrainerSlots && (
              <div className="bg-black rounded-2xl shadow-xl p-6 mb-6">
                <div className="flex items-center space-x-4">
                  <Avatar 
                    src={selectedTrainerSlots.image} 
                    icon={<UserOutlined />} 
                    size={64}
                    className="border-2 border-white"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedTrainerSlots.name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <StarOutlined className="text-rose-500" />
                      <span className="text-white">{selectedTrainerSlots.averageRating.toFixed(1)}</span>
                      <span className="text-gray-400">({selectedTrainerSlots.totalRatings})</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {Object.entries(availableSlots).map(([date, slots]) => (
              <div key={date} className="bg-black rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">{date}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <ClockCircleOutlined className="text-rose-500 text-xl mb-2" />
                      <span className="font-medium text-white">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default TrainerPanel;