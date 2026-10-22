import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Navigation tab state: 'browse' | 'addJob' | 'history'
  const [activeTab, setActiveTab] = useState('browse');

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState('Job');
  const [stipend, setStipend] = useState('');
  const [editId, setEditId] = useState(null);

  // Search filter state
  const [search, setSearch] = useState('');

  // Apply state
  const [applyingJob, setApplyingJob] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');

  // Applications list state
  const [applications, setApplications] = useState([]);

  // Toast notification message
  const [notification, setNotification] = useState('');

  // In development, use local backend on port 5000; in production on Vercel, use relative URL
  const BACKEND_URL = import.meta.env.DEV
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_API_URL || '');
  const API_JOBS = `${BACKEND_URL}/api/jobs`;
  const API_APPS = `${BACKEND_URL}/api/applications`;

  // Helper to show a temporary notification banner
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // 1. Fetch all jobs (READ)
  const fetchJobs = () => {
    fetch(API_JOBS)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.log('Error fetching jobs:', err));
  };

  // 2. Fetch all submitted applications (READ)
  const fetchApplications = () => {
    fetch(API_APPS)
      .then((res) => res.json())
      .then((data) => setApplications(data))
      .catch((err) => console.log('Error fetching applications:', err));
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  // 3. Handle Add / Update Job
  const handleSubmitJob = (e) => {
    e.preventDefault();
    const jobData = { title, company, type, stipend };

    if (editId) {
      // UPDATE existing job
      fetch(`${API_JOBS}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })
        .then(() => {
          fetchJobs();
          resetForm();
          setActiveTab('browse');
          showNotification('Opportunity updated successfully!');
        })
        .catch((err) => console.log(err));
    } else {
      // CREATE new job
      fetch(API_JOBS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })
        .then(() => {
          fetchJobs();
          resetForm();
          setActiveTab('browse');
          showNotification('New opportunity posted successfully!');
        })
        .catch((err) => console.log(err));
    }
  };

  // 4. Fill form and switch to "Post a Job" tab for editing
  const handleEdit = (job) => {
    setTitle(job.title);
    setCompany(job.company);
    setType(job.type);
    setStipend(job.stipend);
    setEditId(job._id);
    setActiveTab('addJob');
    setApplyingJob(null);
  };

  // 5. Delete a job
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      fetch(`${API_JOBS}/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          fetchJobs();
          showNotification('Opportunity deleted successfully.');
        })
        .catch((err) => console.log(err));
    }
  };

  // Reset job form inputs
  const resetForm = () => {
    setTitle('');
    setCompany('');
    setType('Job');
    setStipend('');
    setEditId(null);
  };

  // 6. Open Apply box for a job
  const handleOpenApply = (job) => {
    setApplyingJob(job);
    setApplicantName('');
    setApplicantEmail('');
  };

  // 7. Submit Application
  const handleApplySubmit = (e) => {
    e.preventDefault();
    const appData = {
      jobTitle: applyingJob.title,
      company: applyingJob.company,
      name: applicantName,
      email: applicantEmail,
    };

    fetch(API_APPS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData),
    })
      .then((res) => res.json())
      .then(() => {
        showNotification(`Application submitted successfully for "${applyingJob.title}"!`);
        setApplyingJob(null);
        setApplicantName('');
        setApplicantEmail('');
        fetchApplications();
      })
      .catch((err) => console.log(err));
  };

  // Filter jobs by search query
  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h2>Job & Internship Portal</h2>
        <p>A full-stack student placement and application platform (MERN)</p>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          💼 Browse Opportunities ({jobs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'addJob' ? 'active' : ''}`}
          onClick={() => {
            if (!editId) resetForm();
            setActiveTab('addJob');
          }}
        >
          {editId ? '✏️ Edit Opportunity' : '➕ Post a Job / Internship'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 Application History ({applications.length})
        </button>
      </div>

      {/* Notification Banner */}
      {notification && <div className="notification-banner">{notification}</div>}

      {/* ==================== TAB 1: BROWSE OPPORTUNITIES ==================== */}
      {activeTab === 'browse' && (
        <div>
          {/* Quick Stats Bar */}
          <div className="stats-bar">
            <span className="stat-pill">
              Total Listed: <strong>{jobs.length}</strong>
            </span>
            <span className="stat-pill">
              Jobs: <strong>{jobs.filter((j) => j.type === 'Job').length}</strong>
            </span>
            <span className="stat-pill">
              Internships: <strong>{jobs.filter((j) => j.type === 'Internship').length}</strong>
            </span>
            <span className="stat-pill">
              Applications: <strong>{applications.length}</strong>
            </span>
          </div>

          {/* Search Box */}
          <input
            type="text"
            className="search-box"
            placeholder="🔍 Search by role (e.g. Developer) or company name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Inline Apply Box (appears when user clicks Apply) */}
          {applyingJob && (
            <div className="apply-box">
              <h3>
                Apply for: {applyingJob.title} at {applyingJob.company}
              </h3>
              <form onSubmit={handleApplySubmit}>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Your Email Address"
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-apply">
                  Submit Application
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setApplyingJob(null)}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Jobs Table */}
          {filteredJobs.length === 0 ? (
            <div className="empty-box">
              <p>No opportunities found.</p>
              <button
                className="btn-submit"
                onClick={() => {
                  resetForm();
                  setActiveTab('addJob');
                }}
              >
                Post the First Opportunity
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Stipend / Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job._id}>
                    <td>
                      <strong>{job.title}</strong>
                    </td>
                    <td>{job.company}</td>
                    <td>
                      <span
                        className={
                          job.type === 'Internship'
                            ? 'badge-internship'
                            : 'badge-job'
                        }
                      >
                        {job.type}
                      </span>
                    </td>
                    <td>{job.stipend}</td>
                    <td>
                      <button
                        className="btn-apply"
                        onClick={() => handleOpenApply(job)}
                      >
                        Apply
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(job)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(job._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ==================== TAB 2: POST / EDIT A JOB PAGE ==================== */}
      {activeTab === 'addJob' && (
        <div className="form-card">
          <h3 style={{ marginTop: 0, color: '#1e3a8a', textAlign: 'center' }}>
            {editId ? '✏️ Edit Opportunity' : '➕ Post a New Opportunity'}
          </h3>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginTop: 0 }}>
            {editId
              ? 'Update the role details below and save your changes.'
              : 'Fill in the information below to publish a new job or internship.'}
          </p>

          <form onSubmit={handleSubmitJob}>
            <div className="form-group">
              <label>Role / Job Title *</label>
              <input
                type="text"
                placeholder="e.g. Full Stack Developer, Data Analyst Intern"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                placeholder="e.g. Google, Infosys, Microsoft"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Opportunity Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Job">Job (Full-time / Part-time)</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label>Stipend / Annual Salary *</label>
              <input
                type="text"
                placeholder="e.g. ₹25,000 / month or ₹8 LPA"
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                required
              />
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="submit" className="btn-submit">
                {editId ? '💾 Save Changes' : '🚀 Publish Opportunity'}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    resetForm();
                    setActiveTab('browse');
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ==================== TAB 3: APPLICATION HISTORY ==================== */}
      {activeTab === 'history' && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#1e3a8a' }}>
              📋 Candidate Application History
            </h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
              Track all job and internship applications recorded in MongoDB
            </p>
          </div>

          {applications.length === 0 ? (
            <div className="empty-box">
              <p>No applications submitted yet.</p>
              <button className="btn-submit" onClick={() => setActiveTab('browse')}>
                Browse Opportunities & Apply
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Applicant Name</th>
                  <th>Role Applied</th>
                  <th>Company</th>
                  <th>Email</th>
                  <th>Date Applied</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => (
                  <tr key={app._id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{app.name}</strong>
                    </td>
                    <td>{app.jobTitle}</td>
                    <td>{app.company}</td>
                    <td>{app.email}</td>
                    <td>
                      {app.appliedAt
                        ? new Date(app.appliedAt).toLocaleDateString()
                        : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
