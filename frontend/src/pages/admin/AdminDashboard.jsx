import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Layout from "../../components/Layout";
import { PageLoader } from "../../components/UI";

import "../../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats").catch(() => ({ data: {} })),
      api.get("/admin/users").catch(() => ({ data: { users: [] } })),
      api.get("/admin/courses").catch(() => ({ data: { courses: [] } })),
      api.get("/admin/quiz").catch(() => ({ data: { quizzes: [] } })),
      api.get("/admin/results").catch(() => ({ data: { results: [] } })),
    ])
      .then(([sRes, uRes, cRes, qRes, rRes]) => {
        setStats(sRes.data.stats || {});
        setUsers(uRes.data.users || []);
        setCourses(cRes.data.courses || []);
        setQuizzes(qRes.data.quizzes || []);
        setResults(rRes.data.results || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <PageLoader />
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">

      <div className="admin-dashboard">

{/* ================= ADMIN HERO ================= */}

<section className="admin-hero">

  <div className="admin-hero-left">

    <span className="admin-badge">
      MAPL SkillLab Admin Panel
    </span>

    <h1>
      Welcome Back,
      <br />
      Administrator 👋
    </h1>

    <p>
      Manage users, courses, quizzes and platform performance
      from one centralized dashboard.
    </p>

    <div className="admin-actions">

      <Link
        to="/admin/courses"
        className="hero-btn primary"
      >
        + Add Course
      </Link>

      <Link
        to="/admin/quizzes"
        className="hero-btn secondary"
      >
        + Create Quiz
      </Link>

    </div>

  </div>

  <div className="admin-hero-right">

    <div className="hero-summary-card">

      <h3>Platform Summary</h3>

      <div className="summary-row">
        <span>Total Users</span>
        <strong>{stats.users}</strong>
      </div>

      <div className="summary-row">
        <span>Total Courses</span>
        <strong>{stats.courses}</strong>
      </div>

      <div className="summary-row">
        <span>Total Quizzes</span>
        <strong>{stats.quizzes}</strong>
      </div>

      <div className="summary-row">
        <span>Total Results</span>
        <strong>{stats.results}</strong>
      </div>

    </div>

  </div>

</section>
        {/* ================= ADMIN STATS ================= */}

        <section className="admin-stats">

          <div className="admin-stat-card blue">
            <div className="stat-icon">👥</div>
            <div>
              <h2>{users.length}</h2>
              <p>Total Users</p>
            </div>
          </div>

          <div className="admin-stat-card purple">
            <div className="stat-icon">📚</div>
            <div>
              <h2>{courses.length}</h2>
              <p>Total Courses</p>
            </div>
          </div>

          <div className="admin-stat-card green">
            <div className="stat-icon">📝</div>
            <div>
              <h2>{quizzes.length}</h2>
              <p>Total Quizzes</p>
            </div>
          </div>

          <div className="admin-stat-card orange">
            <div className="stat-icon">📊</div>
            <div>
              <h2>{results.length}</h2>
              <p>Total Results</p>
            </div>
          </div>

        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <section className="admin-actions">

          <div className="section-title">
            <div>
              <h2>Quick Actions</h2>
              <p>Frequently used administrator tools.</p>
            </div>
          </div>

          <div className="action-grid">

            <Link to="/admin/course/new" className="action-card">
              <div className="action-icon blue">📚</div>
              <h3>Add Course</h3>
              <p>Create a new learning module.</p>
              <span>Open →</span>
            </Link>

            <Link to="/admin/quiz/new" className="action-card">
              <div className="action-icon purple">📝</div>
              <h3>Create Quiz</h3>
              <p>Create assessments for learners.</p>
              <span>Open →</span>
            </Link>

            <Link to="/admin/users" className="action-card">
              <div className="action-icon green">👥</div>
              <h3>Manage Users</h3>
              <p>View and manage registered users.</p>
              <span>Open →</span>
            </Link>

            <Link to="/admin/courses" className="action-card">
              <div className="action-icon orange">🎓</div>
              <h3>Manage Courses</h3>
              <p>Edit existing learning modules.</p>
              <span>Open →</span>
            </Link>

            <Link to="/admin/quizzes" className="action-card">
              <div className="action-icon red">📋</div>
              <h3>Manage Quizzes</h3>
              <p>Edit or delete quizzes.</p>
              <span>Open →</span>
            </Link>

            <Link to="/admin/results" className="action-card">
              <div className="action-icon cyan">📈</div>
              <h3>Reports</h3>
              <p>View quiz reports and analytics.</p>
              <span>Open →</span>
            </Link>

          </div>

        </section>

        {/* ================= PLATFORM OVERVIEW ================= */}

        <section className="platform-overview">

          <div className="overview-card">

            <div className="overview-header">
              <h2>Recent Users</h2>
              <Link to="/admin/users">View All →</Link>
            </div>

            <div className="overview-list">

              {users.slice(0,5).map(user => (

                <div
                  key={user._id}
                  className="overview-item"
                >

                  <div className="overview-avatar">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="overview-content">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                  </div>

                </div>

              ))}

            </div>

          </div>

          <div className="overview-card">

            <div className="overview-header">
              <h2>Latest Courses</h2>
              <Link to="/admin/courses">View All →</Link>
            </div>

            <div className="overview-list">

              {courses.slice(0,5).map(course => (

                <div
                  key={course._id}
                  className="overview-item"
                >

                  <div className="course-icon">
                    📚
                  </div>

                  <div className="overview-content">
                    <h4>{course.title}</h4>
                    <p>{course.category}</p>
                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>
          
        
        
        {/* ================= FOOTER ================= */}

        <footer className="admin-footer">

          <div>
            © 2026 MAPL SkillLab
          </div>

          <div>
            Version 2.0 • Enterprise LMS
          </div>

        </footer>

      </div>

    </Layout>
  );
}