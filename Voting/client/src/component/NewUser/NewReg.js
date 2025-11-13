import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import './NewRegStyle.css';

function Signup() {
  const [userData, setUserData] = useState({});
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const history = useHistory();

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const [resendTimer, setResendTimer] = useState(0); // seconds left before resend allowed
  const [resendCount, setResendCount] = useState(0); // how many resends used
  const MAX_RESEND = 3; // change this if you want more/less attempts


  // countdown timer effect
  React.useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(t);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resendTimer]);



  // ✅ Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Restrict Aadhar and Phone to digits only
    if (name === 'aadharCard') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 12);
      setUserData({ ...userData, [name]: onlyDigits });
      return;
    }
    if (name === 'phoneNumber') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 10);
      setUserData({ ...userData, [name]: onlyDigits });
      return;
    }

    // ✅ Password field — also calculate strength
    if (name === 'newPassword') {
      setUserData({ ...userData, [name]: value });
      evaluatePasswordStrength(value);
      return;
    }

    setUserData({ ...userData, [name]: value });
  };

  // ✅ Confirm password input
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  // ✅ Password strength evaluation
  const evaluatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength('');
      return;
    }

    const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const mediumRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (strongRegex.test(password)) {
      setPasswordStrength('strong');
    } else if (mediumRegex.test(password)) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('weak');
    }
  };

  // ✅ Form submit handler with validation
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      alert('Please verify your phone number before registering.');
      return;
    }

    // 1️⃣ Password match
    if (confirmPassword !== userData.newPassword) {
      alert('Passwords do not match');
      return;
    }

    // 2️⃣ Aadhaar validation
    if (!/^\d{12}$/.test(userData.aadharCard)) {
      alert('Invalid Aadhar number — must be exactly 12 digits.');
      return;
    }

    // 3️⃣ Phone validation
    if (!/^\d{10}$/.test(userData.phoneNumber)) {
      alert('Invalid phone number — must be exactly 10 digits.');
      return;
    }

    // 4️⃣ Strong password validation
    const strongPasswordPattern =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordPattern.test(userData.newPassword)) {
      alert(
        'Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.'
      );
      return;
    }

    try {
      // ✅ Submit to backend
      const response = await axios.post('http://127.0.0.1:5001/register', userData);

      if (response.status === 200) {
        alert(response.data.message || 'Registration successful!');
        setUserData({});
        setConfirmPassword('');
        setPasswordStrength('');
        history.push('/');
      }
    } catch (error) {
      console.error(error);

      // ✅ Check for known backend messages
      if (error.response && error.response.data) {
        const message = error.response.data.message;

        if (message.includes('Aadhaar')) {
          alert('This Aadhaar card is already registered. Please login instead.');
        } else if (message.includes('Phone')) {
          alert('This phone number is already registered. Please login instead.');
        } else if (message.includes('email')) {
          alert('This email is already registered. Try logging in.');
        } else {
          alert(message || 'An unknown error occurred during registration.');
        }
      } else {
        alert('Error connecting to server. Please try again.');
      }
    }
  };


  const handleLoginRedirect = () => {
    history.push('/');
  };


  const handleSendOTP = async () => {
    if (!userData.phoneNumber) {
      alert('Please enter your phone number first.');
      return;
    }

    // Prevent too many resends
    if (resendCount >= MAX_RESEND) {
      alert(`You have reached the maximum of ${MAX_RESEND} resend attempts. Try again later or contact support.`);
      return;
    }

    try {
      // Step 1: Check phone availability first (prevents wasting OTP credits)
      const checkRes = await axios.post('http://127.0.0.1:5001/check-phone', {
        phoneNumber: userData.phoneNumber,
      });

      // If phone exists, backend returns 400 and we hit catch block.
      if (checkRes.status === 200) {
        // Step 2: Request OTP from backend
        const res = await axios.post('http://127.0.0.1:5001/send-otp', {
          phoneNumber: userData.phoneNumber,
        });

        // Backend should return sessionId
        const sid = res.data.sessionId || res.data.sessionId || res.data.Details || null;

        // set states
        setSessionId(sid);
        setOtpSent(true);
        setOtp(''); // clear old input
        setOtpVerified(false); // must verify new OTP
        setResendCount(prev => prev + 1);

        // start cooldown (e.g., 30 seconds). change as needed
        setResendTimer(30);

        alert(res.data.message || 'OTP sent. Please check your phone.');
      }
    } catch (err) {
      // backend reported phone already exists
      if (err.response && err.response.status === 400 && err.response.data && err.response.data.message && err.response.data.message.includes('registered')) {
        alert('This phone number is already registered. Use a different number or login.');
        return;
      }

      console.error('Send OTP error:', err.response?.data || err.message || err);
      alert('Failed to send OTP. Please try again.');
    }
  };



  const handleVerifyOTP = async () => {
    if (!otp) {
      alert('Please enter the OTP received.');
      return;
    }

    try {
      const res = await axios.post('http://127.0.0.1:5001/verify-otp', {
        sessionId,
        otp,
      });

      if (res.data.verified) {
        alert('Phone verified successfully!');
        setOtpVerified(true);
      } else {
        alert('Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to verify OTP. Please try again.');
    }
  };


  // ✅ Helper for color-coded text
  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return { color: 'tomato' };
      case 'medium':
        return { color: 'orange' };
      case 'strong':
        return { color: 'limegreen' };
      default:
        return {};
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create Your Account</h2>
        <p className="auth-subtitle">Register to access secure online voting</p>

        <form onSubmit={handleFormSubmit} className="auth-form">
          <label>Official Email</label>
          <input
            type="email"
            name="officialEmail"
            placeholder="Enter your official email"
            onChange={handleInputChange}
            value={userData.officialEmail || ''}
            required
          />

          <label>Aadhar Card Number</label>
          <input
            type="text"
            name="aadharCard"
            placeholder="Enter your Aadhar card number"
            onChange={handleInputChange}
            value={userData.aadharCard || ''}
            maxLength="12"
            required
          />

          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            onChange={handleInputChange}
            value={userData.name || ''}
            required
          />

          <label>Course</label>
          <input
            type="text"
            name="course"
            placeholder="Enter your course"
            onChange={handleInputChange}
            value={userData.course || ''}
            required
          />

          <label>Phone Number</label>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <input
              type="text"
              name="phoneNumber"
              placeholder="Enter your phone number"
              onChange={handleInputChange}
              value={userData.phoneNumber || ''}
              maxLength="10"
              required
              style={{ width: '100%', marginBottom: '10px' }}
            />

          <button
            type="button"
            className="btn-secondary"
            onClick={handleSendOTP}
            disabled={resendTimer > 0 || (resendCount >= MAX_RESEND)}
            style={{
              padding: '0.4rem 1.5rem',
              fontSize: '0.9rem',
              fontWeight: '500',
              borderRadius: '6px',
              background: '#3b82f6',
              marginTop: '0.3rem',
            }}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : (otpSent && !otpVerified ? 'Resend OTP' : 'Send OTP')}
          </button>

          </div>

          {otpSent && (
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <label>Enter OTP</label>
              <input
                type="text"
                name="otp"
                placeholder="Enter the OTP received"
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                required
                style={{ width: '100%', marginBottom: '10px' }}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleVerifyOTP}
                style={{
                    padding: '0.4rem 1.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    borderRadius: '6px',
                    background: '#3b82f6',
                    marginTop: '0.3rem',
                  }}
              >
                Verify OTP
              </button>
            </div>
          )}



          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            placeholder="Create a strong password"
            onChange={handleInputChange}
            value={userData.newPassword || ''}
            required
          />

          {/* ✅ Password strength indicator */}
          {passwordStrength && (
            <p style={{ fontWeight: 'bold', marginTop: '4px', ...getStrengthColor() }}>
              Password Strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
            </p>
          )}

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />

          <button type="submit" className="btn-primary">
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already registered?{' '}
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="link-login"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
