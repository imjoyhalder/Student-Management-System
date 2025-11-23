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
  FaChartLine
} from 'react-icons/fa';
import './Student.css';

const Student = () => {
  let navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [studentname, setStudentName] = useState("");
  const [departmentname, setDepartmentname] = useState("");
  const [studentid, setStudentid] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [update, setUpdate] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    departments: 0,
    classes: 0
  });

  const handleClose = () => {
    setLoading(true);
    axios
      .post("http://localhost:8000/createstudent", {
        studentname: studentname,
        departmentname: departmentname,
        studentid: studentid,
        phonenumber: phonenumber,
      })
      .then(() => {
        fetchStudents();
        setLoading(false);
        setShow(false);
        resetForm();
      })
      .catch((error) => {
        console.error("Error creating student:", error);
        setLoading(false);
      });
  };

  const handleCloseForUpdate = () => {
    setLoading(true);
    axios
      .patch(`http://localhost:8000/student/${studentid}`, {
        studentname: studentname,
        departmentname: departmentname,
        studentid: studentid,
        phonenumber: phonenumber,
      })
      .then(() => {
        fetchStudents();
        setLoading(false);
        setShow(false);
        resetForm();
      })
      .catch((error) => {
        console.error("Error updating student:", error);
        setLoading(false);
      });
  };

  const handleCloseModal = () => {
    setShow(false);
    setUpdate(false);
    resetForm();
  };

  const handleShow = () => {
    resetForm();
    setUpdate(false);
    setShow(true);
  };

  const handleShowModal = (id) => {
    setUpdate(true);
    axios.get(`http://localhost:8000/student/${id}`).then((data) => {
      const student = data.data[0];
      setDepartmentname(student.departmentname);
      setPhoneNumber(student.phonenumber);
      setStudentid(student.studentid);
      setStudentName(student.studentname);
      setStudentid(student._id);
      setShow(true);
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      axios.post("http://localhost:8000/delete", { id: id })
        .then(() => {
          fetchStudents();
        })
        .catch((error) => {
          console.error("Error deleting student:", error);
        });
    }
  };

  const fetchStudents = () => {
    axios.get("http://localhost:8000/allstudent")
      .then((data) => {
        setStudentList(data.data);
        updateStats(data.data);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
      });
  };

  const updateStats = (students) => {
    const departments = [...new Set(students.map(student => student.departmentname))];
    setStats({
      total: students.length,
      active: students.length, // You can modify this based on your logic
      departments: departments.length,
      classes: Math.ceil(students.length / 30) // Example calculation
    });
  };

  const resetForm = () => {
    setStudentName("");
    setDepartmentname("");
    setStudentid("");
    setPhoneNumber("");
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

  return (
    <div className="student-page">
      <Sidebar />
      <div className="main-content">
        <Container fluid>
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
                className="add-student-btn"
              >
                <FaPlus className="me-2" />
                Add Student
              </Button>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col xs={12} sm={6} md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <div className="stats-content">
                    <h3>{stats.total}</h3>
                    <p>Total Students</p>
                  </div>
                  <div className="stats-icon">
                    <FaUserGraduate />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <div className="stats-content">
                    <h3>{stats.active}</h3>
                    <p>Active Students</p>
                  </div>
                  <div className="stats-icon">
                    <FaUsers />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={3}>
              <Card className="stats-card">
                <Card.Body>
                  <div className="stats-content">
                    <h3>{stats.departments}</h3>
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
                    <h3>{stats.classes}</h3>
                    <p>Classes</p>
                  </div>
                  <div className="stats-icon">
                    <FaBook />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Student Table */}
          <Card className="student-table-card">
            <Card.Header className="table-header">
              <h5 className="table-title">
                <FaUserGraduate className="me-2" />
                Student List
              </h5>
              <Badge bg="primary" className="count-badge">
                {studentList.length} Students
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {studentList.length === 0 ? (
                <div className="loading-state">
                  <FaUserGraduate className="empty-icon" />
                  <p>No students found</p>
                  <Button variant="primary" onClick={handleShow}>
                    <FaPlus className="me-2" />
                    Add First Student
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="student-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student Info</th>
                        <th className="d-none d-md-table-cell">Department</th>
                        <th className="d-none d-lg-table-cell">Student ID</th>
                        <th>Phone</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentList.map((item, index) => (
                        <tr key={item._id}>
                          <td>
                            <Badge bg="light" text="dark" className="serial-badge">
                              {index + 1}
                            </Badge>
                          </td>
                          <td>
                            <div className="student-info">
                              <div className="student-avatar">
                                <FaUser />
                              </div>
                              <div className="student-details">
                                <h6 className="student-name">{item.studentname}</h6>
                                <small className="text-muted d-md-none">
                                  <FaBuilding className="me-1" />
                                  {item.departmentname}
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
                          <td>
                            <span className="phone">
                              <FaPhone className="me-1" />
                              {item.phonenumber}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <Button 
                                size="sm" 
                                variant="outline-primary" 
                                className="me-1 action-btn"
                                onClick={() => handleShowModal(item._id)}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-danger"
                                className="action-btn"
                                onClick={() => handleDelete(item._id)}
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
        <Modal show={show} onHide={handleCloseModal} centered className="student-modal">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>
              <FaUserGraduate className="me-2" />
              {update ? "Edit Student" : "Add New Student"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="studentName">
                    <Form.Label>
                      <FaUser className="me-2" />
                      Student Name
                    </Form.Label>
                    <Form.Control
                      onChange={(e) => setStudentName(e.target.value)}
                      type="text"
                      placeholder="Enter full name"
                      value={studentname}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="studentId">
                    <Form.Label>
                      <FaIdCard className="me-2" />
                      Student ID
                    </Form.Label>
                    <Form.Control
                      onChange={(e) => setStudentid(e.target.value)}
                      type="text"
                      placeholder="Enter student ID"
                      value={studentid}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3" controlId="department">
                <Form.Label>
                  <FaBuilding className="me-2" />
                  Department
                </Form.Label>
                <Form.Select
                  onChange={(e) => setDepartmentname(e.target.value)}
                  value={departmentname}
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
              <Form.Group className="mb-3" controlId="phoneNumber">
                <Form.Label>
                  <FaPhone className="me-2" />
                  Phone Number
                </Form.Label>
                <Form.Control
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  type="tel"
                  placeholder="Enter phone number"
                  value={phonenumber}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="modal-footer-custom">
            <Button variant="outline-secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={update ? handleCloseForUpdate : handleClose}
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
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
        </Modal>
      </div>
    </div>
  );
};

export default Student;