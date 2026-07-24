import React from 'react'
import logo from '../pages/maplskill.png'

/* Marketing panel shown beside both Login and Register forms. */
export default function AuthHero() {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <img src={logo} className="hero-logo" alt="MAPL SkillLab" />

        <span className="platform-badge">Industrial Automation LMS</span>

        <h1>
          Learn Industrial Automation
          <span>Like Never Before</span>
        </h1>

        <p>
          Master DCS, PLC, SCADA, Instrumentation, Industrial Networking and Process
          Automation through structured learning paths designed by industry experts.
        </p>

        <div className="feature-list">
          <div className="feature">✓ Learn without limits</div>
          <div className="feature">✓ Knowledge on demand</div>
          <div className="feature">✓ Certificates</div>
          <div className="feature">✓ Lifetime access</div>
        </div>

        <div className="stats">
          <div className="stat-card"><h2>Learn</h2><span>Structured Modules</span></div>
          <div className="stat-card"><h2>Practice</h2><span>Hands-on Exercises</span></div>
          <div className="stat-card"><h2>Assess</h2><span>Knowledge Tests</span></div>
          <div className="stat-card"><h2>Grow</h2><span>Career Development</span></div>
        </div>
      </div>
    </div>
  )
}
