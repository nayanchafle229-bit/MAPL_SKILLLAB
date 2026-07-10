import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { PageLoader, EmptyState } from "../components/UI";
import "../styles/Courses.css";

function getYouTubeId(url) {
  if (!url) return null;

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );

  return match ? match[1] : null;
}

export default function Courses() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {

    api
      .get("/course")
      .then(({ data }) => {

        setCourses(data.courses || []);

      })
      .finally(() => {

        setLoading(false);

      });

  }, []);

  const categories = [
    "All",
    ...new Set(
      courses
        .map((c) => c.category)
        .filter(Boolean)
    ),
  ];

  const filteredCourses = courses.filter((course) => {

    const searchMatch =
      course.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      course.description
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||

      course.category
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const categoryMatch =
      selectedCategory === "All" ||
      course.category === selectedCategory;

    return searchMatch && categoryMatch;

  });

  const featuredCourse =
    filteredCourses.length > 0
      ? filteredCourses[0]
      : null;

  if (loading) {

    return (

      <Layout title="Courses">

        <PageLoader />

      </Layout>

    );

  }

  return (

  <Layout title="Courses">

    <div className="courses-page">

      {/* ================= HERO ================= */}

      <section className="lms-hero">

        <div className="hero-left">

          <span className="hero-badge">

            MAPL SkillLab

          </span>

          <h1>

            Industrial Automation
            <br />
            Learning Platform

          </h1>

          <p>

            Master DCS, PLC, SCADA, Instrumentation,
            Industrial Networking and Automation
            technologies through structured internal
            learning programs.

          </p>

          {/* Search */}

          <div className="hero-search">

            <input

              type="text"

              placeholder="Search learning modules..."

              value={search}

              onChange={(e)=>setSearch(e.target.value)}

            />

          </div>

          {/* Categories */}

          <div className="category-row">

            {categories.map((category)=>(

              <button

                key={category}

                className={
                  selectedCategory===category
                    ?
                    "category-chip active"
                    :
                    "category-chip"
                }

                onClick={()=>setSelectedCategory(category)}

              >

                {category}

              </button>

            ))}

          </div>

        </div>

        {/* Right */}

        <div className="hero-right">

          <div className="featured-card">

            <span className="featured-title">

              FEATURED COURSE

            </span>

            {featuredCourse ? (

              <>

                <h2>

                  {featuredCourse.title}

                </h2>

                <p>

                  {featuredCourse.description}

                </p>

                <div className="featured-meta">

                  <span>

                    {featuredCourse.category}

                  </span>

                  <span>

                    {new Date(
                      featuredCourse.createdAt
                    ).toLocaleDateString("en-IN")}

                  </span>

                </div>

                <a

                  href={featuredCourse.videoUrl}

                  target="_blank"

                  rel="noreferrer"

                  className="hero-button"

                >

                  ▶ Start Learning

                </a>

              </>

            ) : (

              <>

                <h2>

                  Welcome to MAPL SkillLab

                </h2>

                <p>

                  Courses added by administrators
                  will automatically appear here.

                </p>

              </>

            )}

          </div>

        </div>

      </section>

      {/* ================= TOOLBAR ================= */}

<section className="courses-toolbar">

  <div>

    <h2>Learning Modules</h2>

    <p>

      Browse all internal MAPL SkillLab courses.

    </p>

  </div>

  <div className="toolbar-right">

    <div className="course-counter">

      {filteredCourses.length}

      <span>Courses</span>

    </div>

  </div>

</section>

    {/* ================= COURSE GRID ================= */}

<section className="course-grid">

  {filteredCourses.length === 0 ? (

    <EmptyState

      title="No Courses Found"

      description="Courses created by the administrator will appear here."

    />

  ) : (

    filteredCourses.map((course) => {

      const ytId = getYouTubeId(course.videoUrl);

      const thumbnail = ytId

        ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`

        : null;

      return (

        <article

          className="course-card"

          key={course._id}

        >

          {/* Thumbnail */}

          <div className="course-thumbnail">

            {thumbnail ? (

              <img

                src={thumbnail}

                alt={course.title}

              />

            ) : (

              <div className="thumbnail-placeholder">

                No Preview

              </div>

            )}

            <div className="play-overlay">

              <a

                href={course.videoUrl}

                target="_blank"

                rel="noreferrer"

                className="play-button"

              >

                ▶

              </a>

            </div>

            {course.category && (

              <span className="course-category">

                {course.category}

              </span>

            )}

          </div>

          {/* Body */}

          <div className="course-content">

            <div className="course-date">

              Added{" "}

              {new Date(course.createdAt).toLocaleDateString("en-IN")}

            </div>

            <h3>

              {course.title}

            </h3>

            <p>

              {course.description}

            </p>

            <div className="course-footer">

              <a

                href={course.videoUrl}

                target="_blank"

                rel="noreferrer"

                className="start-learning"

              >

                Start Learning →

              </a>

            </div>

          </div>

        </article>

      );

    })

  )}
</section>

    </div>

  </Layout>

  );

}