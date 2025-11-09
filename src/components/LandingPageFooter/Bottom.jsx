import React from 'react';

const Bottom = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <p className="text-sm">&copy; 2025 XYZ. All Rights Reserved.</p>
        <div className="flex space-x-4">
          <a href="/terms" className="text-blue-400 hover:underline">Terms of Service</a>
          <span>|</span>
          <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
};

export default Bottom;