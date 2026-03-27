const Dashboard = () => {
  return (
    <section className="page-section">
      <div className="hero-card">
        <span className="hero-tag">Overview</span>
        <h2>Your Fitness Dashboard</h2>
        <p>
          Track daily workouts, review trained muscle groups, and get smarter
          workout suggestions.
        </p>
      </div>

      <div className="stats-grid">
        <div className="info-card">
          <h3>Today’s Workout</h3>
          <p>No workout logged yet.</p>
        </div>
        <div className="info-card">
          <h3>Streak</h3>
          <p>0 days</p>
        </div>
        <div className="info-card">
          <h3>Muscles Trained</h3>
          <p>0 groups</p>
        </div>
        <div className="info-card">
          <h3>Suggestion</h3>
          <p>Start with a light full-body session.</p>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;