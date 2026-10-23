import React, { useState, useEffect } from 'react';
import './App.css';

// Dynamic company avatar generator with vibrant gradients
const getCompanyAvatar = (name = 'Company') => {
  const char = (name.trim()[0] || 'C').toUpperCase();
  const gradients = [
    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', // Indigo/Purple
    'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)', // Sky/Blue
    'linear-gradient(135deg, #059669 0%, #10b981 100%)', // Emerald
    'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', // Amber
    'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)', // Rose
    'linear-gradient(135deg, #9333ea 0%, #c026d3 100%)', // Purple/Fuchsia
  ];
  const index = (name.charCodeAt(0) || 0) % gradients.length;
  return { char, bg: gradients[index] };
};

// Inspiring tips for freshers & college students
const FRESHER_TIPS = [
  '💡 Tip: Highlight academic projects and hackathons if you do not have prior work experience!',
  '🚀 Tip: Add a clean GitHub or portfolio link—recruiters love seeing real code over certificates.',
  '🎯 Tip: Tailor your resume summary to match 2-3 key skills mentioned in the job role.',
  '💼 Tip: Internships are the #1 pipeline for PPOs (Pre-Placement Offers). Apply early!',
  '⚡ Tip: For freshers, a 1-page clean resume formatted as PDF is the industry golden standard.',
  '🌟 Tip: Practice explaining your college project architecture clearly—examiners and interviewers look for problem-solving fundamentals.',
];

