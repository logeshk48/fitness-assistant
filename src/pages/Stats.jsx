import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const Stats = () => {
  const [workouts, setWorkouts] = useState([]);

  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [topMuscle, setTopMuscle] = useState("None");

  // 🔹 Fetch workouts
  const fetchWorkouts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "workouts"));

      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setWorkouts(data);
      calculateStats(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  };

  // 🔹 Calculate stats
  const calculateStats = (data) => {
    // total workouts
    setTotalWorkouts(data.length);

    // total sets
    const sets = data.reduce(
      (sum, item) => sum + (item.totalSets || 0),
      0
    );
    setTotalSets(sets);

    // total reps
    const reps = data.reduce(
      (sum, item) => sum + (item.totalReps || 0),
      0
    );
    setTotalReps(reps);

    // top muscle
    const muscleCount = {};

    data.forEach((item) => {
      const muscle = item.muscleGroup;
      if (!muscle) return;

      muscleCount[muscle] = (muscleCount[muscle] || 0) + 1;
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
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

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
      </div>
    </section>
  );
};

export default Stats;