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
import './Login.css'; // Create this CSS file

const Login = () => {
  let navigate = useNavigate()
  let [email, setEmail] = useState("")
  let [password, setPassword] = useState("")
  let [emailError, setEmailError] = useState("")
  let [passwordError, setPasswordError] = useState("")
  let [message, setMessage] = useState("")
  let [isLoading, setIsLoading] = useState(false)

  let handleEmailChange = (e) => {
    setEmail(e.target.value)
    setEmailError("")
    setMessage("")
  }

  let handlePasswordChange = (e) => {
    setPassword(e.target.value)
    setPasswordError("")
    setMessage("")
  }

  let validateForm = () => {
    let isValid = true
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
      setEmailError("Email is required")
      isValid = false
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address")
      isValid = false
    }

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
    setMessage("")
    
    if (validateForm()) {
      setIsLoading(true)
      axios.post("http://localhost:8000/login", {
        email: email,
        password: password
      }).then((data) => {
        console.log(data.data)
        
        if (typeof data.data == "string") {
          setMessage(data.data)
        } else {
          localStorage.setItem("userInfo", JSON.stringify(data.data))
          navigate("/student")
        }
      }).catch((error) => {
        setMessage("Login failed. Please try again.")
        console.error("Login error:", error)
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
    <div className="login-page">
      <Container fluid className="h-100">
        <Row className="h-100 justify-content-center align-items-center">
          <Col xs={12} sm={8} md={6} lg={4} xl={3}>
            <div className="login-card-wrapper">
              {/* Logo Section */}
              <div className="text-center mb-4">
                <div className="logo-container">
                  <img 
                    src="images/logo.png" 
                    alt="Company Logo" 
                    className="logo-image"
                  />
                </div>
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Sign in to your account</p>
              </div>

              {/* Message Alert */}
              {message && (
                <Alert 
                  variant={message.includes("failed") ? "danger" : "info"} 
                  className="mb-3"
                >
                  {message}
                </Alert>
              )}

              {/* Login Form Card */}
              <Card className="login-card">
                <Card.Body className="p-4">
                  <Form onSubmit={handleFormSubmit}>
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
                      <div className="d-flex justify-content-between align-items-center">
                        <Form.Label className="form-label">
                          Password
                        </Form.Label>
                        <Link to="/forgot-password" className="forgot-password-link">
                          Forgot password?
                        </Link>
                      </div>
                      <Form.Control
                        onChange={handlePasswordChange}
                        type="password"
                        placeholder="Enter your password"
                        className={`form-control-custom ${passwordError ? 'is-invalid' : ''}`}
                        value={password}
                      />
                      {passwordError && (
                        <Form.Text className="text-danger small">
                          {passwordError}
                        </Form.Text>
                      )}
                    </Form.Group>

                    {/* Submit Button */}
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 login-button"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>

              {/* Registration Link */}
              <div className="text-center mt-4">
                <Alert variant="light" className="registration-alert">
                  Don't have an account?{' '}
                  <Link to="/" className="registration-link">
                    Create an account
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

export default Login