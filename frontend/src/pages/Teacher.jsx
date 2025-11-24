import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { 
  FaChalkboardTeacher, 
  FaUserCheck, 
  FaBuilding, 
  FaBook,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaIdCard,
  FaGraduationCap,
  FaMoneyBillWave,
  FaMapMarkerAlt
} from 'react-icons/fa';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import './Teacher.css';

const Teacher = () => {
  let navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    activeTeachers: 0,
    totalDepartments: 0,
    departments: []
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Form states
  const [formData, setFormData] = useState({
    teachername: "",
    departmentname: "",
    teacherid: "",
    phonenumber: "",
    email: "",
    qualification: "",
    experience: "",
    salary: "",
    subjects: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });
  const [isEdit, setIsEdit] = useState(false);
  const [currentTeacherId, setCurrentTeacherId] = useState("");

  // Show alert message
  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch all teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://student-management-system-sandy-two.vercel.app/allteacher");
      setTeachers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      showAlert('Error fetching teachers', 'danger');
      setLoading(false);
    }
  };

  // Fetch teacher statistics
  const fetchTeacherStats = async () => {
    try {
      const response = await axios.get("https://student-management-system-sandy-two.vercel.app/teacherstats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching teacher stats:", error);
    }
  };

  // Create new teacher
  const createTeacher = async () => {
    try {
      setLoading(true);
      await axios.post("https://student-management-system-sandy-two.vercel.app/createteacher", {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        salary: parseInt(formData.salary) || 0,
        subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : []
      });
      showAlert('Teacher created successfully!');
      fetchTeachers();
      fetchTeacherStats();
      handleCloseModal();
    } catch (error) {
      console.error("Error creating teacher:", error);
      showAlert(error.response?.data || 'Error creating teacher', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Update teacher
  const updateTeacher = async () => {
    try {
      setLoading(true);
      await axios.patch(`https://student-management-system-sandy-two.vercel.app/updateteacher/${currentTeacherId}`, {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        salary: parseInt(formData.salary) || 0,
        subjects: formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : []
      });
      showAlert('Teacher updated successfully!');
      fetchTeachers();
      fetchTeacherStats();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating teacher:", error);
      showAlert(error.response?.data || 'Error updating teacher', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Delete teacher
  const deleteTeacher = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await axios.delete(`https://student-management-system-sandy-two.vercel.app/deleteteacher/${id}`);
        showAlert('Teacher deleted successfully!');
        fetchTeachers();
        fetchTeacherStats();
      } catch (error) {
        console.error("Error deleting teacher:", error);
        showAlert(error.response?.data || 'Error deleting teacher', 'danger');
      }
    }
  };

  // Deactivate teacher
  const deactivateTeacher = async (id) => {
    if (window.confirm("Are you sure you want to deactivate this teacher?")) {
      try {
        await axios.patch(`https://student-management-system-sandy-two.vercel.app/teacher/${id}/deactivate`);
        showAlert('Teacher deactivated successfully!');
        fetchTeachers();
        fetchTeacherStats();
      } catch (error) {
        console.error("Error deactivating teacher:", error);
        showAlert(error.response?.data || 'Error deactivating teacher', 'danger');
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShow(false);
    setIsEdit(false);
    setCurrentTeacherId("");
    setFormData({
      teachername: "",
      departmentname: "",
      teacherid: "",
      phonenumber: "",
      email: "",
      qualification: "",
      experience: "",
      salary: "",
      subjects: "",
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: ""
      }
    });
  };

  // Handle show modal for new teacher
  const handleShowModal = () => {
    setIsEdit(false);
    setShow(true);
  };

  // Handle show modal for editing teacher
  const handleEditModal = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://student-management-system-sandy-two.vercel.app/teacher/${id}`);
      const teacher = response.data;
      
      setFormData({
        teachername: teacher.teachername || "",
        departmentname: teacher.departmentname || "",
        teacherid: teacher.teacherid || "",
        phonenumber: teacher.phonenumber || "",
        email: teacher.email || "",
        qualification: teacher.qualification || "",
        experience: teacher.experience || "",
        salary: teacher.salary || "",
        subjects: teacher.subjects ? teacher.subjects.join(', ') : "",
        address: teacher.address || {
          street: "",
          city: "",
          state: "",
          zipCode: ""
        }
      });
      
      setIsEdit(true);
      setCurrentTeacherId(id);
      setShow(true);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      showAlert('Error fetching teacher details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateTeacher();
    } else {
      createTeacher();
    }
  };

  useEffect(() => {
    let data = localStorage.getItem("userInfo");
    if (!data) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchTeachers();
    fetchTeacherStats();
  }, []);

  return (
    <div className="teacher-page">
      <Sidebar />
      <div className="main-content">
        <Container fluid>
          {/* Alert Message */}
          {alert.show && (
            <Alert variant={alert.type} className="mt-3">
              {alert.message}
            </Alert>
          )}

          {/* Header Section */}
          <Row className="mb-4">
            <Col>
              <div className="page-header">
                <h1 className="page-title">
                  <FaChalkboardTeacher className="me-2" />
                  Teacher Management
                </h1>
                <p className="page-subtitle">Manage all teachers and their information</p>
              </div>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                onClick={handleShowModal}
                className="add-teacher-btn"
                disabled={loading}
              >
                <FaPlus className="me-2" />
                Add Teacher
              </Button>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col xs={12} sm={6} md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <div className="stats-content">
                    <h3>{stats.totalTeachers}</h3>
                    <p>Total Teachers</p>
                  </div>
                  <div className="stats-icon">
                    <FaChalkboardTeacher />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <div className="stats-content">
                    <h3>{stats.activeTeachers}</h3>
                    <p>Active Teachers</p>
                  </div>
                  <div className="stats-icon">
                    <FaUserCheck />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <div className="stats-content">
                    <h3>{stats.totalDepartments}</h3>
                    <p>Departments</p>
                  </div>
                  <div className="stats-icon">
                    <FaBuilding />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <div className="stats-content">
                    <h3>{teachers.length}</h3>
                    <p>Current List</p>
                  </div>
                  <div className="stats-icon">
                    <FaBook />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Teacher Table */}
          <Card className="teacher-table-card">
            <Card.Header className="table-header">
              <h5 className="table-title">
                <FaChalkboardTeacher className="me-2" />
                Teacher List
              </h5>
              <Badge bg="primary" className="count-badge">
                {teachers.length} Teachers
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {loading && teachers.length === 0 ? (
                <div className="loading-state">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p>Loading teachers...</p>
                </div>
              ) : teachers.length === 0 ? (
                <div className="loading-state">
                  <FaChalkboardTeacher className="empty-icon" />
                  <p>No teachers found</p>
                  <Button variant="primary" onClick={handleShowModal}>
                    <FaPlus className="me-2" />
                    Add First Teacher
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="teacher-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Teacher Info</th>
                        <th className="d-none d-md-table-cell">Department</th>
                        <th className="d-none d-lg-table-cell">Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher, index) => (
                        <tr key={teacher._id}>
                          <td>
                            <Badge bg="light" text="dark" className="serial-badge">
                              {index + 1}
                            </Badge>
                          </td>
                          <td>
                            <div className="teacher-info">
                              <div className="teacher-avatar">
                                <FaUser />
                              </div>
                              <div className="teacher-details">
                                <h6 className="teacher-name">{teacher.teachername}</h6>
                                <small className="text-muted">
                                  <FaIdCard className="me-1" />
                                  {teacher.teacherid}
                                </small>
                                <small className="text-muted d-md-none d-block">
                                  <FaBuilding className="me-1" />
                                  {teacher.departmentname}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="d-none d-md-table-cell">
                            <span className="department">
                              <FaBuilding className="me-1" />
                              {teacher.departmentname}
                            </span>
                          </td>
                          <td className="d-none d-lg-table-cell">
                            <span className="email">
                              <FaEnvelope className="me-1" />
                              {teacher.email}
                            </span>
                          </td>
                          <td>
                            <span className="phone">
                              <FaPhone className="me-1" />
                              {teacher.phonenumber}
                            </span>
                          </td>
                          <td>
                            <Badge 
                              bg={teacher.isActive ? 'success' : 'secondary'} 
                              className="status-badge"
                            >
                              {teacher.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <Button 
                                size="sm" 
                                variant="outline-primary" 
                                className="me-1 action-btn"
                                onClick={() => handleEditModal(teacher._id)}
                                disabled={loading}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-warning"
                                className="me-1 action-btn"
                                onClick={() => deactivateTeacher(teacher._id)}
                                disabled={loading || !teacher.isActive}
                                title="Deactivate"
                              >
                                ⚡
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-danger"
                                className="action-btn"
                                onClick={() => deleteTeacher(teacher._id)}
                                disabled={loading}
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

        {/* Add/Edit Teacher Modal */}
        <Modal show={show} onHide={handleCloseModal} centered className="teacher-modal" size="lg">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>
              <FaChalkboardTeacher className="me-2" />
              {isEdit ? "Edit Teacher" : "Add New Teacher"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="teacherName">
                    <Form.Label>
                      <FaUser className="me-2" />
                      Teacher Name *
                    </Form.Label>
                    <Form.Control
                      name="teachername"
                      value={formData.teachername}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter full name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="teacherId">
                    <Form.Label>
                      <FaIdCard className="me-2" />
                      Teacher ID *
                    </Form.Label>
                    <Form.Control
                      name="teacherid"
                      value={formData.teacherid}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter teacher ID"
                      required
                      disabled={isEdit}
                    />
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
              </Row>

              <Row>
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
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="qualification">
                    <Form.Label>
                      <FaGraduationCap className="me-2" />
                      Qualification
                    </Form.Label>
                    <Form.Control
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter qualifications"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="experience">
                    <Form.Label>Experience (Years)</Form.Label>
                    <Form.Control
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="Years of experience"
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="salary">
                    <Form.Label>
                      <FaMoneyBillWave className="me-2" />
                      Salary
                    </Form.Label>
                    <Form.Control
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      type="number"
                      placeholder="Enter salary"
                      min="0"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="subjects">
                <Form.Label>Subjects (comma separated)</Form.Label>
                <Form.Control
                  name="subjects"
                  value={formData.subjects}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <FaMapMarkerAlt className="me-2" />
                  Address
                </Form.Label>
                <Form.Control
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Street Address"
                  className="mb-2"
                />
                <Row>
                  <Col md={6}>
                    <Form.Control
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="City"
                      className="mb-2"
                    />
                  </Col>
                  <Col md={6}>
                    <Form.Control
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="State"
                      className="mb-2"
                    />
                  </Col>
                </Row>
                <Form.Control
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="ZIP Code"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button variant="outline-secondary" onClick={handleCloseModal} disabled={loading}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
                className="submit-btn"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isEdit ? <FaEdit className="me-2" /> : <FaPlus className="me-2" />}
                    {isEdit ? "Update Teacher" : "Create Teacher"}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Teacher;