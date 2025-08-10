// src/pages/Dashboard.tsx
import React from "react";

const Dashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">
        Welcome! This is a protected page.
      </p>
    </div>
  );
};

export default Dashboard;
