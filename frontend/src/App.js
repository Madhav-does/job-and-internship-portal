import React, { useState, useEffect } from 'react';
import './App.css';

// Helper to assign a dynamic gradient avatar based on company name
const getCompanyAvatar = (name = 'Company') => {
  const char = (name.trim()[0] || 'C').toUpperCase();
  const gradients = [
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo/Purple
    'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', // Sky/Blue
    'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', // Emerald/Teal
    'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', // Amber/Orange
    'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', // Pink/Rose
  ];
  const index = (name.charCodeAt(0) || 0) % gradients.length;
  return { char, bg: gradients[index] };
};

function App() {
  // Navigation: 'browse' | 'post' | 'history'
  const [activeTab, setActiveTab] = useState('browse');

  // View mode in Browse: 'grid' (cards) | 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'Job' | 'Internship'

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState('Job');
  const [stipend, setStipend] = useState('');
  const [editId, setEditId] = useState(null);

  // Apply Modal state
  const [applyingJob, setApplyingJob] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');

  // Applications list state
  const [applications, setApplications] = useState([]);

  // Toast notification state
  const [toast, setToast] = useState('');

  // API URLs
  const BACKEND_URL = import.meta.env.DEV
    ? 'http://localhost:5000'
    : (import.meta.env.VITE_API_URL || '');
  const API_JOBS = `${BACKEND_URL}/api/jobs`;
  const API_APPS = `${BACKEND_URL}/api/applications`;

  // Trigger floating toast
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3500);
  };

  // 1. Fetch all jobs (READ)
  const fetchJobs = () => {
    fetch(API_JOBS)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.log('Error fetching jobs:', err));
  };

  // 2. Fetch all applications (READ)
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
      // UPDATE
      fetch(`${API_JOBS}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })
        .then(() => {
          fetchJobs();
          resetForm();
          setActiveTab('browse');
          showToast(`Updated "${title}" successfully!`);
        })
        .catch((err) => console.log(err));
    } else {
      // CREATE
      fetch(API_JOBS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })
        .then(() => {
          fetchJobs();
          resetForm();
          setActiveTab('browse');
          showToast(`Published "${title}" at ${company}!`);
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
    setActiveTab('post');
    setApplyingJob(null);
  };

  // 5. Delete a job
  const handleDelete = (id, roleTitle) => {
    if (window.confirm(`Are you sure you want to delete "${roleTitle}"?`)) {
      fetch(`${API_JOBS}/${id}`, {
        method: 'DELETE',
      })
        .then(() => {
          fetchJobs();
          showToast(`Opportunity "${roleTitle}" deleted.`);
        })
        .catch((err) => console.log(err));
    }
  };

  // Reset form inputs
  const resetForm = () => {
    setTitle('');
    setCompany('');
    setType('Job');
    setStipend('');
    setEditId(null);
  };

  // 6. Submit Application via Modal
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
        showToast(`🎉 Applied to ${applyingJob.title} at ${applyingJob.company}!`);
        setApplyingJob(null);
        setApplicantName('');
        setApplicantEmail('');
        fetchApplications();
      })
      .catch((err) => console.log(err));
  };

  // Filter jobs based on search & category
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || job.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-wrapper">
      {/* ==================== NAVBAR ==================== */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">💼</div>
          <div className="brand-info">
            <h1>Job & Internship Portal</h1>
            <p>Student Career & Placement Network • MERN Stack</p>
          </div>
        </div>
        <div className="nav-actions">
          <div className="db-pill">
            <span className="pulse-dot"></span>
            MongoDB Live
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setActiveTab('post');
            }}
          >
            ➕ Post Opening
          </button>
        </div>
      </header>

      {/* ==================== STATS METRICS BAR ==================== */}
      <section className="stats-grid">
        <div
          className="stat-card"
          onClick={() => {
            setCategoryFilter('all');
            setActiveTab('browse');
          }}
        >
          <div className="stat-icon blue">💼</div>
          <div className="stat-content">
            <span className="stat-val">{jobs.length}</span>
            <span className="stat-lbl">Total Opportunities</span>
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => {
            setCategoryFilter('Job');
            setActiveTab('browse');
          }}
        >
          <div className="stat-icon green">🎯</div>
          <div className="stat-content">
            <span className="stat-val">
              {jobs.filter((j) => j.type === 'Job').length}
            </span>
            <span className="stat-lbl">Full-Time Jobs</span>
          </div>
        </div>

        <div
          className="stat-card"
          onClick={() => {
            setCategoryFilter('Internship');
            setActiveTab('browse');
          }}
        >
          <div className="stat-icon amber">🎓</div>
          <div className="stat-content">
            <span className="stat-val">
              {jobs.filter((j) => j.type === 'Internship').length}
            </span>
            <span className="stat-lbl">Student Internships</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('history')}>
          <div className="stat-icon purple">📋</div>
          <div className="stat-content">
            <span className="stat-val">{applications.length}</span>
            <span className="stat-lbl">Applications Logged</span>
          </div>
        </div>
      </section>

      {/* ==================== TAB NAVIGATION ==================== */}
      <nav className="tab-nav">
        <button
          className={`tab-nav-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          🔍 Browse Opportunities
          <span className="tab-badge">{jobs.length}</span>
        </button>
        <button
          className={`tab-nav-btn ${activeTab === 'post' ? 'active' : ''}`}
          onClick={() => {
            if (!editId) resetForm();
            setActiveTab('post');
          }}
        >
          {editId ? '✏️ Edit Opportunity' : '➕ Post a Job'}
        </button>
        <button
          className={`tab-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📋 Application History
          <span className="tab-badge">{applications.length}</span>
        </button>
      </nav>

      {/* ==================== TAB 1: BROWSE OPPORTUNITIES ==================== */}
      {activeTab === 'browse' && (
        <div>
          {/* Toolbar & Filters */}
          <div className="toolbar">
            <div className="search-wrapper">
              <span className="search-icon-svg">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by role title, technology, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <button
                className={`filter-pill ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('all')}
              >
                All Roles ({jobs.length})
              </button>
              <button
                className={`filter-pill ${categoryFilter === 'Job' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('Job')}
              >
                Jobs ({jobs.filter((j) => j.type === 'Job').length})
              </button>
              <button
                className={`filter-pill ${categoryFilter === 'Internship' ? 'active' : ''}`}
                onClick={() => setCategoryFilter('Internship')}
              >
                Internships ({jobs.filter((j) => j.type === 'Internship').length})
              </button>
            </div>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid / Cards View"
              >
                🎴 Cards
              </button>
              <button
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Table View"
              >
                📊 Table
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔎</div>
              <h4>No opportunities found</h4>
              <p>Try adjusting your search query or publish a new role.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setActiveTab('post');
                }}
              >
                ➕ Post New Opportunity
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ===== CARDS GRID VIEW ===== */
            <div className="cards-grid">
              {filteredJobs.map((job) => {
                const avatar = getCompanyAvatar(job.company);
                return (
                  <div className="job-card" key={job._id}>
                    <div>
                      <div className="card-top">
                        <div
                          className="company-avatar"
                          style={{ background: avatar.bg }}
                        >
                          {avatar.char}
                        </div>
                        <div className="card-title-group">
                          <h3 className="card-role">{job.title}</h3>
                          <p className="card-company">🏢 {job.company}</p>
                        </div>
                      </div>

                      <div className="card-badges">
                        <span
                          className={`badge ${
                            job.type === 'Internship'
                              ? 'badge-internship'
                              : 'badge-job'
                          }`}
                        >
                          {job.type === 'Internship' ? '🎓 Internship' : '💼 Full-Time'}
                        </span>
                        <span className="badge badge-stipend">
                          💰 {job.stipend}
                        </span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <span className="card-date">
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString()
                          : 'Recently added'}
                      </span>
                      <div className="card-actions">
                        <button
                          className="btn btn-success"
                          onClick={() => setApplyingJob(job)}
                        >
                          Apply Now
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => handleEdit(job)}
                          title="Edit Job"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-danger-ghost btn-icon"
                          onClick={() => handleDelete(job._id, job.title)}
                          title="Delete Job"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ===== TABLE VIEW ===== */
            <div className="table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Opportunity</th>
                    <th>Type</th>
                    <th>Compensation</th>
                    <th>Posted</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => {
                    const avatar = getCompanyAvatar(job.company);
                    return (
                      <tr key={job._id}>
                        <td>
                          <div className="company-cell">
                            <div
                              className="mini-avatar"
                              style={{ background: avatar.bg }}
                            >
                              {avatar.char}
                            </div>
                            <div>
                              <strong>{job.title}</strong>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {job.company}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              job.type === 'Internship'
                                ? 'badge-internship'
                                : 'badge-job'
                            }`}
                          >
                            {job.type}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-stipend">
                            {job.stipend}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {job.createdAt
                            ? new Date(job.createdAt).toLocaleDateString()
                            : 'Recent'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '6px 12px' }}
                            onClick={() => setApplyingJob(job)}
                          >
                            Apply
                          </button>
                          <button
                            className="btn btn-ghost btn-icon"
                            style={{ display: 'inline-flex', margin: '0 4px' }}
                            onClick={() => handleEdit(job)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-danger-ghost btn-icon"
                            style={{ display: 'inline-flex' }}
                            onClick={() => handleDelete(job._id, job.title)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: POST / EDIT A JOB ==================== */}
      {activeTab === 'post' && (
        <div className="post-layout">
          {/* Form Card */}
          <div className="post-card">
            <h3>{editId ? '✏️ Edit Opportunity' : '🚀 Publish a New Opportunity'}</h3>
            <p>
              {editId
                ? 'Update the fields below to modify your listing in MongoDB.'
                : 'Share a new job or internship opportunity with students.'}
            </p>

            <form onSubmit={handleSubmitJob}>
              <div className="form-field">
                <label>Job / Internship Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AI Research Intern, Backend Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Google, Microsoft, Infosys"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Opportunity Type *</label>
                <select
                  className="form-input"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Job">💼 Full-Time Job</option>
                  <option value="Internship">🎓 Student Internship</option>
                </select>
              </div>

              <div className="form-field">
                <label>Stipend / Salary *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ₹35,000 / month or ₹12 LPA"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editId ? '💾 Save Changes' : '🚀 Publish to Portal'}
                </button>
                {editId ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      resetForm();
                      setActiveTab('browse');
                    }}
                  >
                    Cancel Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setTitle('Cloud Engineer Intern');
                      setCompany('Amazon AWS');
                      setType('Internship');
                      setStipend('₹45,000 / month');
                    }}
                  >
                    ✨ Auto-Fill Demo
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Live Preview Card */}
          <div className="preview-container">
            <div className="preview-header">
              <h4>Live Card Preview</h4>
              <span className="preview-pill">Real-Time Sync</span>
            </div>

            <div className="job-card" style={{ boxShadow: 'none' }}>
              <div>
                <div className="card-top">
                  <div
                    className="company-avatar"
                    style={{ background: getCompanyAvatar(company).bg }}
                  >
                    {getCompanyAvatar(company).char}
                  </div>
                  <div className="card-title-group">
                    <h3 className="card-role">{title || 'Role Title Here'}</h3>
                    <p className="card-company">🏢 {company || 'Company Name'}</p>
                  </div>
                </div>

                <div className="card-badges">
                  <span
                    className={`badge ${
                      type === 'Internship' ? 'badge-internship' : 'badge-job'
                    }`}
                  >
                    {type === 'Internship' ? '🎓 Internship' : '💼 Full-Time'}
                  </span>
                  <span className="badge badge-stipend">
                    💰 {stipend || 'Compensation'}
                  </span>
                </div>
              </div>

              <div className="card-footer">
                <span className="card-date">Just now</span>
                <button className="btn btn-success" disabled style={{ opacity: 0.9 }}>
                  Apply Now
                </button>
              </div>
            </div>

            <div
              style={{
                marginTop: '16px',
                fontSize: '12px',
                color: '#64748b',
                lineHeight: 1.4,
              }}
            >
              💡 This preview reflects how candidates will view your posting on the main job board.
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: APPLICATION HISTORY ==================== */}
      {activeTab === 'history' && (
        <div className="history-card">
          <div className="history-header">
            <div>
              <h3>📋 Candidate Application Tracker</h3>
              <p style={{ margin: '3px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                All student applications stored persistently in MongoDB
              </p>
            </div>
            <div className="status-badge">
              🟢 {applications.length} Submissions Logged
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state" style={{ border: 'none' }}>
              <div className="empty-state-icon">📭</div>
              <h4>No applications received yet</h4>
              <p>Explore open roles and apply to view your submission history here.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('browse')}>
                Browse Open Roles
              </button>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Candidate</th>
                    <th>Role Applied</th>
                    <th>Company</th>
                    <th>Contact Email</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, index) => {
                    const avatar = getCompanyAvatar(app.company);
                    return (
                      <tr key={app._id}>
                        <td style={{ color: '#94a3b8', fontWeight: 'bold' }}>
                          {index + 1}
                        </td>
                        <td>
                          <strong>{app.name}</strong>
                        </td>
                        <td>
                          <span style={{ color: '#1e293b', fontWeight: 600 }}>
                            {app.jobTitle}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                background: avatar.bg,
                                color: '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: 'bold',
                              }}
                            >
                              {avatar.char}
                            </span>
                            {app.company}
                          </div>
                        </td>
                        <td>
                          <a
                            href={`mailto:${app.email}`}
                            style={{ color: '#4f46e5', textDecoration: 'none' }}
                          >
                            {app.email}
                          </a>
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {app.appliedAt
                            ? new Date(app.appliedAt).toLocaleDateString()
                            : 'Recent'}
                        </td>
                        <td>
                          <span className="status-badge">✅ Received</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== INTERACTIVE APPLY MODAL ==================== */}
      {applyingJob && (
        <div className="modal-overlay" onClick={() => setApplyingJob(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Submit Your Application</h3>
                <p>Express your interest for this opportunity</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setApplyingJob(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-job-summary">
                <div>
                  <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                    {applyingJob.title}
                  </strong>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    🏢 {applyingJob.company}
                  </div>
                </div>
                <span className="badge badge-stipend">
                  💰 {applyingJob.stipend}
                </span>
              </div>

              <form onSubmit={handleApplySubmit}>
                <div className="form-field">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your legal full name"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>College / Personal Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@university.edu"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginTop: '22px', display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                    🚀 Send Application
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setApplyingJob(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FLOATING TOAST ==================== */}
      {toast && (
        <div className="toast">
          <span className="toast-icon">✓</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default App;
