import { userRegistration, userLogin, googleAuth } from "../services/authService";
import Swal from 'sweetalert2';

export const registerUser = async (userData, navigate) => {
  try {
    await userRegistration(userData);
    navigate('/login');
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Registration Failed',
      text: error?.message || 'Something went wrong!',
    });
    console.error("Registration error:", error);
  }
};

export const loginUser = async (userData, navigate) => {
  try {
    await userLogin(userData);
    navigate('/home');
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Login Failed',
      text: 'Username or password incorrect',
    });
    console.error("Login error:", error);
  }
};

export const handleGoogleAuth = async (token, navigate) => {
  try {
    await googleAuth(token);
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Logged in with Google successfully!',
      timer: 1500,
      showConfirmButton: false
    });
    navigate('/home');
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Google Authentication Failed',
      text: error?.message || 'Something went wrong!',
    });
    console.error("Google auth error:", error);
  }
};
