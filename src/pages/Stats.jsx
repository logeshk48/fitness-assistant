import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import "./Stats.css";

const AnimatedNumber = ({ value, duration = 900, suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = value / Math.max(duration / 16, 1);

    const timer = setInterval(() => {
      start += step;

      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <strong>
      {displayValue}
      {suffix}
    </strong>
  );
};

const Stats = () => {
  const [loading, setLoading] = useState(true);

  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [topMuscle, setTopMuscle] = useState("None");

  const [weeklyStats, setWeeklyStats] = useState([]);
  const [muscleStats, setMuscleStats] = useState([]);

  const fetchWorkouts = async () => {
    try {
      const workoutsRef = collection(db, "workouts");
      const q = query(workoutsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      calculateStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildWeeklyData = (data) => {
    const today = new Date();
    const weekDays = [];

    for (let i = 6; i >= 0; i--) {
      const current = new Date();
      current.setDate(today.getDate() - i);

      weekDays.push({
        dateKey: current.toISOString().split("T")[0],
        dayLabel: current.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0,
      });
    }

    data.forEach((item) => {
      const foundDay = weekDays.find((day) => day.dateKey === item.dateKey);
      if (foundDay) {
        foundDay.count += 1;
      }
    });

    setWeeklyStats(weekDays);
  };

  const buildMuscleDistribution = (data) => {
    const muscleCount = {};

    data.forEach((item) => {
      if (!item.muscleGroup) return;
      muscleCount[item.muscleGroup] = (muscleCount[item.muscleGroup] || 0) + 1;
    });

    const sorted = Object.entries(muscleCount)
      .map(([label, count]) => ({
        label,
        count,
        percent: data.length > 0 ? Math.round((count / data.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    setMuscleStats(sorted);

    if (sorted.length > 0) {
      setTopMuscle(sorted[0].label);
    } else {
      setTopMuscle("None");
    }
  };

  const calculateStats = (data) => {
    setTotalWorkouts(data.length);

    const sets = data.reduce((sum, item) => sum + (item.totalSets || 0), 0);
    setTotalSets(sets);

    const reps = data.reduce((sum, item) => sum + (item.totalReps || 0), 0);
    setTotalReps(reps);

    buildWeeklyData(data);
    buildMuscleDistribution(data);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const maxWeeklyCount = Math.max(...weeklyStats.map((day) => day.count), 1);

  if (loading) {
    return (
      <section className="page-section">
        <div className="premium-hero">
          <div>
            <span className="hero-tag">Stats Engine</span>
            <h2>Your Workout Analytics</h2>
            <p>Loading your stats...</p>
          </div>
        </div>

        <div className="premium-panel">
          <div className="empty-state-card">Loading stats...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="premium-hero">
        <div>
          <span className="hero-tag">Stats Engine</span>
          <h2>Your Workout Analytics</h2>
          <p>Clean insights from your saved workouts.</p>
        </div>
      </div>

      <div className="premium-stats-grid stats-clean-grid">
        <div className="premium-stat-card">
          <span>Total Workouts</span>
          <AnimatedNumber value={totalWorkouts} />
        </div>

        <div className="premium-stat-card">
          <span>Total Sets</span>
          <AnimatedNumber value={totalSets} />
        </div>

        <div className="premium-stat-card">
          <span>Total Reps</span>
          <AnimatedNumber value={totalReps} />
        </div>

        <div className="premium-stat-card">
          <span>Top Muscle</span>
          <strong>{topMuscle}</strong>
        </div>
      </div>

      <div className="premium-panel">
        <div className="panel-header">
          <h3>Weekly Activity</h3>
          <p>Last 7 days</p>
        </div>

        <div className="weekly-activity-grid clean-weekly-grid">
          {weeklyStats.map((day) => {
            const heightPercent =
              maxWeeklyCount > 0
                ? Math.max((day.count / maxWeeklyCount) * 100, day.count > 0 ? 18 : 6)
                : 6;

            return (
              <div key={day.dateKey} className="weekly-day-card clean-weekly-card">
                <div className="weekly-bar-wrap">
                  <div
                    className={`weekly-bar-fill ${day.count > 0 ? "active" : ""}`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <strong>{day.count}</strong>
                <span>{day.dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="premium-panel">
        <div className="panel-header">
          <h3>Muscle Distribution</h3>
          <p>Your most trained muscle groups</p>
        </div>

        <div className="stats-bars-wrap">
          {muscleStats.length === 0 ? (
            <div className="empty-state-card">No workout data yet.</div>
          ) : (
            muscleStats.map((item) => (
              <div key={item.label} className="stats-bar-card">
                <div className="stats-bar-top">
                  <span>{item.label}</span>
                  <strong>{item.percent}%</strong>
                </div>

                <div className="stats-bar-track">
                  <div
                    className="stats-bar-fill"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default Stats;