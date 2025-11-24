import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { Link } from 'react-router';
import axios from "axios"
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import './Registration.css'; // Create this CSS file

const Registration = () => {
  let navigate = useNavigate()
  let [userName, setUserName] = useState("")
  let [email, setEmail] = useState("")
  let [password, setPassword] = useState("")
  let [userNameError, setUserNameError] = useState("")
  let [emailError, setEmailError] = useState("")
  let [passwordError, setPasswordError] = useState("")
  let [isLoading, setIsLoading] = useState(false)

  let handleUserNameChange = (e) => {
    setUserName(e.target.value)
    setUserNameError("")
  }

  let handleEmailChange = (e) => {
    setEmail(e.target.value)
    setEmailError("")
  }

  let handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setPasswordError("")
  }

  let validateForm = () => {
    let isValid = true
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Username validation
    if (!userName) {
      setUserNameError("Username is required")
      isValid = false
    } else if (userName.length < 3) {
      setUserNameError("Username must be at least 3 characters")
      isValid = false
    }

    // Email validation
    if (!email) {
      setEmailError("Email is required")
      isValid = false
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      isValid = false
    }

    // Password validation
    if (!password) {
      setPasswordError("Password is required")
      isValid = false
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      isValid = false
    }

    return isValid
  }

  let handleFormSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      setIsLoading(true)
      axios.post("https://student-management-system-sandy-two.vercel.app/registration", {
        username: userName,
        email: email,
        password: password
      }).then((data) => {
        console.log(data)
        navigate("/login")
      }).catch((error) => {
        console.error("Registration error:", error)
        // You can add error message handling here
      }).finally(() => {
        setIsLoading(false)
      })
    }
  }

  useEffect(() => {
    let data = localStorage.getItem("userInfo")
    if (data) {
      navigate("/student")
    }
  }, [])

  return (
    <div className="registration-page">
      <Container fluid className="h-100">
        <Row className="h-100 justify-content-center align-items-center">
          <Col xs={12} sm={8} md={6} lg={4} xl={3}>
            <div className="registration-card-wrapper">
              {/* Logo Section */}
              <div className="text-center mb-4">
                <div className="logo-container">
                  <img 
                    src="images/logo.png" 
                    alt="Company Logo" 
                    className="logo-image"
                  />
                </div>
                <h2 className="registration-title">Create Account</h2>
                <p className="registration-subtitle">Sign up to get started</p>
              </div>

              {/* Registration Form Card */}
              <Card className="registration-card">
                <Card.Body className="p-4">
                  <Form onSubmit={handleFormSubmit}>
                    {/* Username Field */}
                    <Form.Group className="mb-3" controlId="formBasicUsername">
                      <Form.Label className="form-label">
                        Username
                      </Form.Label>
                      <Form.Control
                        onChange={handleUserNameChange}
                        type="text"
                        placeholder="Enter your username"
                        className={`form-control-custom ${userNameError ? 'is-invalid' : ''}`}
                        value={userName}
                      />
                      {userNameError && (
                        <Form.Text className="text-danger small">
                          {userNameError}
                        </Form.Text>
                      )}
                    </Form.Group>

                    {/* Email Field */}
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <Form.Label className="form-label">
                        Email Address
                      </Form.Label>
                      <Form.Control
                        onChange={handleEmailChange}
                        type="email"
                        placeholder="Enter your email"
                        className={`form-control-custom ${emailError ? 'is-invalid' : ''}`}
                        value={email}
                      />
                      {emailError && (
                        <Form.Text className="text-danger small">
                          {emailError}
                        </Form.Text>
                      )}
                    </Form.Group>

                    {/* Password Field */}
                    <Form.Group className="mb-4" controlId="formBasicPassword">
                      <Form.Label className="form-label">
                        Password
                      </Form.Label>
                      <Form.Control
                        onChange={handlePasswordChange}
                        type="password"
                        placeholder="Create a password"
                        className={`form-control-custom ${passwordError ? 'is-invalid' : ''}`}
                        value={password}
                      />
                      {passwordError && (
                        <Form.Text className="text-danger small">
                          {passwordError}
                        </Form.Text>
                      )}
                      <Form.Text className="text-muted small">
                        Password must be at least 6 characters long
                      </Form.Text>
                    </Form.Group>

                    {/* Submit Button */}
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 registration-button"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>

              {/* Login Link */}
              <div className="text-center mt-4">
                <Alert variant="light" className="login-alert">
                  Already have an account?{' '}
                  <Link to="/login" className="login-link">
                    Sign in
                  </Link>
                </Alert>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Registration