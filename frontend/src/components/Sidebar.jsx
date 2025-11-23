import React from "react";
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from "react-router";
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router";

const Sidebar = () => {
  let navigate = useNavigate() 

  let handleLogout = () => {
    console.log("hello")
    localStorage.removeItem("userInfo")
    navigate("/login")
  }


  return (
    <div className="sidebar">
      <div className="imgholder">
        <img src="images/logo.png" alt="" />
        <h3>Welcome {JSON.parse(localStorage.getItem("userInfo")).username}</h3>
      </div>
      <ListGroup>
      <ListGroup.Item>
        <Link to="/teacher">Teacher</Link>
      </ListGroup.Item>
      <ListGroup.Item>
        <Link to="/student">Student</Link>
      </ListGroup.Item>
      <ListGroup.Item>
        <Link to="/pdf">PDF</Link>
      </ListGroup.Item>
      <ListGroup.Item>Result</ListGroup.Item>
      <ListGroup.Item>Leave</ListGroup.Item>
    </ListGroup>
    <Button variant="danger" onClick={handleLogout}>Log Out</Button>
    </div>
  );
};

export default Sidebar;
