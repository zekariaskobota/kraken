import { userRegistration, userLogin, googleAuth } from "../services/authService";
import { showToast } from "../utils/toast";

export const registerUser = async (userData, navigate) => {
  try {
    await userRegistration(userData);
    navigate('/login');
  } catch (error) {
    showToast.error(error?.message || "Registration failed. Something went wrong");
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (userData, navigate) => {
  try {
    await userLogin(userData);
    navigate('/home');
  } catch (error) {
    showToast.error("Username or password incorrect");
    console.error("Login error:", error);
    throw error;
  }
};

export const handleGoogleAuth = async (token, navigate) => {
  try {
    await googleAuth(token);
    showToast.success("Logged in with Google successfully!");
    navigate('/home');
  } catch (error) {
    showToast.error(error?.message || "Google authentication failed. Something went wrong");
    console.error("Google auth error:", error);
    throw error;
  }
};
