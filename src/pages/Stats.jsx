import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import "./Stats.css";

const AnimatedNumber = ({ value, duration = 900 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;

      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <strong>{displayValue}</strong>;
};

const Stats = () => {
  const [loading, setLoading] = useState(true);

  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [topMuscle, setTopMuscle] = useState("None");

  const [muscleStats, setMuscleStats] = useState([]);
  const [equipmentStats, setEquipmentStats] = useState([]);
  const [difficultyStats, setDifficultyStats] = useState([]);

  const [weeklyStats, setWeeklyStats] = useState([]);
  const [weeklyWorkoutTotal, setWeeklyWorkoutTotal] = useState(0);
  const [activeDays, setActiveDays] = useState(0);

  const [recentWorkouts, setRecentWorkouts] = useState([]);

  const fetchWorkouts = async () => {
    try {
      const workoutsRef = collection(db, "workouts");
      const q = query(workoutsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRecentWorkouts(data.slice(0, 5));
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const buildPercentageArray = (countMap, total) => {
    return Object.entries(countMap)
      .map(([label, count]) => ({
        label,
        count,
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const buildWeeklyData = (data) => {
    const today = new Date();
    const weekDays = [];

    for (let i = 6; i >= 0; i--) {
      const current = new Date();
      current.setDate(today.getDate() - i);

      const dateKey = current.toISOString().split("T")[0];
      const dayLabel = current.toLocaleDateString("en-US", {
        weekday: "short",
      });

      weekDays.push({
        dateKey,
        dayLabel,
        count: 0,
      });
    }

    data.forEach((item) => {
      const foundDay = weekDays.find((day) => day.dateKey === item.dateKey);
      if (foundDay) {
        foundDay.count += 1;
      }
    });

    const total = weekDays.reduce((sum, day) => sum + day.count, 0);
    const active = weekDays.filter((day) => day.count > 0).length;

    setWeeklyStats(weekDays);
    setWeeklyWorkoutTotal(total);
    setActiveDays(active);
  };

  const calculateStats = (data) => {
    setTotalWorkouts(data.length);

    const sets = data.reduce((sum, item) => sum + (item.totalSets || 0), 0);
    setTotalSets(sets);

    const reps = data.reduce((sum, item) => sum + (item.totalReps || 0), 0);
    setTotalReps(reps);

    const muscleCount = {};
    const equipmentCount = {};
    const difficultyCount = {};

    data.forEach((item) => {
      if (item.muscleGroup) {
        muscleCount[item.muscleGroup] = (muscleCount[item.muscleGroup] || 0) + 1;
      }

      if (item.equipmentType) {
        equipmentCount[item.equipmentType] =
          (equipmentCount[item.equipmentType] || 0) + 1;
      }

      if (item.difficulty) {
        difficultyCount[item.difficulty] =
          (difficultyCount[item.difficulty] || 0) + 1;
      }
    });

    let top = "None";
    let max = 0;

    for (const muscle in muscleCount) {
      if (muscleCount[muscle] > max) {
        max = muscleCount[muscle];
        top = muscle;
      }
    }

    setTopMuscle(top);

    setMuscleStats(buildPercentageArray(muscleCount, data.length));
    setEquipmentStats(buildPercentageArray(equipmentCount, data.length));
    setDifficultyStats(buildPercentageArray(difficultyCount, data.length));

    buildWeeklyData(data);
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
            <p>Loading your workout insights...</p>
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
          <p>
            Track your workouts, sets, reps, and muscle focus using real-time
            data.
          </p>
        </div>
      </div>

      <div className="premium-stats-grid">
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

        <div className="premium-stat-card">
          <span>This Week</span>
          <AnimatedNumber value={weeklyWorkoutTotal} />
        </div>

        <div className="premium-stat-card">
          <span>Active Days</span>
          <strong>{activeDays}/7</strong>
        </div>
      </div>

      <div className="premium-panel">
        <div className="panel-header">
          <h3>Weekly Activity</h3>
          <p>See how active you were over the last 7 days.</p>
        </div>

        <div className="weekly-activity-grid">
          {weeklyStats.map((day) => {
            const heightPercent =
              maxWeeklyCount > 0
                ? Math.max((day.count / maxWeeklyCount) * 100, day.count > 0 ? 18 : 6)
                : 6;

            return (
              <div key={day.dateKey} className="weekly-day-card">
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
          <p>See which muscle groups you train the most.</p>
        </div>

        <div className="stats-bars-wrap">
          {muscleStats.length === 0 ? (
            <div className="empty-state-card">No muscle data yet.</div>
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

      <div className="premium-panel">
        <div className="panel-header">
          <h3>Equipment Split</h3>
          <p>Compare bodyweight and weighted workouts.</p>
        </div>

        <div className="stats-bars-wrap">
          {equipmentStats.length === 0 ? (
            <div className="empty-state-card">No equipment data yet.</div>
          ) : (
            equipmentStats.map((item) => (
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

      <div className="premium-panel">
        <div className="panel-header">
          <h3>Difficulty Split</h3>
          <p>See how your workouts are spread across difficulty levels.</p>
        </div>

        <div className="stats-bars-wrap">
          {difficultyStats.length === 0 ? (
            <div className="empty-state-card">No difficulty data yet.</div>
          ) : (
            difficultyStats.map((item) => (
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

      <div className="premium-panel">
        <div className="panel-header">
          <h3>Recent Workouts</h3>
          <p>Your latest saved workout entries.</p>
        </div>

        {recentWorkouts.length === 0 ? (
          <div className="empty-state-card">No recent workouts yet.</div>
        ) : (
          <div className="recent-workouts-list">
            {recentWorkouts.map((item) => (
              <div key={item.id} className="recent-workout-card">
                <div className="recent-workout-top">
                  <div>
                    <h4>{item.workout}</h4>
                    <p>
                      {item.muscleGroup} • {item.equipmentType}
                    </p>
                  </div>
                  <span className="recent-workout-badge">{item.difficulty}</span>
                </div>

                <div className="recent-workout-meta">
                  <span>{item.totalSets || 0} sets</span>
                  <span>{item.totalReps || 0} reps</span>
                  <span>{item.dayName || "Day"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Stats;