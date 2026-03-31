import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./Stats.css";

const Stats = () => {
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

  const fetchWorkouts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "workouts"));

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      calculateStats(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
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
          <strong>{totalWorkouts}</strong>
        </div>

        <div className="premium-stat-card">
          <span>Total Sets</span>
          <strong>{totalSets}</strong>
        </div>

        <div className="premium-stat-card">
          <span>Total Reps</span>
          <strong>{totalReps}</strong>
        </div>

        <div className="premium-stat-card">
          <span>Top Muscle</span>
          <strong>{topMuscle}</strong>
        </div>

        <div className="premium-stat-card">
          <span>This Week</span>
          <strong>{weeklyWorkoutTotal}</strong>
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
              maxWeeklyCount > 0 ? Math.max((day.count / maxWeeklyCount) * 100, day.count > 0 ? 18 : 6) : 6;

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
    </section>
  );
};

export default Stats;