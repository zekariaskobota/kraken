import config from "../config";

export const userRegistration = async(userData) =>{
  try {
    const response = await fetch(`${config.BACKEND_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }
  } catch (error) {
    throw new Error("An error occured during registration");
  }
};

export const userLogin = async(userData) =>{
  try {
    const response = await fetch(`${config.BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if(!response.ok){
      throw new Error(data.message || "Login failed");
    }
    
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    // Handle case where data might not be defined
    if (error instanceof SyntaxError) {
      // JSON parsing failed
      throw new Error("Invalid response format");
    } else if (typeof error.message !== 'undefined') {
      // Re-throw the error with its message
      throw error;
    } else {
      // Generic error message when we don't have data
      throw new Error("An error occurred during login");
    }
  }
};

export const googleAuth = async (token) => {
  try {
    const response = await fetch(`${config.BACKEND_URL}/api/auth/google-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    
    if(!response.ok){
      throw new Error(data.message || "Google authentication failed");
    }
    
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Invalid response format");
    } else if (typeof error.message !== 'undefined') {
      throw error;
    } else {
      throw new Error("An error occurred during Google authentication");
    }
  }
};

