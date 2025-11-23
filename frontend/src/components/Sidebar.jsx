import React from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { Link, useLocation } from "react-router";
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaFilePdf, 
  FaChartBar,
  FaCalendarAlt,
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  let navigate = useNavigate();
  let location = useLocation();

  let handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const menuItems = [
    { path: "/teacher", label: "Teachers", icon: <FaChalkboardTeacher /> },
    { path: "/student", label: "Students", icon: <FaUserGraduate /> },
    { path: "/pdf", label: "PDF Manager", icon: <FaFilePdf /> },
    { path: "/results", label: "Results", icon: <FaChartBar /> },
    { path: "/leave", label: "Leave Management", icon: <FaCalendarAlt /> },
  ];

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Navbar */}
      <Navbar className="d-lg-none mobile-navbar">
        <Container fluid>
          <Navbar.Brand className="d-flex align-items-center">
            <img 
              src="images/logo.png" 
              alt="Logo" 
              className="mobile-logo"
            />
            <span className="ms-2 brand-text">EduManage</span>
          </Navbar.Brand>
          <div className="d-flex align-items-center">
            <span className="user-welcome me-2">Hi, {userInfo?.username}</span>
            <Button 
              variant="outline-light" 
              size="sm"
              onClick={handleLogout}
              className="logout-btn-mobile"
            >
              <FaSignOutAlt />
            </Button>
          </div>
        </Container>
      </Navbar>

      <div className="sidebar-wrapper">
        {/* Desktop Sidebar */}
        <div className="sidebar d-none d-lg-block">
          {/* Header Section */}
          <div className="sidebar-header">
            <div className="logo-container">
              <img 
                src="images/logo.png" 
                alt="Company Logo" 
                className="sidebar-logo"
              />
              <h5 className="brand-name">EduManage</h5>
            </div>
            <div className="user-info">
              <div className="user-avatar">
                <FaUserCircle />
              </div>
              <h4 className="username">Welcome, {userInfo?.username}</h4>
              <p className="user-email">{userInfo?.email}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="sidebar-menu">
            <ListGroup variant="flush" className="menu-list">
              {menuItems.map((item, index) => (
                <ListGroup.Item 
                  key={index}
                  className={`menu-item ${isActiveLink(item.path) ? 'active' : ''}`}
                >
                  <Link 
                    to={item.path} 
                    className="menu-link"
                  >
                    <span className="menu-icon">{item.icon}</span>
                    <span className="menu-label">{item.label}</span>
                  </Link>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>

          {/* Footer Section */}
          <div className="sidebar-footer">
            <Button 
              variant="outline-light" 
              className="logout-btn"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="logout-icon" />
              Log Out
            </Button>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="mobile-bottom-nav d-lg-none">
          <ListGroup horizontal className="mobile-menu">
            {menuItems.map((item, index) => (
              <ListGroup.Item 
                key={index}
                className={`mobile-menu-item ${isActiveLink(item.path) ? 'active' : ''}`}
              >
                <Link to={item.path} className="mobile-menu-link">
                  <span className="mobile-icon">{item.icon}</span>
                  <span className="mobile-label">{item.label}</span>
                </Link>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </div>
    </>
  );
};

export default Sidebar;