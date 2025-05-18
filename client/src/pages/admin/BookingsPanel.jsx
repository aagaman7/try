import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  InputNumber,
  Space,
  Card,
  Tag,
  message,
  Tooltip,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  UserOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import moment from "moment";
import apiService from "../../services/apiService";

const { RangePicker } = DatePicker;
const { Option } = Select;

const BookingsPanel = () => {
  // State variables
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [form] = Form.useForm();

  // Related data
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);

  // Filter and search states
  const [filterVisible, setFilterVisible] = useState(false);
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

  // Fetch data on component mount
  useEffect(() => {
    fetchBookings();
    fetchUsers();
    fetchPackages();
    fetchServices();
  }, []);

  // Fetch bookings with filters and sorting
  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Build query params for filtering and sorting
      const queryParams = {
        sortField,
        sortDirection
      };

      if (filters.userName) queryParams.userName = filters.userName;
      if (filters.userId) queryParams.userId = filters.userId;
      if (filters.status) queryParams.status = filters.status;
      if (filters.paymentInterval) queryParams.paymentInterval = filters.paymentInterval;

      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        queryParams.startDate = filters.dateRange[0].format("YYYY-MM-DD");
        queryParams.endDate = filters.dateRange[1].format("YYYY-MM-DD");
      }

      // Make API call using adminGetAllBookings instead of the previous method
      const response = await apiService.adminGetAllBookings(queryParams);
      
      // Check response structure and extract the bookings array
      const bookingsData = response.data || response;
      
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      message.error("Failed to load bookings data");
      setLoading(false);
    }
  };

  // Fetch related data for dropdowns
  const fetchUsers = async () => {
    try {
      const response = await apiService.adminGetAllUsers();
      
      // Handle the response based on its structure
      if (response && response.users && Array.isArray(response.users)) {
        setUsers(response.users);
      } else {
        setUsers(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      message.error("Failed to load users");
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await apiService.getPackages();
      setPackages(response);
    } catch (error) {
      console.error("Failed to fetch packages:", error);
      message.error("Failed to load packages");
    }
  };

  const fetchServices = async () => {
    try {
      const response = await apiService.getServices();
      setServices(response);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      message.error("Failed to load services");
    }
  };

  // Handle booking creation and editing
  const handleCreateBooking = () => {
    setIsEditing(false);
    setCurrentBooking(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditBooking = (record) => {
    setIsEditing(true);
    setCurrentBooking(record);

    // Format dates for the form
    const formValues = {
      ...record,
      startDate: record.startDate ? moment(record.startDate) : null,
      endDate: record.endDate ? moment(record.endDate) : null,
      customServices:
        record.customServices?.map((service) => 
          typeof service === 'object' ? service._id : service
        ) || [],
    };

    form.setFieldsValue(formValues);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleSaveBooking = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Format data for API
      const bookingData = {
        ...values,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        endDate: values.endDate?.format("YYYY-MM-DD"),
      };

      if (isEditing) {
        // Update existing booking - using the correct API method
        await apiService.put(`bookings/${currentBooking._id}`, bookingData);
        message.success("Booking updated successfully!");
      } else {
        // Create new booking
        await apiService.createBooking(bookingData);
        message.success("Booking created successfully!");
      }

      // Refresh bookings list
      fetchBookings();
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed to save booking:", error);
      message.error(
        "Error saving booking. Please check the form and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing booking details
  const handleViewBooking = (record) => {
    setCurrentBooking(record);
    setViewModalVisible(true);
  };

  // Handle filtering
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const applyFilters = () => {
    fetchBookings();
    setFilterVisible(false);
  };

  const resetFilters = () => {
    setFilters({
      userName: "",
      userId: "",
      dateRange: null,
      status: null,
      paymentInterval: null,
    });
    fetchBookings();
    setFilterVisible(false);
  };

  // Handle sorting
  const handleSort = (field) => {
    const newDirection =
      field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
    fetchBookings();
  };

  // Calculate total price based on selected package, services, and interval
  const calculateTotalPrice = (packageId, customServices, paymentInterval) => {
    const selectedPackage = packages.find((p) => p._id === packageId);
    if (!selectedPackage) return 0;

    let basePrice = selectedPackage.basePrice;

    // Add cost of custom services
    let servicesPrice = 0;
    if (customServices && customServices.length) {
      servicesPrice = customServices.reduce((total, serviceId) => {
        const service = services.find((s) => s._id === serviceId);
        return total + (service ? service.price : 0);
      }, 0);
    }

    // Apply discount/multiplier based on payment interval
    let multiplier = 1;
    switch (paymentInterval) {
      case "Monthly":
        multiplier = 1;
        break;
      case "3 Months":
        multiplier = 2.75; // 3 months with a slight discount
        break;
      case "Yearly":
        multiplier = 10; // 12 months with a significant discount
        break;
      default:
        multiplier = 1;
    }

    return (basePrice + servicesPrice) * multiplier;
  };

  // Watch form values for automatic total price calculation
  const handleFormValuesChange = (changedValues, allValues) => {
    if (
      changedValues.package ||
      changedValues.customServices ||
      changedValues.paymentInterval
    ) {
      const totalPrice = calculateTotalPrice(
        allValues.package,
        allValues.customServices,
        allValues.paymentInterval
      );
      form.setFieldsValue({ totalPrice });
    }
  };

  // Helper function to safely get user name from booking
  const getUserName = (booking) => {
    if (booking && booking.user) {
      if (typeof booking.user === 'object' && booking.user.name) {
        return booking.user.name;
      }
      
      // If user is just an ID, try to find user in users array
      if (typeof booking.user === 'string') {
        const foundUser = users.find(u => u._id === booking.user);
        return foundUser ? foundUser.name : 'Unknown User';
      }
    }
    return 'Unknown User';
  };

  // Helper function to safely get user email from booking
  const getUserEmail = (booking) => {
    if (booking && booking.user) {
      if (typeof booking.user === 'object' && booking.user.email) {
        return booking.user.email;
      }
      
      // If user is just an ID, try to find user in users array
      if (typeof booking.user === 'string') {
        const foundUser = users.find(u => u._id === booking.user);
        return foundUser ? foundUser.email : '';
      }
    }
    return '';
  };

  // Helper function to safely get package name from booking
  const getPackageName = (booking) => {
    if (booking && booking.package) {
      if (typeof booking.package === 'object' && booking.package.name) {
        return booking.package.name;
      }
      
      // If package is just an ID, try to find package in packages array
      if (typeof booking.package === 'string') {
        const foundPackage = packages.find(p => p._id === booking.package);
        return foundPackage ? foundPackage.name : 'Unknown Package';
      }
    }
    return 'Unknown Package';
  };

  // Table columns configuration
  const columns = [
    {
      title: (
        <div className="column-header">
          User
          <Button
            type="text"
            size="small"
            onClick={() => handleSort("user.name")}
          >
            {sortField === "user.name" ? (
              sortDirection === "asc" ? (
                <SortAscendingOutlined />
              ) : (
                <SortDescendingOutlined />
              )
            ) : (
              <SortAscendingOutlined style={{ color: "#d9d9d9" }} />
            )}
          </Button>
        </div>
      ),
      dataIndex: "user",
      key: "userName",
      render: (user, record) => (
        <Tooltip title={getUserEmail(record)}>
          <span>{getUserName(record)}</span>
        </Tooltip>
      ),
    },
    {
      title: (
        <div className="column-header">
          Package
          <Button
            type="text"
            size="small"
            onClick={() => handleSort("package.name")}
          >
            {sortField === "package.name" ? (
              sortDirection === "asc" ? (
                <SortAscendingOutlined />
              ) : (
                <SortDescendingOutlined />
              )
            ) : (
              <SortAscendingOutlined style={{ color: "#d9d9d9" }} />
            )}
          </Button>
        </div>
      ),
      dataIndex: "package",
      key: "packageName",
      render: (pkg, record) => getPackageName(record),
    },
    {
      title: (
        <div className="column-header">
          Start Date
          <Button
            type="text"
            size="small"
            onClick={() => handleSort("startDate")}
          >
            {sortField === "startDate" ? (
              sortDirection === "asc" ? (
                <SortAscendingOutlined />
              ) : (
                <SortDescendingOutlined />
              )
            ) : (
              <SortAscendingOutlined style={{ color: "#d9d9d9" }} />
            )}
          </Button>
        </div>
      ),
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => (text ? moment(text).format("MMM DD, YYYY") : "N/A"),
    },
    {
      title: (
        <div className="column-header">
          End Date
          <Button
            type="text"
            size="small"
            onClick={() => handleSort("endDate")}
          >
            {sortField === "endDate" ? (
              sortDirection === "asc" ? (
                <SortAscendingOutlined />
              ) : (
                <SortDescendingOutlined />
              )
            ) : (
              <SortAscendingOutlined style={{ color: "#d9d9d9" }} />
            )}
          </Button>
        </div>
      ),
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => (text ? moment(text).format("MMM DD, YYYY") : "N/A"),
    },
    {
      title: "Time Slot",
      dataIndex: "timeSlot",
      key: "timeSlot",
    },
    {
      title: "Payment",
      dataIndex: "paymentInterval",
      key: "paymentInterval",
      render: (text) => text || "N/A",
    },
    {
      title: (
        <div className="column-header">
          Total Price
          <Button
            type="text"
            size="small"
            onClick={() => handleSort("totalPrice")}
          >
            {sortField === "totalPrice" ? (
              sortDirection === "asc" ? (
                <SortAscendingOutlined />
              ) : (
                <SortDescendingOutlined />
              )
            ) : (
              <SortAscendingOutlined style={{ color: "#d9d9d9" }} />
            )}
          </Button>
        </div>
      ),
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (text) => (text ? `$${text.toFixed(2)}` : "$0.00"),
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
        return <Tag color={color}>{status || "Unknown"}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="primary"
              ghost
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewBooking(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Booking">
            <Button
              type="default"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditBooking(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Gym Bookings Management"
      extra={
        <Space>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterVisible(!filterVisible)}
          >
            Filters
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateBooking}
          >
            New Booking
          </Button>
        </Space>
      }
    >
      {/* Search and Filter Section */}
      {filterVisible && (
        <Card className="filter-card" size="small" style={{ marginBottom: 16 }}>
          <Form layout="inline" style={{ marginBottom: 16 }}>
            <Form.Item label="User Name">
              <Input
                placeholder="Search by name"
                value={filters.userName}
                onChange={(e) => handleFilterChange("userName", e.target.value)}
                prefix={<UserOutlined />}
              />
            </Form.Item>
            <Form.Item label="User ID">
              <Input
                placeholder="User ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </Form.Item>
            <Form.Item label="Date Range">
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange("dateRange", dates)}
              />
            </Form.Item>
            <Form.Item label="Status">
              <Select
                placeholder="Select status"
                allowClear
                style={{ width: 120 }}
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
              >
                <Option value="Active">Active</Option>
                <Option value="Expired">Expired</Option>
                <Option value="Cancelled">Cancelled</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Payment Interval">
              <Select
                placeholder="Select interval"
                allowClear
                style={{ width: 120 }}
                value={filters.paymentInterval}
                onChange={(value) =>
                  handleFilterChange("paymentInterval", value)
                }
              >
                <Option value="Monthly">Monthly</Option>
                <Option value="3 Months">3 Months</Option>
                <Option value="Yearly">Yearly</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={applyFilters}>
                  Apply
                </Button>
                <Button onClick={resetFilters}>Reset</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* Bookings Table */}
      <Table
        dataSource={bookings}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
        }}
      />

      {/* View Details Modal */}
      <Modal
        title="Booking Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {currentBooking && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Member Name">
              {getUserName(currentBooking)}
            </Descriptions.Item>
            <Descriptions.Item label="Member Email">
              {getUserEmail(currentBooking)}
            </Descriptions.Item>
            <Descriptions.Item label="Package">
              {getPackageName(currentBooking)}
            </Descriptions.Item>
            <Descriptions.Item label="Time Slot">
              {currentBooking.timeSlot}
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {currentBooking.startDate
                ? moment(currentBooking.startDate).format("MMM DD, YYYY")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {currentBooking.endDate
                ? moment(currentBooking.endDate).format("MMM DD, YYYY")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Interval">
              {currentBooking.paymentInterval || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Total Price">
              ${currentBooking.totalPrice ? currentBooking.totalPrice.toFixed(2) : "0.00"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                currentBooking.status === "Active"
                  ? "green"
                  : currentBooking.status === "Expired"
                  ? "volcano"
                  : "red"
              }>
                {currentBooking.status || "Unknown"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Workout Days/Week">
              {currentBooking.workoutDaysPerWeek}
            </Descriptions.Item>
            <Descriptions.Item label="Fitness Goals" span={2}>
              {currentBooking.goals ? currentBooking.goals.join(", ") : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Custom Services" span={2}>
              {currentBooking.customServices && currentBooking.customServices.length > 0
                ? currentBooking.customServices.map(service => {
                    const serviceObj = services.find(s => s._id === (typeof service === 'object' ? service._id : service));
                    return serviceObj ? serviceObj.name : '';
                  }).join(", ")
                : "None"}
            </Descriptions.Item>
            <Descriptions.Item label="Stripe Payment ID" span={2}>
              {currentBooking.stripePaymentId || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Booking Form Modal */}
      <Modal
        title={isEditing ? "Edit Booking" : "Create New Booking"}
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="cancel" onClick={handleModalClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSaveBooking}
          >
            Save
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleFormValuesChange}
        >
          <Form.Item
            name="user"
            label="Member"
            rules={[{ required: true, message: "Please select a member" }]}
          >
            <Select
              placeholder="Select member"
              showSearch
              optionFilterProp="children"
            >
              {users.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.name || `User ${user._id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="package"
            label="Package"
            rules={[{ required: true, message: "Please select a package" }]}
          >
            <Select placeholder="Select package">
              {packages.map((pkg) => (
                <Option key={pkg._id} value={pkg._id}>
                  {pkg.name} (${pkg.basePrice ? pkg.basePrice.toFixed(2) : "0.00"})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="customServices" label="Additional Services">
            <Select
              placeholder="Select additional services"
              mode="multiple"
              optionFilterProp="children"
            >
              {services.map((service) => (
                <Option key={service._id} value={service._id}>
                  {service.name} (${service.price ? service.price.toFixed(2) : "0.00"})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="timeSlot"
            label="Time Slot"
            rules={[{ required: true, message: "Please select a time slot" }]}
          >
            <Select placeholder="Select time slot">
              <Option value="Morning (6AM-12PM)">Morning (6AM-12PM)</Option>
              <Option value="Afternoon (12PM-5PM)">Afternoon (12PM-5PM)</Option>
              <Option value="Evening (5PM-10PM)">Evening (5PM-10PM)</Option>
              <Option value="Full Day Access">Full Day Access</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="workoutDaysPerWeek"
            label="Workout Days Per Week"
            rules={[
              { required: true, message: "Please enter workout days per week" },
            ]}
          >
            <InputNumber min={1} max={7} />
          </Form.Item>

          <Form.Item name="goals" label="Fitness Goals">
            <Select mode="tags" placeholder="Enter fitness goals">
              <Option value="Weight Loss">Weight Loss</Option>
              <Option value="Muscle Building">Muscle Building</Option>
              <Option value="Cardio">Cardio</Option>
              <Option value="Flexibility">Flexibility</Option>
              <Option value="Overall Fitness">Overall Fitness</Option>
              <Option value="Muscle Toning">Muscle Toning</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="paymentInterval"
            label="Payment Interval"
            rules={[
              { required: true, message: "Please select payment interval" },
            ]}
          >
            <Select placeholder="Select payment interval">
              <Option value="Monthly">Monthly</Option>
              <Option value="3 Months">3 Months (Save 8%)</Option>
              <Option value="Yearly">Yearly (Save 16%)</Option>
            </Select>
          </Form.Item>

          <Form.Item name="totalPrice" label="Total Price">
            <InputNumber
              min={0}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              disabled
            />
          </Form.Item>

          <Form.Item name="stripePaymentId" label="Stripe Payment ID">
            <Input placeholder="Enter Stripe payment ID (if available)" />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: "Please select end date" }]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="Active">Active</Option>
              <Option value="Expired">Expired</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx global>{`
        .column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .filter-card {
          background-color: #f5f5f5;
          border-radius: 4px;
          margin-bottom: 16px;
        }
      `}</style>
    </Card>
  );
};

export default BookingsPanel;