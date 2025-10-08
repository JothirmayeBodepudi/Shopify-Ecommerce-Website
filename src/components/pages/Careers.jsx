import React, { useState, useEffect, useMemo } from 'react';

// This is a mock API service that simulates a backend interacting with DynamoDB.
// In a real application, these functions would make actual API calls to an endpoint
// (e.g., using fetch or axios) that connects to your DynamoDB tables.
const mockDynamoDB = {
  applications: [
    {
      id: 'app-1',
      name: 'John Doe',
      position: 'Frontend Developer',
      email: 'john.doe@example.com',
      phone: '123-456-7890',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      resumeUrl: 'https://example.com/resume/john_doe.pdf',
    },
    {
      id: 'app-2',
      name: 'Jane Smith',
      position: 'UX/UI Designer',
      email: 'jane.smith@example.com',
      phone: '098-765-4321',
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      resumeUrl: 'https://example.com/resume/jane_smith.pdf',
    },
    {
      id: 'app-3',
      name: 'Peter Jones',
      position: 'Backend Developer',
      email: 'peter.jones@example.com',
      phone: '555-123-4567',
      timestamp: new Date(Date.now() - 259200000), // 3 days ago
      resumeUrl: 'https://example.com/resume/peter_jones.pdf',
    },
    {
      id: 'app-4',
      name: 'Mary Williams',
      position: 'Frontend Developer',
      email: 'mary.williams@example.com',
      phone: '999-888-7777',
      timestamp: new Date(Date.now() - 345600000), // 4 days ago
      resumeUrl: 'https://example.com/resume/mary_williams.pdf',
    },
    {
      id: 'app-5',
      name: 'David Brown',
      position: 'Product Manager',
      email: 'david.brown@example.com',
      phone: '111-222-3333',
      timestamp: new Date(Date.now() - 432000000), // 5 days ago
      resumeUrl: 'https://example.com/resume/david_brown.pdf',
    },
  ],

  // Simulates fetching applications from the 'applications' table.
  async fetchApplications() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(this.applications.sort((a, b) => b.timestamp - a.timestamp));
      }, 500); // Simulate network delay
    });
  },

  // Simulates adding a new document to the 'applications' table.
  async addApplication(newApplication) {
    return new Promise(resolve => {
      setTimeout(() => {
        const id = `app-${this.applications.length + 1}`;
        const timestamp = new Date();
        const appWithId = { ...newApplication, id, timestamp };
        this.applications.push(appWithId);
        resolve(appWithId);
      }, 500);
    });
  },

  // Simulates updating an existing document in the 'applications' table.
  async updateApplication(updatedApplication) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.applications.findIndex(app => app.id === updatedApplication.id);
        if (index !== -1) {
          this.applications[index] = { ...this.applications[index], ...updatedApplication };
          resolve(this.applications[index]);
        } else {
          reject(new Error('Application not found.'));
        }
      }, 500);
    });
  },

  // Simulates deleting a document from the 'applications' table.
  async deleteApplication(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const initialLength = this.applications.length;
        this.applications = this.applications.filter(app => app.id !== id);
        if (this.applications.length < initialLength) {
          resolve({ success: true, message: 'Application deleted.' });
        } else {
          reject(new Error('Application not found.'));
        }
      }, 500); // Simulate network delay
    });
  },
};

// Component for the Add Application Form (for admin use)
const AddApplicationForm = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ name, position, email, phone, resumeUrl });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-400">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="position" className="block text-sm font-medium text-gray-400">Position</label>
        <input
          id="position"
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-400">Phone</label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-400">Resume URL</label>
        <input
          id="resumeUrl"
          type="url"
          value={resumeUrl}
          onChange={(e) => setResumeUrl(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Add Application
        </button>
      </div>
    </form>
  );
};

// Component for the Edit Application Form (for admin use)
const EditApplicationForm = ({ application, onUpdate, onClose }) => {
  const [name, setName] = useState(application.name || '');
  const [position, setPosition] = useState(application.position || '');
  const [email, setEmail] = useState(application.email || '');
  const [phone, setPhone] = useState(application.phone || '');
  const [resumeUrl, setResumeUrl] = useState(application.resumeUrl || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...application, name, position, email, phone, resumeUrl });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label htmlFor="edit-name" className="block text-sm font-medium text-gray-400">Name</label>
        <input
          id="edit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="edit-position" className="block text-sm font-medium text-gray-400">Position</label>
        <input
          id="edit-position"
          type="text"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="edit-email" className="block text-sm font-medium text-gray-400">Email</label>
        <input
          id="edit-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-400">Phone</label>
        <input
          id="edit-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="edit-resumeUrl" className="block text-sm font-medium text-gray-400">Resume URL</label>
        <input
          id="edit-resumeUrl"
          type="url"
          value={resumeUrl}
          onChange={(e) => setResumeUrl(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Update Application
        </button>
      </div>
    </form>
  );
};

