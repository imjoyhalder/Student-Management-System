import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import InputGroup from 'react-bootstrap/InputGroup';
import { useNavigate } from "react-router";
import axios from "axios";
import { 
  FaUserGraduate, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaPhone, 
  FaBuilding,
  FaIdCard,
  FaUser,
  FaEnvelope,
  FaBook,
  FaUsers,
  FaCalendarAlt,
  FaChartLine,
  FaVenusMars,
  FaTint,
  FaHome,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaSchool,
  FaUpload,
  FaImage,
  FaEye,
  FaGlobe,
  FaHeart,
  FaUserFriends,
  FaGraduationCap,
  FaAward,
  FaUniversity,
  FaIdBadge,
  FaMobile,
  FaMapPin,
  FaFilter,
  FaSearch,
  FaSync
} from 'react-icons/fa';
import './Student.css';

const Student = () => {
  let navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [update, setUpdate] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState("");
  const [currentStudent, setCurrentStudent] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Filter states
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    search: ""
  });

  const [formData, setFormData] = useState({
    studentname: "",
    departmentname: "",
    studentid: "",
    phonenumber: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    fatherName: "",
    motherName: "",
    parentPhone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Bangladesh",
    semester: "",
    batch: "",
    rollNumber: "",
    courseDuration: "4 Years",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    previousSchool: "",
    previousGrade: "",
    admissionTestScore: ""
  });

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Get unique departments and semesters for filters
  const departments = [...new Set(studentList.map(student => student.departmentname).filter(Boolean))];
  const semesters = [...new Set(studentList.map(student => student.semester).filter(Boolean))];

  // Apply filters
  const applyFilters = () => {
    let filtered = studentList;

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(student => 
        student.departmentname === filters.department
      );
    }

    // Semester filter
    if (filters.semester) {
      filtered = filtered.filter(student => 
        student.semester === filters.semester
      );
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(student =>
        student.studentname.toLowerCase().includes(searchTerm) ||
        student.studentid.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        student.rollNumber.toLowerCase().includes(searchTerm) ||
        student.phonenumber.includes(searchTerm)
      );
    }

    setFilteredStudents(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      department: "",
      semester: "",
      search: ""
    });
    setFilteredStudents(studentList);
  };

  // Get filter counts
  const getFilterCounts = () => {
    return {
      total: studentList.length,
      filtered: filteredStudents.length,
      department: filters.department ? studentList.filter(s => s.departmentname === filters.department).length : 0,
      semester: filters.semester ? studentList.filter(s => s.semester === filters.semester).length : 0
    };
  };

  const filterCounts = getFilterCounts();

  const handleClose = async () => {
    try {
      setSaving(true);
      
      const submitData = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append profile image if exists
      if (profileImage) {
        submitData.append("profileImage", profileImage);
      }

      await axios.post("http://localhost:8000/createstudent", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      showAlert('✅ Student created successfully!');
      fetchStudents();
      handleCloseModal();
    } catch (error) {
      console.error("Error creating student:", error);
      showAlert(error.response?.data || '❌ Error creating student', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseForUpdate = async () => {
    try {
      setSaving(true);
      
      const submitData = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });
      
      // Append profile image if exists
      if (profileImage) {
        submitData.append("profileImage", profileImage);
      }

      await axios.patch(`http://localhost:8000/updatestudent/${currentStudentId}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      showAlert('✅ Student updated successfully!');
      fetchStudents();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating student:", error);
      showAlert(error.response?.data || '❌ Error updating student', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShow(false);
    setUpdate(false);
    setCurrentStudentId("");
    setProfileImage(null);
    setImagePreview("");
    resetForm();
  };

  const handleCloseDetailsModal = () => {
    setShowDetails(false);
    setCurrentStudent(null);
  };

  const handleShow = () => {
    resetForm();
    setUpdate(false);
    setShow(true);
  };

  const handleShowModal = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/student/${id}`);
      const student = response.data;
      
      setFormData({
        studentname: student.studentname || "",
        departmentname: student.departmentname || "",
        studentid: student.studentid || "",
        phonenumber: student.phonenumber || "",
        email: student.email || "",
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : "",
        gender: student.gender || "",
        bloodGroup: student.bloodGroup || "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        parentPhone: student.parentPhone || "",
        street: student.address?.street || "",
        city: student.address?.city || "",
        state: student.address?.state || "",
        zipCode: student.address?.zipCode || "",
        country: student.address?.country || "Bangladesh",
        semester: student.semester || "",
        batch: student.batch || "",
        rollNumber: student.rollNumber || "",
        courseDuration: student.courseDuration || "4 Years",
        emergencyContactName: student.emergencyContact?.name || "",
        emergencyContactRelationship: student.emergencyContact?.relationship || "",
        emergencyContactPhone: student.emergencyContact?.phone || "",
        previousSchool: student.academicInfo?.previousSchool || "",
        previousGrade: student.academicInfo?.previousGrade || "",
        admissionTestScore: student.academicInfo?.admissionTestScore || ""
      });

      if (student.profileImage) {
        setImagePreview(`http://localhost:8000/${student.profileImage}`);
      }

      setUpdate(true);
      setCurrentStudentId(id);
      setShow(true);
    } catch (error) {
      console.error("Error fetching student:", error);
      showAlert('❌ Error fetching student details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/student/${id}`);
      setCurrentStudent(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error("Error fetching student details:", error);
      showAlert('❌ Error fetching student details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      axios.post("http://localhost:8000/delete", { id: id })
        .then(() => {
          showAlert('✅ Student deleted successfully!');
          fetchStudents();
        })
        .catch((error) => {
          console.error("Error deleting student:", error);
          showAlert('❌ Error deleting student', 'danger');
        });
    }
  };

  const fetchStudents = () => {
    setLoading(true);
    axios.get("http://localhost:8000/allstudent")
      .then((data) => {
        setStudentList(data.data);
        setFilteredStudents(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        showAlert('❌ Error fetching students', 'danger');
        setLoading(false);
      });
  };

  const resetForm = () => {
    setFormData({
      studentname: "",
      departmentname: "",
      studentid: "",
      phonenumber: "",
      email: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      fatherName: "",
      motherName: "",
      parentPhone: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Bangladesh",
      semester: "",
      batch: "",
      rollNumber: "",
      courseDuration: "4 Years",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      previousSchool: "",
      previousGrade: "",
      admissionTestScore: ""
    });
    setProfileImage(null);
    setImagePreview("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showAlert('❌ Please select an image file', 'warning');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert('❌ Image size should be less than 5MB', 'warning');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'secondary';
      case 'Suspended': return 'warning';
      case 'Graduated': return 'info';
      case 'Dropout': return 'danger';
      default: return 'secondary';
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    let data = localStorage.getItem("userInfo");
    if (!data) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, studentList]);

  return (
    <div className="student-page">
      <Sidebar />
      <div className="main-content">
        <Container fluid>
          {/* Alert Section */}
          {alert.show && (
            <Row className="mb-3">
              <Col>
                <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false, message: '', type: '' })}>
                  {alert.message}
                </Alert>
              </Col>
            </Row>
          )}

          {/* Header Section */}
          <Row className="mb-4">
            <Col>
              <div className="page-header">
                <h1 className="page-title">
                  <FaUserGraduate className="me-2" />
                  Student Management
                </h1>
                <p className="page-subtitle">Manage all students and their information</p>
              </div>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                onClick={handleShow}
                className="add-student-btn mt-20"
              >
                <FaPlus className="me-2" />
                Add Student
              </Button>
            </Col>
          </Row>

          {/* Filter Section */}
          <Card className="mb-4 filter-card">
            <Card.Header className="filter-header">
              <h6 className="mb-0">
                <FaFilter className="me-2" />
                Filters
                <Badge bg="primary" className="ms-2">
                  {filterCounts.filtered} / {filterCounts.total}
                </Badge>
              </h6>
              <Button 
                size="sm" 
                variant="outline-secondary" 
                onClick={clearFilters}
                disabled={!filters.department && !filters.semester && !filters.search}
              >
                <FaSync className="me-1" />
                Clear
              </Button>
            </Card.Header>
            <Card.Body>
              <Row>
                {/* Search Filter */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaSearch className="me-2" />
                      Search Students
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search by name, ID, email, roll..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>

                {/* Department Filter */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaBuilding className="me-2" />
                      Department
                    </Form.Label>
                    <Form.Select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>
                          {dept} ({studentList.filter(s => s.departmentname === dept).length})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Semester Filter */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FaCalendarAlt className="me-2" />
                      Semester
                    </Form.Label>
                    <Form.Select
                      value={filters.semester}
                      onChange={(e) => handleFilterChange('semester', e.target.value)}
                    >
                      <option value="">All Semesters</option>
                      {semesters.map(sem => (
                        <option key={sem} value={sem}>
                          {sem} Semester ({studentList.filter(s => s.semester === sem).length})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Active Filters Display */}
              {(filters.department || filters.semester || filters.search) && (
                <Row>
                  <Col>
                    <div className="active-filters">
                      <small className="text-muted">Active Filters: </small>
                      {filters.department && (
                        <Badge bg="primary" className="ms-2">
                          Department: {filters.department}
                          <span className="ms-1 cursor-pointer" onClick={() => handleFilterChange('department', '')}>×</span>
                        </Badge>
                      )}
                      {filters.semester && (
                        <Badge bg="info" className="ms-2">
                          Semester: {filters.semester}
                          <span className="ms-1 cursor-pointer" onClick={() => handleFilterChange('semester', '')}>×</span>
                        </Badge>
                      )}
                      {filters.search && (
                        <Badge bg="warning" className="ms-2">
                          Search: {filters.search}
                          <span className="ms-1 cursor-pointer" onClick={() => handleFilterChange('search', '')}>×</span>
                        </Badge>
                      )}
                    </div>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Student Table */}
          <Card className="student-table-card">
            <Card.Header className="table-header">
              <h5 className="table-title">
                <FaUserGraduate className="me-2" />
                Student List
                {filterCounts.filtered !== filterCounts.total && (
                  <small className="text-muted ms-2">
                    (Showing {filterCounts.filtered} of {filterCounts.total})
                  </small>
                )}
              </h5>
              <div>
                <Badge bg="primary" className="count-badge me-2">
                  {filterCounts.filtered} Students
                </Badge>
                {(filters.department || filters.semester) && (
                  <Button 
                    size="sm" 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                  >
                    <FaSync className="me-1" />
                    Show All
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading && studentList.length === 0 ? (
                <div className="loading-state">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p>Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="loading-state">
                  <FaUserGraduate className="empty-icon" />
                  <p>
                    {studentList.length === 0 ? 'No students found' : 'No students match your filters'}
                  </p>
                  {studentList.length === 0 ? (
                    <Button variant="primary" onClick={handleShow}>
                      <FaPlus className="me-2" />
                      Add First Student
                    </Button>
                  ) : (
                    <Button variant="outline-primary" onClick={clearFilters}>
                      <FaSync className="me-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="student-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student Information</th>
                        <th className="d-none d-md-table-cell">Department</th>
                        <th className="d-none d-lg-table-cell">Student ID</th>
                        <th className="d-none d-xl-table-cell">Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((item, index) => (
                        <tr key={item._id}>
                          <td>
                            <Badge bg="light" text="dark" className="serial-badge">
                              {index + 1}
                            </Badge>
                          </td>
                          <td>
                            <div className="student-info">
                              <div className="student-avatar">
                                {item.profileImage ? (
                                  <img 
                                    src={`http://localhost:8000/${item.profileImage}`} 
                                    alt={item.studentname}
                                    className="avatar-image"
                                  />
                                ) : (
                                  <FaUser />
                                )}
                              </div>
                              <div className="student-details">
                                <h6 className="student-name">{item.studentname}</h6>
                                <small className="text-muted">
                                  Roll: {item.rollNumber}
                                </small>
                                <small className="text-muted d-md-none d-block">
                                  <FaBuilding className="me-1" />
                                  {item.departmentname}
                                </small>
                                <small className="text-muted d-md-none d-block">
                                  <FaEnvelope className="me-1" />
                                  {item.email}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="d-none d-md-table-cell">
                            <span className="department">
                              <FaBuilding className="me-1" />
                              {item.departmentname}
                            </span>
                          </td>
                          <td className="d-none d-lg-table-cell">
                            <span className="student-id">
                              <FaIdCard className="me-1" />
                              {item.studentid}
                            </span>
                          </td>
                          <td className="d-none d-xl-table-cell">
                            <span className="email">
                              <FaEnvelope className="me-1" />
                              {item.email}
                            </span>
                          </td>
                          <td>
                            <span className="phone">
                              <FaPhone className="me-1" />
                              {item.phonenumber}
                            </span>
                          </td>
                          <td>
                            <Badge 
                              bg={getStatusVariant(item.status)} 
                              className="status-badge"
                            >
                              {item.status || 'Active'}
                            </Badge>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <Button 
                                size="sm" 
                                variant="outline-info" 
                                className="me-1 action-btn"
                                onClick={() => handleViewDetails(item._id)}
                                title="View Details"
                              >
                                <FaEye />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-primary" 
                                className="me-1 action-btn"
                                onClick={() => handleShowModal(item._id)}
                                title="Edit Student"
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-danger"
                                className="action-btn"
                                onClick={() => handleDelete(item._id)}
                                title="Delete Student"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Container>

        {/* Add/Edit Student Modal */}
        <Modal show={show} onHide={handleCloseModal} centered className="student-modal" size="lg">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>
              <FaUserGraduate className="me-2" />
              {update ? "Edit Student" : "Add New Student"}
            </Modal.Title>
          </Modal.Header>
          <Form>
            <Modal.Body>
              {/* Profile Image Upload */}
              <Row className="mb-4">
                <Col className="text-center">
                  <div className="profile-image-section">
                    <div className="image-preview">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile Preview" className="preview-image" />
                      ) : (
                        <div className="image-placeholder">
                          <FaUser size={40} />
                          <span>Profile Image</span>
                        </div>
                      )}
                    </div>
                    <Form.Group controlId="profileImage" className="mt-3">
                      <Form.Label className="btn btn-outline-primary btn-sm">
                        <FaUpload className="me-2" />
                        {update ? "Change Profile Image" : "Upload Profile Image"}
                      </Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </Form.Group>
                    <Form.Text className="text-muted">
                      Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                    </Form.Text>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="studentName">
                    <Form.Label>
                      <FaUser className="me-2" />
                      Student Name *
                    </Form.Label>
                    <Form.Control
                      name="studentname"
                      value={formData.studentname}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter full name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="studentId">
                    <Form.Label>
                      <FaIdCard className="me-2" />
                      Student ID *
                    </Form.Label>
                    <Form.Control
                      name="studentid"
                      value={formData.studentid}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter student ID"
                      required
                      disabled={update}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label>
                      <FaEnvelope className="me-2" />
                      Email Address *
                    </Form.Label>
                    <Form.Control
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                      placeholder="Enter email address"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="phoneNumber">
                    <Form.Label>
                      <FaPhone className="me-2" />
                      Phone Number *
                    </Form.Label>
                    <Form.Control
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleInputChange}
                      type="tel"
                      placeholder="Enter phone number"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="dateOfBirth">
                    <Form.Label>
                      <FaBirthdayCake className="me-2" />
                      Date of Birth *
                    </Form.Label>
                    <Form.Control
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      type="date"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="gender">
                    <Form.Label>
                      <FaVenusMars className="me-2" />
                      Gender *
                    </Form.Label>
                    <Form.Select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="department">
                    <Form.Label>
                      <FaBuilding className="me-2" />
                      Department *
                    </Form.Label>
                    <Form.Select
                      name="departmentname"
                      value={formData.departmentname}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Department</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="English">English</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="bloodGroup">
                    <Form.Label>
                      <FaTint className="me-2" />
                      Blood Group
                    </Form.Label>
                    <Form.Select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="fatherName">
                    <Form.Label>Father's Name *</Form.Label>
                    <Form.Control
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter father's name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="motherName">
                    <Form.Label>Mother's Name *</Form.Label>
                    <Form.Control
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter mother's name"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="rollNumber">
                    <Form.Label>Roll Number *</Form.Label>
                    <Form.Control
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter roll number"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="semester">
                    <Form.Label>
                      <FaCalendarAlt className="me-2" />
                      Semester *
                    </Form.Label>
                    <Form.Select
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Semester</option>
                      <option value="1st">1st Semester</option>
                      <option value="2nd">2nd Semester</option>
                      <option value="3rd">3rd Semester</option>
                      <option value="4th">4th Semester</option>
                      <option value="5th">5th Semester</option>
                      <option value="6th">6th Semester</option>
                      <option value="7th">7th Semester</option>
                      <option value="8th">8th Semester</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="batch">
                    <Form.Label>Batch *</Form.Label>
                    <Form.Control
                      name="batch"
                      value={formData.batch}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="e.g., 2023-2024"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="parentPhone">
                    <Form.Label>Parent's Phone</Form.Label>
                    <Form.Control
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                      type="tel"
                      placeholder="Enter parent's phone number"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <hr />
              <h6 className="mb-3">
                <FaHome className="me-2" />
                Address Information
              </h6>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3" controlId="street">
                    <Form.Label>Street Address *</Form.Label>
                    <Form.Control
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter street address"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="city">
                    <Form.Label>City *</Form.Label>
                    <Form.Control
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter city"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="state">
                    <Form.Label>State *</Form.Label>
                    <Form.Control
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter state"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="zipCode">
                    <Form.Label>ZIP Code *</Form.Label>
                    <Form.Control
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter ZIP code"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button variant="outline-secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={update ? handleCloseForUpdate : handleClose}
                disabled={saving}
                className="submit-btn"
              >
                {saving ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {update ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {update ? <FaEdit className="me-2" /> : <FaPlus className="me-2" />}
                    {update ? "Update Student" : "Create Student"}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Student Details Modal */}
        <Modal show={showDetails} onHide={handleCloseDetailsModal} centered className="student-details-modal" size="lg">
          <Modal.Header closeButton className="modal-header-custom bg-primary text-white">
            <Modal.Title>
              <FaUserGraduate className="me-2" />
              Student Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {currentStudent && (
              <div className="student-details-content">
                {/* Profile Header */}
                <Row className="mb-4">
                  <Col md={3} className="text-center">
                    <div className="profile-image-large">
                      {currentStudent.profileImage ? (
                        <img 
                          src={`http://localhost:8000/${currentStudent.profileImage}`} 
                          alt={currentStudent.studentname}
                          className="profile-img"
                        />
                      ) : (
                        <div className="profile-placeholder">
                          <FaUser size={60} />
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col md={9}>
                    <div className="student-basic-info">
                      <h3 className="student-name">{currentStudent.studentname}</h3>
                      <div className="student-meta">
                        <Badge bg="primary" className="me-2">
                          <FaIdBadge className="me-1" />
                          {currentStudent.studentid}
                        </Badge>
                        <Badge bg="success" className="me-2">
                          <FaUniversity className="me-1" />
                          {currentStudent.departmentname}
                        </Badge>
                        <Badge bg="info">
                          <FaGraduationCap className="me-1" />
                          {currentStudent.semester}
                        </Badge>
                      </div>
                      <div className="contact-info mt-2">
                        <small className="text-muted me-3">
                          <FaEnvelope className="me-1" />
                          {currentStudent.email}
                        </small>
                        <small className="text-muted">
                          <FaMobile className="me-1" />
                          {currentStudent.phonenumber}
                        </small>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Personal Information */}
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaUser className="me-2" />
                      Personal Information
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="info-item">
                          <strong><FaVenusMars className="me-2" />Gender:</strong>
                          <span>{currentStudent.gender || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <strong><FaBirthdayCake className="me-2" />Date of Birth:</strong>
                          <span>{currentStudent.dateOfBirth ? new Date(currentStudent.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <strong><FaBirthdayCake className="me-2" />Age:</strong>
                          <span>{calculateAge(currentStudent.dateOfBirth)} years</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <strong><FaTint className="me-2" />Blood Group:</strong>
                          <span>{currentStudent.bloodGroup || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <strong><FaAward className="me-2" />Roll Number:</strong>
                          <span>{currentStudent.rollNumber || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <strong><FaCalendarAlt className="me-2" />Batch:</strong>
                          <span>{currentStudent.batch || 'N/A'}</span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Academic Information */}
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaGraduationCap className="me-2" />
                      Academic Information
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="info-item">
                          <strong><FaUniversity className="me-2" />Department:</strong>
                          <span>{currentStudent.departmentname}</span>
                        </div>
                        <div className="info-item">
                          <strong><FaBook className="me-2" />Semester:</strong>
                          <span>{currentStudent.semester}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <strong><FaCalendarAlt className="me-2" />Course Duration:</strong>
                          <span>{currentStudent.courseDuration || '4 Years'}</span>
                        </div>
                        <div className="info-item">
                          <strong><FaSchool className="me-2" />Previous School:</strong>
                          <span>{currentStudent.academicInfo?.previousSchool || 'N/A'}</span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Family Information */}
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaUserFriends className="me-2" />
                      Family Information
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="info-item">
                          <strong>Father's Name:</strong>
                          <span>{currentStudent.fatherName || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <strong>Mother's Name:</strong>
                          <span>{currentStudent.motherName || 'N/A'}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <strong><FaPhone className="me-2" />Parent's Phone:</strong>
                          <span>{currentStudent.parentPhone || 'N/A'}</span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Address Information */}
                <Card className="mb-3">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaHome className="me-2" />
                      Address Information
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="info-item">
                      <strong><FaMapPin className="me-2" />Street:</strong>
                      <span>{currentStudent.address?.street || 'N/A'}</span>
                    </div>
                    <Row>
                      <Col md={6}>
                        <div className="info-item">
                          <strong>City:</strong>
                          <span>{currentStudent.address?.city || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <strong>State:</strong>
                          <span>{currentStudent.address?.state || 'N/A'}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <strong>ZIP Code:</strong>
                          <span>{currentStudent.address?.zipCode || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <strong><FaGlobe className="me-2" />Country:</strong>
                          <span>{currentStudent.address?.country || 'Bangladesh'}</span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaHeart className="me-2" />
                      Emergency Contact
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="info-item">
                          <strong>Name:</strong>
                          <span>{currentStudent.emergencyContact?.name || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <strong>Relationship:</strong>
                          <span>{currentStudent.emergencyContact?.relationship || 'N/A'}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="info-item">
                          <strong><FaPhone className="me-2" />Phone:</strong>
                          <span>{currentStudent.emergencyContact?.phone || 'N/A'}</span>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleCloseDetailsModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default Student;