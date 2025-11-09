import React, { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

function LoginPage() {
  const history = useHistory();
  const [officialEmail, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5001/login', {
        officialEmail,
        password
      });
      if (response.status === 200) {
        if (response.data.message === "Login successful") {
          alert("Login successful");
          history.push('/Home');
        } else if (response.data.message === "Invalid email or password") {
          alert("Invalid email or password. Please check your email and password.");
        } else {
          alert("An error occurred while logging in.");
        }
      } else {
        alert("An error occurred while logging in. Please check your network connection.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while logging in. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Login to your Fincrypt account</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="officialEmail">Email Address</label>
          <input
            type="email"
            id="officialEmail"
            name="officialEmail"
            placeholder="Enter your email"
            value={officialEmail}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit" className="btn-primary">Login</button>
        </form>

        <p className="auth-footer">
          Don’t have an account?{' '}
          <Link to="/Signup" className="link-register">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