// Component for the public-facing application form
const ApplicationForm = ({ onApply, onClose, selectedPosition }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply({
      name,
      position: selectedPosition,
      email,
      phone,
      resumeUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label htmlFor="apply-name" className="block text-sm font-medium text-gray-400">Full Name</label>
        <input
          id="apply-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="apply-position" className="block text-sm font-medium text-gray-400">Applying for</label>
        <input
          id="apply-position"
          type="text"
          value={selectedPosition}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled
        />
      </div>
      <div>
        <label htmlFor="apply-email" className="block text-sm font-medium text-gray-400">Email Address</label>
        <input
          id="apply-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label htmlFor="apply-phone" className="block text-sm font-medium text-gray-400">Phone</label>
        <input
          id="apply-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="apply-resumeUrl" className="block text-sm font-medium text-gray-400">Resume URL</label>
        <input
          id="apply-resumeUrl"
          type="url"
          value={resumeUrl}
          onChange={(e) => setResumeUrl(e.target.value)}
          className="w-full p-2 mt-1 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
        >
          Submit Application
        </button>
      </div>
    </form>
  );
};


// Main App Component
const App = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPosition, setFilterPosition] = useState('All');
  const [isViewingAdminPanel, setIsViewingAdminPanel] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const availablePositions = useMemo(() => {
    const positions = new Set(mockDynamoDB.applications.map(app => app.position));
    return ['All', ...Array.from(positions)].sort();
  }, []);

  // Simulates fetching data on login or when returning to careers page
  useEffect(() => {
    if (isLoggedIn || !isViewingAdminPanel) {
      setLoading(true);
      mockDynamoDB.fetchApplications()
        .then(data => {
          setApplications(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching data:', err);
          setError('Failed to load applications.');
          setLoading(false);
        });
    }
  }, [isLoggedIn, isViewingAdminPanel]);

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Filter by position
    if (filterPosition !== 'All') {
      filtered = filtered.filter(app => app.position === filterPosition);
    }

    // Search by name or position
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(lowercasedQuery) ||
        app.position.toLowerCase().includes(lowercasedQuery)
      );
    }

    return filtered;
  }, [applications, filterPosition, searchQuery]);

  const handleApplicationClick = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const openDeleteModal = (application) => {
    setSelectedApplication(application);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedApplication(null);
  };

  const handleDeleteApplication = async (id) => {
    try {
      await mockDynamoDB.deleteApplication(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      closeDeleteModal();
      closeModal();
    } catch (e) {
      console.error('Error deleting application:', e);
      setError('Failed to delete application.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Simulate a hardcoded successful login for demonstration
    if (loginEmail === 'admin@example.com' && loginPassword === 'password123') {
      setIsLoggedIn(true);
      setLoginError('');
      setIsViewingAdminPanel(true);
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setApplications([]);
  };

  const handleAddApplication = async (newApplication) => {
    try {
      const addedApp = await mockDynamoDB.addApplication(newApplication);
      setApplications(prev => [addedApp, ...prev]);
    } catch (e) {
      console.error('Error adding application:', e);
      setError('Failed to add application.');
    }
  };

  const handleUpdateApplication = async (updatedApplication) => {
    try {
      await mockDynamoDB.updateApplication(updatedApplication);
      setApplications(prev => prev.map(app =>
        app.id === updatedApplication.id ? updatedApplication : app
      ));
      setIsEditModalOpen(false);
      setIsModalOpen(true);
    } catch (e) {
      console.error('Error updating application:', e);
      setError('Failed to update application.');
    }
  };

  const handleUserApply = async (newApplication) => {
    try {
      await mockDynamoDB.addApplication(newApplication);
      setIsApplyModalOpen(false);
      setApplicationSuccess(true);
      // Wait for 3 seconds before hiding the success message
      setTimeout(() => setApplicationSuccess(false), 3000);
    } catch (e) {
      console.error('Error submitting application:', e);
      setError('Failed to submit application.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-xl font-medium">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-800 text-white p-4 text-center">
        <p className="text-lg">{error}</p>
      </div>
    );
  }

  // Admin Panel
  if (isViewingAdminPanel) {
    // Show login form if not logged in
    if (!isLoggedIn) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100 p-8">
          <div className="w-full max-w-sm bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
            <button
              onClick={() => setIsViewingAdminPanel(false)}
              className="mb-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              ← Back to Careers
            </button>
            <h2 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Admin Login
            </h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
              {loginError && <p className="text-red-400 text-sm mb-4 text-center">{loginError}</p>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      );
    }

    // Show admin panel if logged in
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Job Application Admin Panel
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
            >
              Logout
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-6 w-full space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-center sm:text-left flex-grow">
              Manage all incoming job applications in real-time.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
              >
                Add Application
              </button>
            </div>
          </div>

          {/* Search and Filter section */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
            <input
              type="text"
              placeholder="Search by name or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-1/2 p-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full sm:w-1/2 p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availablePositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.length > 0 ? filteredApplications.map(app => (
              <div
                key={app.id}
                onClick={() => handleApplicationClick(app)}
                className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700 hover:bg-gray-700 transition-colors duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-semibold text-blue-300 truncate">{app.name || 'No Name Provided'}</h3>
                  <p className="text-sm text-gray-400 mt-1">{app.position || 'No Position'}</p>
                  <p className="text-xs text-gray-500 mt-2">{app.timestamp.toLocaleString()}</p>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-500 p-10">
                <p className="text-lg">No matching applications found.</p>
              </div>
            )}
          </div>

          {/* View Details Modal */}
          {isModalOpen && selectedApplication && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-blue-300 mb-4">Application Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Full Name:</p>
                    <p className="text-lg font-medium text-gray-200">{selectedApplication.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Position:</p>
                    <p className="text-lg font-medium text-gray-200">{selectedApplication.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email:</p>
                    <p className="text-lg font-medium text-gray-200">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone:</p>
                    <p className="text-lg font-medium text-gray-200">{selectedApplication.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Resume/CV:</p>
                    {selectedApplication.resumeUrl ? (
                      <a href={selectedApplication.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        View Resume
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">No URL provided.</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={() => { closeModal(); setIsEditModalOpen(true); }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
                  >
                    Edit Application
                  </button>
                  <button
                    onClick={() => { closeModal(); openDeleteModal(selectedApplication); }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
                  >
                    Delete Application
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && selectedApplication && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-sm mx-auto relative">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Confirm Deletion</h2>
                <p className="text-gray-300 mb-6">Are you sure you want to permanently delete the application from <span className="font-semibold text-blue-300">{selectedApplication.name}</span>?</p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={closeDeleteModal}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteApplication(selectedApplication.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Application Modal */}
          {isAddModalOpen && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-sm mx-auto relative">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-blue-300 mb-4">Add New Application</h2>
                <AddApplicationForm
                  onAdd={handleAddApplication}
                  onClose={() => setIsAddModalOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Edit Application Modal */}
          {isEditModalOpen && selectedApplication && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
              <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-sm mx-auto relative">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-blue-300 mb-4">Edit Application</h2>
                <EditApplicationForm
                  application={selectedApplication}
                  onUpdate={handleUpdateApplication}
                  onClose={() => setIsEditModalOpen(false)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Public Careers Page
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Careers at MyShop
          </h1>
          <button
            onClick={() => setIsViewingAdminPanel(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
          >
            Admin Login
          </button>
        </div>
        <p className="text-gray-400 mb-8">
          Join our team and help build the future of e-commerce.
        </p>

        {applicationSuccess && (
          <div className="bg-green-500 text-white p-4 rounded-lg text-center mb-4 transition-opacity duration-500 ease-in-out">
            Application submitted successfully!
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.length > 0 ? applications.map(app => (
            <div key={app.id} className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-blue-300">{app.position || 'No Position'}</h3>
                <p className="text-sm text-gray-400 mt-1">{app.name || 'No Name Provided'}</p>
                <p className="text-xs text-gray-500 mt-2">Posted on: {app.timestamp.toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => { setSelectedApplication(app); setIsApplyModalOpen(true); }}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-300"
              >
                Apply Now
              </button>
            </div>
          )) : (
            <div className="col-span-full text-center text-gray-500 p-10">
              <p className="text-lg">No job applications submitted yet.</p>
            </div>
          )}
        </div>

        {/* Apply Now Modal */}
        {isApplyModalOpen && selectedApplication && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md mx-auto relative">
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-blue-300 mb-4">Apply for {selectedApplication.position}</h2>
              <ApplicationForm
                onApply={handleUserApply}
                onClose={() => setIsApplyModalOpen(false)}
                selectedPosition={selectedApplication.position}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
