import React from "react";
import Sidebar from "../components/Sidebar";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import axios from "axios";
import { useEffect } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import InputGroup from 'react-bootstrap/InputGroup';
import { 
  FaFilePdf, 
  FaPlus, 
  FaEye, 
  FaDownload, 
  FaTrash, 
  FaEdit,
  FaBook,
  FaUserEdit,
  FaBuilding,
  FaHashtag,
  FaUpload,
  FaSearch
} from 'react-icons/fa';
import './PDF.css';

const PDF = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [booklist, setBookslist] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalDepartments: 0,
    totalWriters: 0
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [currentBookId, setCurrentBookId] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    writer: "",
    serial: "",
    file: null
  });

  // Show alert message
  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch all books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8000/allbook");
      setBookslist(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching books:", error);
      showAlert('Error fetching books', 'danger');
      setLoading(false);
    }
  };

  // Fetch book statistics
  const fetchBookStats = async () => {
    try {
      const response = await axios.get("http://localhost:8000/bookstats");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching book stats:", error);
    }
  };

  // Search books
  const searchBooks = async (query) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/books/search/${query}`);
      setBookslist(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error searching books:", error);
      showAlert('Error searching books', 'danger');
      setLoading(false);
    }
  };

  // Create new book
  const createBook = async () => {
    try {
      setUploading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('writer', formData.writer);
      formDataToSend.append('serial', formData.serial);
      if (formData.file) {
        formDataToSend.append('avatar', formData.file);
      }

      await axios.post("http://localhost:8000/createbook", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      showAlert('Book uploaded successfully!');
      fetchBooks();
      fetchBookStats();
      handleCloseModal();
    } catch (error) {
      console.error("Error uploading book:", error);
      showAlert(error.response?.data || 'Error uploading book', 'danger');
    } finally {
      setUploading(false);
    }
  };

  // Update book
  const updateBook = async () => {
    try {
      setUploading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('writer', formData.writer);
      formDataToSend.append('serial', formData.serial);
      if (formData.file) {
        formDataToSend.append('avatar', formData.file);
      }

      await axios.patch(`http://localhost:8000/updatebook/${currentBookId}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      showAlert('Book updated successfully!');
      fetchBooks();
      fetchBookStats();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating book:", error);
      showAlert(error.response?.data || 'Error updating book', 'danger');
    } finally {
      setUploading(false);
    }
  };

  // Delete book
  const deleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await axios.delete(`http://localhost:8000/deletebook/${id}`);
        showAlert('Book deleted successfully!');
        fetchBooks();
        fetchBookStats();
      } catch (error) {
        console.error("Error deleting book:", error);
        showAlert(error.response?.data || 'Error deleting book', 'danger');
      }
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        showAlert('Please select a PDF file', 'warning');
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        showAlert('File size should be less than 10MB', 'warning');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        file: selectedFile
      }));
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      searchBooks(query);
    } else if (query.length === 0) {
      fetchBooks();
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShow(false);
    setIsEdit(false);
    setCurrentBookId("");
    setFormData({
      name: "",
      department: "",
      writer: "",
      serial: "",
      file: null
    });
  };

  // Handle show modal for new book
  const handleShowModal = () => {
    setIsEdit(false);
    setShow(true);
  };

  // Handle show modal for editing book
  const handleEditModal = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/book/${id}`);
      const book = response.data;
      
      setFormData({
        name: book.name || "",
        department: book.department || "",
        writer: book.writer || "",
        serial: book.serial || "",
        file: null
      });
      
      setIsEdit(true);
      setCurrentBookId(id);
      setShow(true);
    } catch (error) {
      console.error("Error fetching book:", error);
      showAlert('Error fetching book details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateBook();
    } else {
      createBook();
    }
  };

  // Get file extension
  const getFileExtension = (filename) => {
    return filename.split('.').pop().toUpperCase();
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchBooks();
    fetchBookStats();
  }, []);

  return (
    <div className="pdf-page">
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
                  <FaFilePdf className="me-2" />
                  Book Management
                </h1>
                <p className="page-subtitle">Manage and organize all PDF books</p>
              </div>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                onClick={handleShowModal}
                className="add-book-btn mt-20"
              >
                <FaPlus className="me-2" />
                Add Book
              </Button>
            </Col>
          </Row>

          {/* Stats Cards */}
          <Row className="mb-4">
            <Col xs={12} sm={6} md={4}>
              <Card className="stats-card">
                <Card.Body>
                  <div className="stats-content">
                    <h3>{stats.totalBooks}</h3>
                    <p>Total Books</p>
                  </div>
                  <div className="stats-icon">
                    <FaBook />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4}>
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
            <Col xs={12} sm={6} md={4}>
              <Card className="stats-card">
                <Card.Body>
                  <div className="stats-content">
                    <h3>{stats.totalWriters}</h3>
                    <p>Writers</p>
                  </div>
                  <div className="stats-icon">
                    <FaUserEdit />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Search Bar */}
          <Row className="mb-4">
            <Col>
              <InputGroup className="search-bar">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search books by name, writer, department, or serial..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </InputGroup>
            </Col>
          </Row>

          {/* Books Table */}
          <Card className="books-table-card">
            <Card.Header className="table-header">
              <h5 className="table-title">
                <FaFilePdf className="me-2" />
                Book List
              </h5>
              <Badge bg="primary" className="count-badge">
                {booklist.length} Books
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {loading && booklist.length === 0 ? (
                <div className="loading-state">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p>Loading books...</p>
                </div>
              ) : booklist.length === 0 ? (
                <div className="loading-state">
                  <FaFilePdf className="empty-icon" />
                  <p>No books found</p>
                  <Button variant="primary" onClick={handleShowModal}>
                    <FaPlus className="me-2" />
                    Add First Book
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="books-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Book Information</th>
                        <th className="d-none d-md-table-cell">Department</th>
                        <th className="d-none d-lg-table-cell">Writer</th>
                        <th className="d-none d-xl-table-cell">Serial</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booklist.map((item, index) => (
                        <tr key={item._id}>
                          <td>
                            <Badge bg="light" text="dark" className="serial-badge">
                              {index + 1}
                            </Badge>
                          </td>
                          <td>
                            <div className="book-info">
                              <div className="book-icon">
                                <FaFilePdf />
                              </div>
                              <div className="book-details">
                                <h6 className="book-name">{item.name}</h6>
                                <small className="text-muted d-md-none">
                                  <FaBuilding className="me-1" />
                                  {item.department}
                                </small>
                                <small className="text-muted d-md-none">
                                  <FaUserEdit className="me-1" />
                                  {item.writer}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className="d-none d-md-table-cell">
                            <span className="department">
                              <FaBuilding className="me-1" />
                              {item.department}
                            </span>
                          </td>
                          <td className="d-none d-lg-table-cell">
                            <span className="writer">
                              <FaUserEdit className="me-1" />
                              {item.writer}
                            </span>
                          </td>
                          <td className="d-none d-xl-table-cell">
                            <span className="serial">
                              <FaHashtag className="me-1" />
                              {item.serial}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <Button 
                                size="sm" 
                                variant="outline-primary" 
                                className="me-1 action-btn"
                                href={`http://localhost:8000/${item.url}`}
                                target="_blank"
                                title="View PDF"
                              >
                                <FaEye />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-success"
                                className="me-1 action-btn"
                                href={`http://localhost:8000/${item.url}`}
                                download
                                title="Download PDF"
                              >
                                <FaDownload />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-warning"
                                className="me-1 action-btn"
                                onClick={() => handleEditModal(item._id)}
                                title="Edit Book"
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-danger"
                                className="action-btn"
                                onClick={() => deleteBook(item._id)}
                                title="Delete Book"
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

        {/* Add/Edit Book Modal */}
        <Modal show={show} onHide={handleCloseModal} centered className="book-modal">
          <Modal.Header closeButton className="modal-header-custom">
            <Modal.Title>
              <FaFilePdf className="me-2" />
              {isEdit ? "Edit Book" : "Add New Book"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="bookName">
                    <Form.Label>Book Name *</Form.Label>
                    <Form.Control
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter book name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="bookSerial">
                    <Form.Label>
                      <FaHashtag className="me-2" />
                      Serial Number *
                    </Form.Label>
                    <Form.Control
                      name="serial"
                      value={formData.serial}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Enter serial number"
                      required
                      disabled={isEdit}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3" controlId="bookDepartment">
                <Form.Label>
                  <FaBuilding className="me-2" />
                  Department *
                </Form.Label>
                <Form.Select
                  name="department"
                  value={formData.department}
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
                  <option value="History">History</option>
                  <option value="Economics">Economics</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="bookWriter">
                <Form.Label>
                  <FaUserEdit className="me-2" />
                  Writer Name *
                </Form.Label>
                <Form.Control
                  name="writer"
                  value={formData.writer}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter writer name"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="bookFile">
                <Form.Label>
                  <FaUpload className="me-2" />
                  {isEdit ? "Update PDF File (Optional)" : "Upload PDF File *"}
                </Form.Label>
                <Form.Control
                  onChange={handleFileChange}
                  type="file"
                  accept=".pdf"
                  required={!isEdit}
                />
                <Form.Text className="text-muted">
                  Only PDF files are allowed. Maximum file size: 10MB
                </Form.Text>
                {formData.file && (
                  <div className="file-info mt-2">
                    <Badge bg="info" className="me-2">
                      {getFileExtension(formData.file.name)}
                    </Badge>
                    <span className="file-name">{formData.file.name}</span>
                    <small className="file-size d-block text-muted">
                      {formatFileSize(formData.file.size)}
                    </small>
                  </div>
                )}
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button variant="outline-secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={uploading}
                className="submit-btn"
              >
                {uploading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {isEdit ? "Updating..." : "Uploading..."}
                  </>
                ) : (
                  <>
                    {isEdit ? <FaEdit className="me-2" /> : <FaPlus className="me-2" />}
                    {isEdit ? "Update Book" : "Add Book"}
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

export default PDF;