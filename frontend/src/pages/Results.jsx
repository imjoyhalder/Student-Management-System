import React from "react";
import Sidebar from "../components/Sidebar";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import { useState, useEffect, useMemo } from "react";
import Form from "react-bootstrap/Form";
import axios from "axios";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import InputGroup from 'react-bootstrap/InputGroup';
import {
    FaChartBar,
    FaPlus,
    FaEye,
    FaEdit,
    FaTrash,
    FaUserGraduate,
    FaBuilding,
    FaCalendarAlt,
    FaSearch,
    FaPercentage,
    FaGraduationCap,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';

// React Toastify imports
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './Results.css';

const Results = () => {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [results, setResults] = useState([]);
    const [students, setStudents] = useState([]);
    const [stats, setStats] = useState({
        totalResults: 0,
        publishedResults: 0,
        passPercentage: 0,
        totalDepartments: 0
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [studentSearch, setStudentSearch] = useState("");
    const [isEdit, setIsEdit] = useState(false);
    const [currentResultId, setCurrentResultId] = useState("");

    // Form states
    const [formData, setFormData] = useState({
        studentId: "",
        studentName: "",
        department: "",
        semester: "",
        examType: "Regular",
        subjects: [{ subjectName: "", subjectCode: "", marks: "", credit: "" }]
    });

    // Toast configuration
    const toastConfig = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    };

    // Toast functions
    const showSuccessToast = (message) => {
        toast.success(message, toastConfig);
    };

    const showErrorToast = (message) => {
        toast.error(message, toastConfig);
    };

    const showWarningToast = (message) => {
        toast.warning(message, toastConfig);
    };

    const showInfoToast = (message) => {
        toast.info(message, toastConfig);
    };

    const showLoadingToast = (message) => {
        return toast.loading(message, toastConfig);
    };

    const updateToast = (toastId, message, type = 'success') => {
        toast.update(toastId, {
            render: message,
            type: type,
            isLoading: false,
            autoClose: 5000,
            closeButton: true,
        });
    };

    // Filtered students for dropdown
    const filteredStudents = useMemo(() => {
        if (!studentSearch) return students;
        return students.filter(student =>
            student.studentname.toLowerCase().includes(studentSearch.toLowerCase()) ||
            student.studentid.toLowerCase().includes(studentSearch.toLowerCase()) ||
            student.departmentname.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [students, studentSearch]);

    // Fetch all results
    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await axios.get("https://student-management-system-sandy-two.vercel.app/allresults");
            setResults(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching results:", error);
            showErrorToast('❌ Error fetching results');
            setLoading(false);
        }
    };

    // Fetch students for dropdown
    const fetchStudents = async () => {
        try {
            const response = await axios.get("https://student-management-system-sandy-two.vercel.app/allstudent");
            setStudents(response.data);
        } catch (error) {
            console.error("Error fetching students:", error);
            showErrorToast('❌ Error fetching students');
        }
    };

    // Fetch result statistics
    const fetchResultStats = async () => {
        try {
            const response = await axios.get("https://student-management-system-sandy-two.vercel.app/resultstats");
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching result stats:", error);
        }
    };

    // Search results
    const searchResults = async (query) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://student-management-system-sandy-two.vercel.app/results/search/${query}`);
            setResults(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error searching results:", error);
            showErrorToast('❌ Error searching results');
            setLoading(false);
        }
    };

    // Create new result
    const createResult = async () => {
        const toastId = showLoadingToast('🔄 Creating result...');

        try {
            setSaving(true);

            await axios.post("https://student-management-system-sandy-two.vercel.app/createresult", {
                ...formData,
                subjects: formData.subjects.map(subject => ({
                    ...subject,
                    marks: parseInt(subject.marks),
                    credit: parseInt(subject.credit),
                    grade: subject.grade || calculateGrade(parseInt(subject.marks))
                }))
            });

            updateToast(toastId, '✅ Result created successfully!', 'success');
            fetchResults();
            fetchResultStats();
            handleCloseModal();
        } catch (error) {
            console.error("Error creating result:", error);
            updateToast(toastId, error.response?.data || '❌ Error creating result', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Update result
    const updateResult = async () => {
        const toastId = showLoadingToast('🔄 Updating result...');

        try {
            setSaving(true);

            await axios.patch(`https://student-management-system-sandy-two.vercel.app/updateresult/${currentResultId}`, {
                ...formData,
                subjects: formData.subjects.map(subject => ({
                    ...subject,
                    marks: parseInt(subject.marks),
                    credit: parseInt(subject.credit),
                    grade: subject.grade || calculateGrade(parseInt(subject.marks))
                }))
            });

            updateToast(toastId, '✅ Result updated successfully!', 'success');
            fetchResults();
            fetchResultStats();
            handleCloseModal();
        } catch (error) {
            console.error("Error updating result:", error);
            updateToast(toastId, error.response?.data || '❌ Error updating result', 'error');
        } finally {
            setSaving(false);
        }
    };

    // Delete result
    const deleteResult = async (id) => {
        if (window.confirm("Are you sure you want to delete this result?")) {
            const toastId = showLoadingToast('🔄 Deleting result...');

            try {
                await axios.delete(`https://student-management-system-sandy-two.vercel.app/deleteresult/${id}`);
                updateToast(toastId, '✅ Result deleted successfully!', 'success');
                fetchResults();
                fetchResultStats();
            } catch (error) {
                console.error("Error deleting result:", error);
                updateToast(toastId, error.response?.data || '❌ Error deleting result', 'error');
            }
        }
    };

    // Publish/Unpublish result
    const togglePublish = async (id, currentStatus) => {
        if (window.confirm(`Are you sure you want to ${currentStatus ? 'unpublish' : 'publish'} this result?`)) {
            const toastId = showLoadingToast(`🔄 ${currentStatus ? 'Unpublishing' : 'Publishing'} result...`);

            try {
                await axios.patch(`https://student-management-system-sandy-two.vercel.app/result/${id}/publish`, {
                    published: !currentStatus
                });

                updateToast(toastId, `✅ Result ${!currentStatus ? 'published' : 'unpublished'} successfully!`, 'success');
                fetchResults();
                fetchResultStats();
            } catch (error) {
                console.error("Error toggling publish status:", error);
                updateToast(toastId, error.response?.data || '❌ Error updating result status', 'error');
            }
        }
    };

    // Calculate grade
    const calculateGrade = (marks) => {
        if (marks >= 80) return 'A+';
        if (marks >= 70) return 'A';
        if (marks >= 60) return 'B';
        if (marks >= 50) return 'C';
        if (marks >= 40) return 'D';
        return 'F';
    };

    // Handle student selection
    const handleStudentChange = (studentId) => {
        const selectedStudent = students.find(student => student.studentid === studentId);
        if (selectedStudent) {
            setFormData(prev => ({
                ...prev,
                studentId: selectedStudent.studentid,
                studentName: selectedStudent.studentname,
                department: selectedStudent.departmentname
            }));
            setStudentSearch(""); // Clear search after selection
            showSuccessToast(`✅ Student ${selectedStudent.studentname} selected!`);
        }
    };

    // Handle subject changes
    const handleSubjectChange = (index, field, value) => {
        const updatedSubjects = [...formData.subjects];
        updatedSubjects[index][field] = value;

        // Auto-calculate grade based on marks
        if (field === 'marks' && value !== '') {
            const marks = parseInt(value);
            const grade = calculateGrade(marks);
            updatedSubjects[index].grade = grade;
        }

        setFormData(prev => ({
            ...prev,
            subjects: updatedSubjects
        }));
    };

    // Add new subject field
    const addSubject = () => {
        setFormData(prev => ({
            ...prev,
            subjects: [...prev.subjects, { subjectName: "", subjectCode: "", marks: "", credit: "" }]
        }));
        showInfoToast('📚 New subject field added');
    };

    // Remove subject field
    const removeSubject = (index) => {
        if (formData.subjects.length > 1) {
            const updatedSubjects = formData.subjects.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                subjects: updatedSubjects
            }));
            showWarningToast('🗑️ Subject field removed');
        } else {
            showWarningToast('⚠️ You must have at least one subject');
        }
    };

    // Handle search
    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 2) {
            searchResults(query);
        } else if (query.length === 0) {
            fetchResults();
        }
    };

    // Handle modal close
    const handleCloseModal = () => {
        setShow(false);
        setIsEdit(false);
        setCurrentResultId("");
        setStudentSearch("");
        setFormData({
            studentId: "",
            studentName: "",
            department: "",
            semester: "",
            examType: "Regular",
            subjects: [{ subjectName: "", subjectCode: "", marks: "", credit: "" }]
        });
    };

    // Handle show modal for new result
    const handleShowModal = () => {
        setIsEdit(false);
        setShow(true);
    };

    // Handle show modal for editing result
    const handleEditModal = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://student-management-system-sandy-two.vercel.app/result/${id}`);
            const result = response.data;

            setFormData({
                studentId: result.studentId || "",
                studentName: result.studentName || "",
                department: result.department || "",
                semester: result.semester || "",
                examType: result.examType || "Regular",
                subjects: result.subjects || [{ subjectName: "", subjectCode: "", marks: "", credit: "" }]
            });

            setIsEdit(true);
            setCurrentResultId(id);
            setShow(true);
        } catch (error) {
            console.error("Error fetching result:", error);
            showErrorToast('❌ Error fetching result details');
        } finally {
            setLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate all subjects have required fields
        const invalidSubjects = formData.subjects.filter(subject =>
            !subject.subjectName || !subject.subjectCode || !subject.marks || !subject.credit
        );

        if (invalidSubjects.length > 0) {
            showWarningToast('❌ Please fill all subject fields correctly');
            return;
        }

        // Validate marks range
        const invalidMarks = formData.subjects.filter(subject =>
            subject.marks < 0 || subject.marks > 100
        );

        if (invalidMarks.length > 0) {
            showWarningToast('❌ Marks must be between 0 and 100');
            return;
        }

        if (isEdit) {
            updateResult();
        } else {
            createResult();
        }
    };

    // Get status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case 'Pass': return 'success';
            case 'Fail': return 'danger';
            case 'Supplementary': return 'warning';
            default: return 'secondary';
        }
    };

    useEffect(() => {
        fetchResults();
        fetchStudents();
        fetchResultStats();
    }, []);

    return (
        <div className="results-page">
            <Sidebar />

            {/* React Toastify Container */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{
                    fontSize: '14px',
                    zIndex: 9999
                }}
            />

            <div className="main-content">
                <Container fluid>
                    {/* Header Section */}
                    <Row className="mb-4">
                        <Col>
                            <div className="page-header">
                                <h1 className="page-title">
                                    <FaChartBar className="me-2" />
                                    Results Management
                                </h1>
                                <p className="page-subtitle">Manage and publish student results</p>
                            </div>
                        </Col>
                        <Col xs="auto">
                            <Button
                                variant="primary"
                                onClick={handleShowModal}
                                className="add-result-btn mt-20"
                            >
                                <FaPlus className="me-2" />
                                Add Result
                            </Button>
                        </Col>
                    </Row>

                    {/* Stats Cards */}
                    <Row className="mb-4">
                        <Col xs={12} sm={6} md={3}>
                            <Card className="stats-card">
                                <Card.Body>
                                    <div className="stats-content">
                                        <h3>{stats.totalResults}</h3>
                                        <p>Total Results</p>
                                    </div>
                                    <div className="stats-icon">
                                        <FaChartBar />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Card className="stats-card">
                                <Card.Body>
                                    <div className="stats-content">
                                        <h3>{stats.publishedResults}</h3>
                                        <p>Published</p>
                                    </div>
                                    <div className="stats-icon">
                                        <FaCheckCircle />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <Card className="stats-card">
                                <Card.Body>
                                    <div className="stats-content">
                                        <h3>{stats.passPercentage}%</h3>
                                        <p>Pass Rate</p>
                                    </div>
                                    <div className="stats-icon">
                                        <FaPercentage />
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
                    </Row>

                    {/* Search Bar */}
                    <Row className="mb-4">
                        <Col>
                            <InputGroup className="search-bar">
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Search results by student ID, name, department, or semester..."
                                    value={searchQuery}
                                    onChange={handleSearch}
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    {/* Results Table */}
                    <Card className="results-table-card">
                        <Card.Header className="table-header">
                            <h5 className="table-title">
                                <FaChartBar className="me-2" />
                                Results List
                            </h5>
                            <Badge bg="primary" className="count-badge">
                                {results.length} Results
                            </Badge>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {loading && results.length === 0 ? (
                                <div className="loading-state">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                    <p>Loading results...</p>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="loading-state">
                                    <FaChartBar className="empty-icon" />
                                    <p>No results found</p>
                                    <Button variant="primary" onClick={handleShowModal}>
                                        <FaPlus className="me-2" />
                                        Add First Result
                                    </Button>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover className="results-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Student Information</th>
                                                <th className="d-none d-md-table-cell">Department</th>
                                                <th className="d-none d-lg-table-cell">Semester</th>
                                                <th>Percentage</th>
                                                <th>CGPA</th>
                                                <th>Status</th>
                                                <th>Published</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((result, index) => (
                                                <tr key={result._id}>
                                                    <td>
                                                        <Badge bg="light" text="dark" className="serial-badge">
                                                            {index + 1}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="student-info">
                                                            <div className="student-avatar">
                                                                <FaUserGraduate />
                                                            </div>
                                                            <div className="student-details">
                                                                <h6 className="student-name">{result.studentName}</h6>
                                                                <small className="text-muted">
                                                                    ID: {result.studentId}
                                                                </small>
                                                                <small className="text-muted d-md-none d-block">
                                                                    <FaBuilding className="me-1" />
                                                                    {result.department}
                                                                </small>
                                                                <small className="text-muted d-md-none d-block">
                                                                    <FaCalendarAlt className="me-1" />
                                                                    Sem: {result.semester}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="d-none d-md-table-cell">
                                                        <span className="department">
                                                            <FaBuilding className="me-1" />
                                                            {result.department}
                                                        </span>
                                                    </td>
                                                    <td className="d-none d-lg-table-cell">
                                                        <span className="semester">
                                                            <FaCalendarAlt className="me-1" />
                                                            {result.semester}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="percentage">
                                                            <FaPercentage className="me-1" />
                                                            {result.percentage}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="cgpa">
                                                            <FaGraduationCap className="me-1" />
                                                            {result.cgpa}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Badge
                                                            bg={getStatusVariant(result.status)}
                                                            className="status-badge"
                                                        >
                                                            {result.status}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Badge
                                                            bg={result.published ? 'success' : 'secondary'}
                                                            className="publish-badge"
                                                        >
                                                            {result.published ? 'Yes' : 'No'}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <div className="action-buttons">
                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                className="me-1 action-btn"
                                                                onClick={() => handleEditModal(result._id)}
                                                                title="View Details"
                                                            >
                                                                <FaEye />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-warning"
                                                                className="me-1 action-btn"
                                                                onClick={() => handleEditModal(result._id)}
                                                                title="Edit Result"
                                                            >
                                                                <FaEdit />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={result.published ? "outline-secondary" : "outline-success"}
                                                                className="me-1 action-btn"
                                                                onClick={() => togglePublish(result._id, result.published)}
                                                                title={result.published ? "Unpublish" : "Publish"}
                                                            >
                                                                {result.published ? <FaTimesCircle /> : <FaCheckCircle />}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline-danger"
                                                                className="action-btn"
                                                                onClick={() => deleteResult(result._id)}
                                                                title="Delete Result"
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

                {/* Add/Edit Result Modal */}
                <Modal show={show} onHide={handleCloseModal} centered className="result-modal" size="lg">
                    <Modal.Header closeButton className="modal-header-custom">
                        <Modal.Title>
                            <FaChartBar className="me-2" />
                            {isEdit ? "Edit Result" : "Add New Result"}
                        </Modal.Title>
                    </Modal.Header>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Body>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="studentSearch">
                                        <Form.Label>Search Student *</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <FaSearch />
                                            </InputGroup.Text>
                                            <Form.Control
                                                placeholder="Search by name, ID, or department..."
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                            />
                                        </InputGroup>
                                        <Form.Text className="text-muted">
                                            Type to search students. You can search by name, student ID, or department.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="studentSelect">
                                        <Form.Label>Select Student *</Form.Label>
                                        <Form.Select
                                            value={formData.studentId}
                                            onChange={(e) => handleStudentChange(e.target.value)}
                                            required
                                            size={filteredStudents.length > 5 ? "sm" : ""}
                                        >
                                            <option value="">{filteredStudents.length === 0 ? "No students found" : "Choose from filtered list"}</option>
                                            {filteredStudents.map(student => (
                                                <option key={student._id} value={student.studentid}>
                                                    {student.studentname} ({student.studentid}) - {student.departmentname}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text className="text-muted">
                                            {filteredStudents.length} student(s) found
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {formData.studentId && (
                                <>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="studentName">
                                                <Form.Label>Student Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.studentName}
                                                    readOnly
                                                    className="selected-field"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="department">
                                                <Form.Label>Department</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.department}
                                                    readOnly
                                                    className="selected-field"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="semester">
                                                <Form.Label>
                                                    <FaCalendarAlt className="me-2" />
                                                    Semester *
                                                </Form.Label>
                                                <Form.Select
                                                    name="semester"
                                                    value={formData.semester}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
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
                                        <Col md={6}>
                                            <Form.Group className="mb-3" controlId="examType">
                                                <Form.Label>Exam Type</Form.Label>
                                                <Form.Select
                                                    name="examType"
                                                    value={formData.examType}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, examType: e.target.value }))}
                                                >
                                                    <option value="Regular">Regular</option>
                                                    <option value="Supplementary">Supplementary</option>
                                                    <option value="Improvement">Improvement</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <hr />
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6>Subjects & Marks</h6>
                                        <Button size="sm" variant="outline-primary" onClick={addSubject}>
                                            <FaPlus className="me-1" />
                                            Add Subject
                                        </Button>
                                    </div>

                                    {formData.subjects.map((subject, index) => (
                                        <Row key={index} className="mb-3 subject-row">
                                            <Col md={4}>
                                                <Form.Group>
                                                    <Form.Label>Subject Name *</Form.Label>
                                                    <Form.Control
                                                        value={subject.subjectName}
                                                        onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                                                        placeholder="Enter subject name"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={2}>
                                                <Form.Group>
                                                    <Form.Label>Code *</Form.Label>
                                                    <Form.Control
                                                        value={subject.subjectCode}
                                                        onChange={(e) => handleSubjectChange(index, 'subjectCode', e.target.value)}
                                                        placeholder="Code"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={2}>
                                                <Form.Group>
                                                    <Form.Label>Marks *</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={subject.marks}
                                                        onChange={(e) => handleSubjectChange(index, 'marks', e.target.value)}
                                                        placeholder="0-100"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={2}>
                                                <Form.Group>
                                                    <Form.Label>Credit *</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        min="1"
                                                        max="5"
                                                        value={subject.credit}
                                                        onChange={(e) => handleSubjectChange(index, 'credit', e.target.value)}
                                                        placeholder="1-5"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={2}>
                                                <Form.Group>
                                                    <Form.Label>Grade</Form.Label>
                                                    <Form.Control
                                                        value={subject.grade || ''}
                                                        readOnly
                                                        placeholder="Auto"
                                                        className="grade-field"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            {formData.subjects.length > 1 && (
                                                <Col md={12} className="mt-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={() => removeSubject(index)}
                                                    >
                                                        <FaTrash className="me-1" />
                                                        Remove
                                                    </Button>
                                                </Col>
                                            )}
                                        </Row>
                                    ))}
                                </>
                            )}
                        </Modal.Body>
                        <Modal.Footer className="modal-footer-custom">
                            <Button variant="outline-secondary" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={saving || !formData.studentId}
                                className="submit-btn"
                            >
                                {saving ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        {isEdit ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    <>
                                        {isEdit ? <FaEdit className="me-2" /> : <FaPlus className="me-2" />}
                                        {isEdit ? "Update Result" : "Create Result"}
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

export default Results;