import Sidebar from "../components/Sidebar";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Spinner from "react-bootstrap/Spinner";

const Student = () => {
  let navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [studentname, setStudentName] = useState("");
  const [departmentname, setDepartmentname] = useState("");
  const [studentid, setStudentid] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [studentList, setStudentList] = useState([]);
  let [update,setUpdate]= useState(false)

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
        axios.get("http://localhost:8000/allstudent").then((data) => {
          setStudentList(data.data);
          setLoading(false);
        setShow(false);
        });
        
      });
  };
  const handleCloseForUpdate = () => {
    console.log("hello",studentid)
    setLoading(true);
    axios
      .patch(`http://localhost:8000/student/${studentid}`, {
        studentname: studentname,
        departmentname: departmentname,
        studentid: studentid,
        phonenumber: phonenumber,
      })
      .then(() => {
        axios.get("http://localhost:8000/allstudent").then((data) => {
          setStudentList(data.data);
          setLoading(false);
        setShow(false);
        });
        
      });
  };

  const handleCloseModal = () => {
        setShow(false);
        setUpdate(false)
  };
  const handleShow = () =>{
    setDepartmentname("")
      setPhoneNumber("")
      setStudentid("")
      setStudentName("")
     setShow(true)
  };
  const handleShowModal = (id) => {
    setUpdate(true)
    axios.get(`http://localhost:8000/student/${id}`).then((data)=>{
      console.log(data.data[0])
      setDepartmentname(data.data[0].departmentname)
      setPhoneNumber(data.data[0].phonenumber)
      setStudentid(data.data[0].studentid)
      setStudentName(data.data[0].studentname)
      setStudentid(data.data[0]._id)

    })
    setShow(true)
  };

  useEffect(() => {
    let data = localStorage.getItem("userInfo");

    if (!data) {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8000/allstudent").then((data) => {
      setStudentList(data.data);
    });
  }, []);

  let handleDelete = (id)=>{
    console.log(id)
    axios.post("http://localhost:8000/delete",{
      id: id
    }).then(()=>{
      axios.get("http://localhost:8000/allstudent").then((data) => {
          setStudentList(data.data);
        });
    })
  }

  return (
    <div className="main">
      <div className="left">
        <Sidebar />
      </div>
      <div className="right">
        <Button variant="primary" onClick={handleShow}>
          Add a Student
        </Button>

        <Modal show={show} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add Student</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Student Name</Form.Label>
                <Form.Control
                  onChange={(e) => setStudentName(e.target.value)}
                  type="email"
                  placeholder="Enter email"
                  value={studentname}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Department Name</Form.Label>
                <Form.Control
                  onChange={(e) => setDepartmentname(e.target.value)}
                  type="email"
                  placeholder="Enter email"
                  value={departmentname}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Student ID</Form.Label>
                <Form.Control
                  onChange={(e) => setStudentid(e.target.value)}
                  type="email"
                  placeholder="Enter email"
                  value={studentid}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  type="email"
                  placeholder="Enter email"
                  value={phonenumber}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>

            {update 
            
            ?
             <Button disabled={loading} variant="primary" onClick={handleCloseForUpdate}>
              {loading ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                "Update Student"
              )}
            </Button>
            :
            <Button disabled={loading} variant="primary" onClick={handleClose}>
              {loading ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                "Create Student"
              )}
            </Button>
            }
            

            
          </Modal.Footer>

          
        </Modal>

        {/* table */}
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>#</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Phone Number</th>
              <th>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {studentList.map((item,index) => (
              <tr>
                <td>{index+1}</td>
                <td>{item.studentname}</td>
                <td>{item.departmentname}</td>
                <td>{item.phonenumber}</td>
                <td>
                  <Button variant="primary" onClick={()=>handleShowModal(item._id)}>Edit</Button>
                  <Button variant="danger" onClick={()=> handleDelete(item._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Student;
