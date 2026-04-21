import "./Dashboard.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";

const todayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const Dashboard = () => {
  const navigate = useNavigate();

  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const today = useMemo(() => new Date(), []);
  const todayName = todayNames[today.getDay()];
  const todayDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, [today]);

  useEffect(() => {
    const fetchActivePlan = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const plansRef = collection(db, "plans");
        const plansQuery = query(plansRef, orderBy("createdAt", "desc"), limit(20));
        const snapshot = await getDocs(plansQuery);

        const plans = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const selectedActivePlan = plans.find((plan) => plan.isActive) || null;
        setActivePlan(selectedActivePlan);
      } catch (error) {
        console.error("Error fetching active plan:", error);
        setErrorMessage("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivePlan();
  }, []);

  const workoutDays = useMemo(() => {
    if (!activePlan?.days) return [];
    return activePlan.days.filter(
      (day) => Array.isArray(day.exercises) && day.exercises.length > 0
    );
  }, [activePlan]);

  const todayWorkout = useMemo(() => {
    if (!activePlan?.days) return null;
    return activePlan.days.find((day) => day.day === todayName) || null;
  }, [activePlan, todayName]);

  const isRestDay = useMemo(() => {
    return activePlan && !todayWorkout;
  }, [activePlan, todayWorkout]);

  const exerciseCount = useMemo(() => {
    return todayWorkout?.exercises?.length || 0;
  }, [todayWorkout]);

  const totalSetsToday = useMemo(() => {
    if (!todayWorkout?.exercises) return 0;
    return todayWorkout.exercises.reduce(
      (sum, exercise) => sum + Number(exercise.sets || 0),
      0
    );
  }, [todayWorkout]);

  const estimatedWorkoutTime = useMemo(() => {
    if (!todayWorkout?.exercises?.length) return "Recovery Day";
    const minutes = Math.max(todayWorkout.exercises.length * 12, 25);
    return `${minutes} min`;
  }, [todayWorkout]);

  const equipmentLabel = useMemo(() => {
    if (!todayWorkout?.exercises?.length) return "Rest";
    return "Mixed";
  }, [todayWorkout]);

  const weeklyCompletionCount = useMemo(() => {
    if (!activePlan?.daysPerWeek) return 0;
    return Math.min(1, activePlan.daysPerWeek);
  }, [activePlan]);

  const activePlanCompletion = useMemo(() => {
    if (!activePlan?.daysPerWeek) return 0;
    return Math.min(
      100,
      Math.round((weeklyCompletionCount / activePlan.daysPerWeek) * 100)
    );
  }, [activePlan, weeklyCompletionCount]);

  const streakPlaceholder = useMemo(() => {
    if (!activePlan) return 0;
    return Math.max(3, activePlan.daysPerWeek || 3);
  }, [activePlan]);

  const nextWorkout = useMemo(() => {
    if (!activePlan?.days?.length) return null;
    if (!todayWorkout) return workoutDays[0] || null;

    const todayIndex = todayNames.indexOf(todayName);

    for (let offset = 1; offset <= 7; offset += 1) {
      const nextIndex = (todayIndex + offset) % 7;
      const nextDayName = todayNames[nextIndex];
      const found = activePlan.days.find((day) => day.day === nextDayName);
      if (found) return found;
    }

    return null;
  }, [activePlan, todayWorkout, todayName, workoutDays]);

  const insightText = useMemo(() => {
    if (!activePlan) {
      return "Create a plan to get a personalized daily workout flow.";
    }

    if (isRestDay) {
      return "Today is a recovery day. Rest well so your next workout feels stronger.";
    }

    if (exerciseCount >= 4) {
      return "You have a strong session today. Start with your biggest movement first.";
    }

    return "A focused session today can build momentum for the rest of your week.";
  }, [activePlan, isRestDay, exerciseCount]);

  const achievementText = useMemo(() => {
    if (!activePlan) return "No active achievement yet";
    if (activePlanCompletion >= 75) return "Week Momentum Badge";
    if (activePlanCompletion >= 40) return "Consistency Builder";
    return "Getting Started";
  }, [activePlan, activePlanCompletion]);

  const handleStartWorkout = () => {
    if (isRestDay || !todayWorkout) return;
    navigate("/workouts", {
      state: {
        fromPlan: true,
        activePlanId: activePlan?.id || null,
        activePlanName: activePlan?.planName || "",
        workout: {
          day: todayWorkout.day,
          focus: todayWorkout.focus,
          exercises: todayWorkout.exercises || [],
      },
    },
  });
};

  const handleViewPlan = () => {
    navigate("/plans");
  };

  if (loading) {
    return (
      <section className="page-section dashboard-page">
        <div className="dashboard-bg-orb dashboard-orb-1" />
        <div className="dashboard-bg-orb dashboard-orb-2" />
        <div className="dashboard-bg-grid" />

        <div className="dashboard-shell">
          <div className="dashboard-hero-card fade-up delay-1">
            <span className="dashboard-tag">Today Screen</span>
            <h2>Loading dashboard...</h2>
            <p>Fetching your active plan and today&apos;s workout.</p>
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="page-section dashboard-page">
        <div className="dashboard-bg-orb dashboard-orb-1" />
        <div className="dashboard-bg-orb dashboard-orb-2" />
        <div className="dashboard-bg-grid" />

        <div className="dashboard-shell">
          <div className="dashboard-error-card">
            <h3>Unable to load dashboard</h3>
            <p>{errorMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!activePlan) {
    return (
      <section className="page-section dashboard-page">
        <div className="dashboard-bg-orb dashboard-orb-1" />
        <div className="dashboard-bg-orb dashboard-orb-2" />
        <div className="dashboard-bg-grid" />

        <div className="dashboard-shell">
          <div className="dashboard-top-row fade-up delay-1">
            <div className="dashboard-greeting-block">
              <span className="dashboard-tag">Today</span>
              <h2>{greeting}</h2>
              <p>{todayDate}</p>
            </div>

            <div className="dashboard-streak-badge">
              <span>🔥</span>
              <strong>0 Day Streak</strong>
            </div>
          </div>

          <div className="dashboard-empty-state fade-up delay-2">
            <h3>No active plan yet</h3>
            <p>
              Go to Plans tab, create a workout plan, and set one plan as active.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section dashboard-page">
      <div className="dashboard-bg-orb dashboard-orb-1" />
      <div className="dashboard-bg-orb dashboard-orb-2" />
      <div className="dashboard-bg-grid" />

      <div className="dashboard-shell">
        <div className="dashboard-top-row fade-up delay-1">
          <div className="dashboard-greeting-block slide-in-soft">
            <span className="dashboard-tag">Today</span>
            <h2>{greeting}</h2>
            <p>{todayDate}</p>
          </div>

          <div className="dashboard-streak-badge pulse-soft">
            <span>🔥</span>
            <strong>{streakPlaceholder} Day Streak</strong>
          </div>
        </div>

        <div className="dashboard-hero-card dashboard-scale-in fade-up delay-2">
          <div className="hero-card-top">
            <div>
              <span className="section-kicker">Today&apos;s Workout</span>
              <h3>{isRestDay ? "Recovery Day" : todayWorkout?.focus || "Workout Day"}</h3>
              <p>{activePlan.planName}</p>
            </div>

            <button
              type="button"
              className="dashboard-primary-btn pulse-soft"
              onClick={isRestDay ? handleViewPlan : handleStartWorkout}
            >
              {isRestDay ? "View Plan" : "Start Workout"}
            </button>
          </div>

          {isRestDay ? (
            <div className="rest-day-card">
              <div className="rest-day-icon">🌙</div>
              <div>
                <h4>No workout scheduled for {todayName}</h4>
                <p>
                  Take your rest seriously. Recovery helps you perform better on
                  your next training day.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hero-workout-meta">
                <div className="meta-card">
                  <span>Focus</span>
                  <strong>{todayWorkout?.focus}</strong>
                </div>

                <div className="meta-card">
                  <span>Exercises</span>
                  <strong>{exerciseCount}</strong>
                </div>

                <div className="meta-card">
                  <span>Time</span>
                  <strong>{estimatedWorkoutTime}</strong>
                </div>

                <div className="meta-card">
                  <span>Style</span>
                  <strong>{equipmentLabel}</strong>
                </div>
              </div>

              <div className="today-exercises-panel">
                <div className="panel-title-row">
                  <h4>Today&apos;s Exercise List</h4>
                  <span>{totalSetsToday} total sets</span>
                </div>

                <div className="exercise-preview-list">
                  {todayWorkout?.exercises?.map((exercise, index) => (
                    <div key={`${exercise.name}-${index}`} className="exercise-preview-row">
                      <div>
                        <strong>{exercise.name}</strong>
                        <p>{todayWorkout.focus}</p>
                      </div>
                      <span>
                        {exercise.sets} × {exercise.reps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="dashboard-stats-row">
          <div className="dashboard-stat-card fade-up delay-3">
            <div className="card-heading">
              <span className="section-kicker">Plan Progress</span>
              <h4>{activePlan.planName}</h4>
            </div>

            <div className="progress-block">
              <div className="progress-row">
                <span>Active Plan Completion</span>
                <strong>{activePlanCompletion}%</strong>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${activePlanCompletion}%` }}
                />
              </div>
            </div>

            <p className="card-footer-text">
              Goal: {activePlan.goal} • Duration: {activePlan.duration}
            </p>
          </div>

          <div className="dashboard-stat-card fade-up delay-4">
            <div className="card-heading">
              <span className="section-kicker">This Week</span>
              <h4>Weekly Consistency</h4>
            </div>

            <div className="weekly-metric">
              <strong>
                {weeklyCompletionCount}/{activePlan.daysPerWeek}
              </strong>
              <span>workout days tracked</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (weeklyCompletionCount / Math.max(activePlan.daysPerWeek, 1)) * 100
                    )
                  )}%`,
                }}
              />
            </div>

            <p className="card-footer-text">
              Keep showing up. Small wins build long-term consistency.
            </p>
          </div>
        </div>

        <div className="dashboard-smart-row">
          <div className="dashboard-info-card fade-up delay-5 shimmer-soft">
            <span className="section-kicker">Smart Insight</span>
            <h4>Today&apos;s Insight</h4>
            <p>{insightText}</p>
          </div>

          <div className="dashboard-info-card fade-up delay-6">
            <span className="section-kicker">Achievement</span>
            <h4>{achievementText}</h4>
            <p>
              {activePlanCompletion >= 75
                ? "You are building strong weekly momentum."
                : "Stay consistent and your next badge will unlock soon."}
            </p>
          </div>
        </div>

        <div className="dashboard-bottom-row fade-up delay-6">
          <div className="dashboard-next-card">
            <span className="section-kicker">Next Workout</span>
            {nextWorkout ? (
              <>
                <h4>
                  {nextWorkout.day} • {nextWorkout.focus}
                </h4>
                <p>
                  {nextWorkout.exercises?.length || 0} exercises planned for the
                  next session.
                </p>

                <div className="next-exercise-preview">
                  {(nextWorkout.exercises || []).slice(0, 3).map((exercise, index) => (
                    <span key={`${exercise.name}-${index}`} className="next-chip">
                      {exercise.name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h4>No upcoming workout</h4>
                <p>Your active plan does not have another scheduled day yet.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;