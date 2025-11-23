import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Table from 'react-bootstrap/Table';
import axios from 'axios'
import { useNavigate } from 'react-router';

const Teacher = () => {
  let navigate = useNavigate()
  const [show, setShow] = useState(false);
  let [userData,setUserData] = useState([])

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(()=>{
    axios.get("https://jsonplaceholder.typicode.com/users").then((data)=>{
      setUserData(data.data)
    })
  },[])

   useEffect(()=>{
    let data = localStorage.getItem("userInfo")

    if(!data){
      navigate("/login")
    }

  },[])


  return (
    <div className="main">
      <div className="left">
        <Sidebar />
      </div>
      <div className="right">
        <Button variant="primary" onClick={handleShow}>
          Add a Teacher
        </Button>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add Teacher</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Teacher Name</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Department Name</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Teacher ID</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control type="email" placeholder="Enter email" />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>
              Create Teacher
            </Button>
          </Modal.Footer>
        </Modal>

        {/* table */}
         <Table striped bordered hover variant="dark">
      <thead>
        <tr>
          <th>#</th>
          <th>Teacher Name</th>
          <th>Department</th>
          <th>Phone Number</th>
        </tr>
      </thead>
      <tbody>

        {userData.map((item,index)=>(
            <tr>
              <td>{index+1}</td>
              <td>{item.name}</td>
              <td>{item.username}</td>
              <td>{item.email}</td>
            </tr>
        ))}

        
       
      </tbody>
    </Table>
      </div>
    </div>
  );
};

export default Teacher;