function App() {
  // Navigation: 'browse' | 'post' | 'history'
  const [activeTab, setActiveTab] = useState('browse');

  // View mode in Browse: 'grid' (cards) | 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterChip, setFilterChip] = useState('all'); // 'all' | 'fresher' | 'Job' | 'Internship' | 'saved' | 'highStipend'

  // Interactive Saved / Bookmarked roles (stored in localStorage)
  const [savedIds, setSavedIds] = useState(() => {
    try {
      const stored = localStorage.getItem('saved_jobs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Fresher Tip of the Day state
  const [tipIndex, setTipIndex] = useState(0);

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState('Job');
  const [stipend, setStipend] = useState('');
  const [location, setLocation] = useState('Remote');
  const [skills, setSkills] = useState('React, JavaScript, Node.js');
  const [editId, setEditId] = useState(null);

  // Apply Modal state (fresher-tailored fields)
  const [applyingJob, setApplyingJob] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantDegree, setApplicantDegree] = useState('B.Tech / B.E');
  const [applicantGradYear, setApplicantGradYear] = useState('2026');
  const [applicantPortfolio, setApplicantPortfolio] = useState('');

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

  // Save/Unsave job bookmark
  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    let updated;
    if (savedIds.includes(id)) {
      updated = savedIds.filter((item) => item !== id);
      showToast('Removed from saved roles');
    } else {
      updated = [...savedIds, id];
      showToast('❤️ Saved to your shortlist!');
    }
    setSavedIds(updated);
    try {
      localStorage.setItem('saved_jobs', JSON.stringify(updated));
    } catch (err) {
      console.log(err);
    }
  };

  // Shuffle Fresher tip
  const handleShuffleTip = () => {
    setTipIndex((prev) => (prev + 1) % FRESHER_TIPS.length);
  };

  // 3. Handle Add / Update Job
  const handleSubmitJob = (e) => {
    e.preventDefault();
    const jobData = {
      title,
      company,
      type,
      stipend,
      location: location || 'Remote / Pan-India',
      skills: skills || 'Web Dev, Problem Solving',
      isFresher: true,
    };

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
          showToast(`🚀 Published "${title}" at ${company}!`);
        })
        .catch((err) => console.log(err));
    }
  };

  // 4. Fill form for editing
  const handleEdit = (job) => {
    setTitle(job.title);
    setCompany(job.company);
    setType(job.type);
    setStipend(job.stipend);
    setLocation(job.location || 'Remote');
    setSkills(job.skills || 'React, JavaScript');
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
    setLocation('Remote');
    setSkills('React, JavaScript, Node.js');
    setEditId(null);
  };

  // 6. Submit Fresher Application via Modal
  const handleApplySubmit = (e) => {
    e.preventDefault();
    const appData = {
      jobTitle: applyingJob.title,
      company: applyingJob.company,
      name: applicantName,
      email: applicantEmail,
      degree: applicantDegree,
      gradYear: applicantGradYear,
      portfolio: applicantPortfolio,
    };

    fetch(API_APPS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData),
    })
      .then((res) => res.json())
      .then(() => {
        showToast(`🎉 Boom! Application submitted for ${applyingJob.title}!`);
        setApplyingJob(null);
        setApplicantName('');
        setApplicantEmail('');
        setApplicantPortfolio('');
        fetchApplications();
      })
      .catch((err) => console.log(err));
  };

  // Filter jobs based on search & fresher filter chips
  const filteredJobs = jobs.filter((job) => {
    const query = search.toLowerCase();
    const matchesSearch =
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      (job.skills && job.skills.toLowerCase().includes(query));

    let matchesChip = true;
    if (filterChip === 'Job') matchesChip = job.type === 'Job';
    if (filterChip === 'Internship') matchesChip = job.type === 'Internship';
    if (filterChip === 'saved') matchesChip = savedIds.includes(job._id);
    if (filterChip === 'fresher') matchesChip = job.isFresher !== false;
    if (filterChip === 'highStipend') {
      const num = parseInt((job.stipend || '').replace(/[^0-9]/g, ''), 10);
      matchesChip = num >= 20 || (job.stipend || '').toLowerCase().includes('lpa');
    }

    return matchesSearch && matchesChip;
  });

  return (
    <div className="app-wrapper">
      {/* ==================== VIBRANT HERO NAVBAR ==================== */}
      <header className="hero-banner">
        <div className="hero-content">
          <h1>
            <span>🚀</span> LaunchPad Career Portal
          </h1>
          <p>
            Curated jobs, verified paid internships, and 1-click applications for students and fresh graduates.
          </p>
        </div>
        <div className="hero-actions">
          <div className="live-badge">
            <span className="live-pulse"></span>
            MongoDB Live
          </div>
          <button
            className="btn-hero"
            onClick={() => {
              resetForm();
              setActiveTab('post');
            }}
          >
            ➕ Post Role
          </button>
        </div>
      </header>

      {/* ==================== COLORFUL STATS DASHBOARD ==================== */}
      <section className="stats-grid">
        <div
          className="stat-card c-blue"
          onClick={() => {
            setFilterChip('all');
            setActiveTab('browse');
          }}
        >
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <span className="stat-val">{jobs.length}</span>
            <span className="stat-lbl">Active Roles</span>
          </div>
        </div>

        <div
          className="stat-card c-purple"
          onClick={() => {
            setFilterChip('Job');
            setActiveTab('browse');
          }}
        >
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <span className="stat-val">
              {jobs.filter((j) => j.type === 'Job').length}
            </span>
            <span className="stat-lbl">Full-Time Jobs</span>
          </div>
        </div>

        <div
          className="stat-card c-amber"
          onClick={() => {
            setFilterChip('Internship');
            setActiveTab('browse');
          }}
        >
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <span className="stat-val">
              {jobs.filter((j) => j.type === 'Internship').length}
            </span>
            <span className="stat-lbl">Student Internships</span>
          </div>
        </div>

        <div
          className="stat-card c-green"
          onClick={() => setActiveTab('history')}
        >
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-val">{applications.length}</span>
            <span className="stat-lbl">Applications Logged</span>
          </div>
        </div>
      </section>

      {/* ==================== FRESHER CAREER LAUNCHPAD TIP ==================== */}
      <div className="fresher-hub">
        <div className="fresher-hub-left">
          <span className="fresher-badge-tag">Fresher Boost</span>
          <p className="fresher-tip-text">{FRESHER_TIPS[tipIndex]}</p>
        </div>
        <div className="fresher-hub-actions">
          <button className="btn-pill-small" onClick={handleShuffleTip}>
            ✨ Next Tip
          </button>
        </div>
      </div>

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
          {editId ? '✏️ Edit Role' : '➕ Post an Opening'}
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
          {/* Search & Fresher Quick-Filter Chips */}
          <div className="toolbar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search roles, companies (e.g. Google), or tech skills (React, Python)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Cards View"
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

          {/* Fresher Interactive Filter Chips */}
          <div className="fresher-chips" style={{ marginBottom: '20px' }}>
            <button
              className={`chip ${filterChip === 'all' ? 'active' : ''}`}
              onClick={() => setFilterChip('all')}
            >
              🌟 All Roles ({jobs.length})
            </button>
            <button
              className={`chip fresher-chip ${filterChip === 'fresher' ? 'active' : ''}`}
              onClick={() => setFilterChip('fresher')}
            >
              🎓 Freshers Welcome
            </button>
            <button
              className={`chip ${filterChip === 'Job' ? 'active' : ''}`}
              onClick={() => setFilterChip('Job')}
            >
              💼 Full-Time Jobs ({jobs.filter((j) => j.type === 'Job').length})
            </button>
            <button
              className={`chip ${filterChip === 'Internship' ? 'active' : ''}`}
              onClick={() => setFilterChip('Internship')}
            >
              🚀 Internships ({jobs.filter((j) => j.type === 'Internship').length})
            </button>
            <button
              className={`chip saved-chip ${filterChip === 'saved' ? 'active' : ''}`}
              onClick={() => setFilterChip('saved')}
            >
              ❤️ Shortlisted ({savedIds.length})
            </button>
            <button
              className={`chip ${filterChip === 'highStipend' ? 'active' : ''}`}
              onClick={() => setFilterChip('highStipend')}
            >
              💰 High Package
            </button>
          </div>

          {/* Empty State */}
          {filteredJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔎</div>
              <h4>No matching opportunities found</h4>
              <p>Try switching filters or be the first to publish a new opening!</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setActiveTab('post');
                }}
              >
                ➕ Post an Opportunity
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* ===== VIBRANT CARDS VIEW ===== */
            <div className="cards-grid">
              {filteredJobs.map((job) => {
                const avatar = getCompanyAvatar(job.company);
                const isSaved = savedIds.includes(job._id);
                const isIntern = job.type === 'Internship';

                return (
                  <div
                    className={`job-card ${isIntern ? 'type-intern' : ''}`}
                    key={job._id}
                  >
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
                        <button
                          className={`card-bookmark-btn ${isSaved ? 'saved' : ''}`}
                          onClick={(e) => toggleBookmark(job._id, e)}
                          title={isSaved ? 'Remove from saved' : 'Save for later'}
                        >
                          {isSaved ? '❤️' : '🤍'}
                        </button>
                      </div>

                      <div className="card-badges">
                        <span className="badge badge-fresher">
                          🎓 Freshers Eligible
                        </span>
                        <span
                          className={`badge ${
                            isIntern ? 'badge-internship' : 'badge-job'
                          }`}
                        >
                          {isIntern ? '⚡ Internship' : '💼 Full-Time'}
                        </span>
                        <span className="badge badge-stipend">
                          💰 {job.stipend}
                        </span>
                        {job.location && (
                          <span className="badge badge-location">
                            📍 {job.location}
                          </span>
                        )}
                      </div>

                      {job.skills && (
                        <div className="card-skills">
                          <span>🛠️</span> {job.skills}
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <span className="card-date">
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString()
                          : 'Just now'}
                      </span>
                      <div className="card-actions">
                        <button
                          className="btn btn-apply-main"
                          onClick={() => setApplyingJob(job)}
                        >
                          Apply Now 🚀
                        </button>
                        <button
                          className="btn-ghost-icon"
                          onClick={() => handleEdit(job)}
                          title="Edit Job"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-ghost-icon btn-danger-icon"
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
                    <th>Opportunity & Company</th>
                    <th>Type</th>
                    <th>Compensation</th>
                    <th>Key Skills</th>
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
                                {job.company} • 📍 {job.location || 'Remote'}
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
                        <td style={{ fontSize: '12px', color: '#4338ca' }}>
                          {job.skills || 'General Tech'}
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {job.createdAt
                            ? new Date(job.createdAt).toLocaleDateString()
                            : 'Recent'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-apply-main"
                            style={{ padding: '6px 12px' }}
                            onClick={() => setApplyingJob(job)}
                          >
                            Apply
                          </button>
                          <button
                            className="btn-ghost-icon"
                            style={{ display: 'inline-flex', margin: '0 4px' }}
                            onClick={() => handleEdit(job)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-ghost-icon btn-danger-icon"
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
            <h3>{editId ? '✏️ Edit Opening' : '🚀 Publish an Opportunity'}</h3>
            <p>
              {editId
                ? 'Update the fields below to modify your listing in MongoDB.'
                : 'Connect with talented students and fresh graduates.'}
            </p>

            <form onSubmit={handleSubmitJob}>
              <div className="form-field">
                <label>Job / Internship Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AI Research Intern, Junior Web Developer"
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

              <div className="form-row">
                <div className="form-field">
                  <label>Role Type *</label>
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
                  <label>Stipend / Package *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. ₹30,000 / mo or ₹9 LPA"
                    value={stipend}
                    onChange={(e) => setStipend(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Location / Work Mode</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Remote, Bangalore, Hybrid"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Required Tech Skills</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. React, Python, Git"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editId ? '💾 Save Changes' : '🚀 Publish to Portal'}
                </button>
                {editId ? (
                  <button
                    type="button"
                    className="btn btn-pill-small"
                    style={{ padding: '0 16px' }}
                    onClick={() => {
                      resetForm();
                      setActiveTab('browse');
                    }}
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-pill-small"
                    style={{ padding: '0 16px' }}
                    onClick={() => {
                      setTitle('Full Stack Developer Intern');
                      setCompany('Google Cloud');
                      setType('Internship');
                      setStipend('₹60,000 / month');
                      setLocation('Remote');
                      setSkills('MERN Stack, Docker, TypeScript');
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
              <span className="badge badge-fresher">Real-Time Sync</span>
            </div>

            <div
              className={`job-card ${type === 'Internship' ? 'type-intern' : ''}`}
              style={{ boxShadow: 'none' }}
            >
              <div>
                <div className="card-top">
                  <div
                    className="company-avatar"
                    style={{ background: getCompanyAvatar(company).bg }}
                  >
                    {getCompanyAvatar(company).char}
                  </div>
                  <div className="card-title-group">
                    <h3 className="card-role">{title || 'Opportunity Title'}</h3>
                    <p className="card-company">🏢 {company || 'Company Name'}</p>
                  </div>
                  <span style={{ fontSize: '18px' }}>❤️</span>
                </div>

                <div className="card-badges">
                  <span className="badge badge-fresher">
                    🎓 Freshers Eligible
                  </span>
                  <span
                    className={`badge ${
                      type === 'Internship' ? 'badge-internship' : 'badge-job'
                    }`}
                  >
                    {type === 'Internship' ? '⚡ Internship' : '💼 Full-Time'}
                  </span>
                  <span className="badge badge-stipend">
                    💰 {stipend || 'Competitive'}
                  </span>
                  <span className="badge badge-location">
                    📍 {location || 'Remote'}
                  </span>
                </div>

                <div className="card-skills">
                  <span>🛠️</span> {skills || 'JavaScript, Problem Solving'}
                </div>
              </div>

              <div className="card-footer">
                <span className="card-date">Just now</span>
                <button
                  className="btn btn-apply-main"
                  disabled
                  style={{ opacity: 0.9 }}
                >
                  Apply Now 🚀
                </button>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '14px', lineHeight: 1.4 }}>
              💡 Freshers can see the skills tag, compensation, and 1-click apply button directly from the main feed.
            </p>
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
                    <th>Degree & Batch</th>
                    <th>Role Applied</th>
                    <th>Company</th>
                    <th>Contact Email</th>
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
                          {app.portfolio && (
                            <div style={{ fontSize: '11px', marginTop: '2px' }}>
                              <a
                                href={app.portfolio}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#6366f1' }}
                              >
                                🔗 Portfolio / GitHub
                              </a>
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '13px', color: '#475569' }}>
                          {app.degree || 'B.Tech / B.E'} • {app.gradYear || '2026'}
                        </td>
                        <td>
                          <span style={{ color: '#1e293b', fontWeight: 700 }}>
                            {app.jobTitle}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
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

      {/* ==================== FRESHER-FRIENDLY APPLY MODAL ==================== */}
      {applyingJob && (
        <div className="modal-overlay" onClick={() => setApplyingJob(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>🎓 Apply for {applyingJob.title}</h3>
                <p>Express your interest with zero prior experience required</p>
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
                    🏢 {applyingJob.company} • 📍 {applyingJob.location || 'Remote'}
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
                    placeholder="e.g. John Doe"
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
                    placeholder="john@university.edu"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Degree / Branch</label>
                    <select
                      className="form-input"
                      value={applicantDegree}
                      onChange={(e) => setApplicantDegree(e.target.value)}
                    >
                      <option value="B.Tech Computer Science">B.Tech CS / IT</option>
                      <option value="BCA / MCA">BCA / MCA</option>
                      <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                      <option value="B.Tech Other Branches">B.Tech Other</option>
                      <option value="Any Graduate / Diploma">Any Graduate</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Passing Out Year</label>
                    <select
                      className="form-input"
                      value={applicantGradYear}
                      onChange={(e) => setApplicantGradYear(e.target.value)}
                    >
                      <option value="2025">2025 (Graduated / Final Year)</option>
                      <option value="2026">2026 (Batch of 2026)</option>
                      <option value="2027">2027 (Pre-final Year)</option>
                      <option value="2028">2028 (Sophomore)</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label>GitHub / Portfolio / LinkedIn Link (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://github.com/your-username"
                    value={applicantPortfolio}
                    onChange={(e) => setApplicantPortfolio(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-apply-main" style={{ flex: 1 }}>
                    🚀 Submit Application
                  </button>
                  <button
                    type="button"
                    className="btn btn-pill-small"
                    style={{ padding: '0 18px' }}
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
          <div className="toast-icon">✓</div>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default App;
