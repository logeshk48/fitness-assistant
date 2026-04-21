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
      <section className="page-section dashboard-page luxury-dashboard-page">
        <div className="dashboard-radial radial-left" />
        <div className="dashboard-radial radial-right" />
        <div className="dashboard-grid-overlay" />

        <div className="dashboard-lux-shell">
          <div className="dashboard-loading-card fade-up delay-1">
            <span className="dashboard-kicker">Today Screen</span>
            <h2>Loading dashboard...</h2>
            <p>Fetching your active plan and today&apos;s workout.</p>
          </div>
        </div>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className="page-section dashboard-page luxury-dashboard-page">
        <div className="dashboard-radial radial-left" />
        <div className="dashboard-radial radial-right" />
        <div className="dashboard-grid-overlay" />

        <div className="dashboard-lux-shell">
          <div className="dashboard-error-card fade-up delay-1">
            <span className="dashboard-kicker">Dashboard</span>
            <h3>Unable to load dashboard</h3>
            <p>{errorMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!activePlan) {
    return (
      <section className="page-section dashboard-page luxury-dashboard-page">
        <div className="dashboard-radial radial-left" />
        <div className="dashboard-radial radial-right" />
        <div className="dashboard-grid-overlay" />

        <div className="dashboard-lux-shell">
          <div className="dashboard-top-hero fade-up delay-1">
            <div className="hero-copy-block slide-in-soft">
              <span className="dashboard-kicker">Today</span>
              <h1>{greeting}</h1>
              <p className="dashboard-date">{todayDate}</p>
              <p className="dashboard-subcopy">
                Build a plan first to unlock your premium daily workout flow.
              </p>
            </div>

            <div className="hero-side-block">
              <div className="lux-streak-pill">
                <span className="streak-icon">🔥</span>
                <div>
                  <strong>0 Day Streak</strong>
                  <p>Start your first run</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-empty-state fade-up delay-2">
            <span className="dashboard-kicker">No Active Plan</span>
            <h3>Create and activate a plan</h3>
            <p>
              Head to the Plans tab, build your workout schedule, and set one plan
              as active to power this Today screen.
            </p>
            <button
              type="button"
              className="dashboard-cta-button"
              onClick={handleViewPlan}
            >
              Go to Plans
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section dashboard-page luxury-dashboard-page">
      <div className="dashboard-radial radial-left" />
      <div className="dashboard-radial radial-right" />
      <div className="dashboard-grid-overlay" />

      <div className="dashboard-lux-shell">
        <div className="dashboard-top-hero fade-up delay-1">
          <div className="hero-copy-block slide-in-soft">
            <span className="dashboard-kicker">Today</span>
            <h1>{greeting}</h1>
            <p className="dashboard-date">{todayDate}</p>
            <p className="dashboard-subcopy">
              {isRestDay
                ? "Recovery today. Reset your body and stay ready for the next strong session."
                : "Your active plan is ready. One clean session today can move the whole week forward."}
            </p>
          </div>

          <div className="hero-side-block">
            <div className="lux-streak-pill pulse-soft">
              <span className="streak-icon">🔥</span>
              <div>
                <strong>{streakPlaceholder} Day Streak</strong>
                <p>Consistency in motion</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-main-hero dashboard-scale-in fade-up delay-2">
          <div className="main-hero-left">
            <div className="hero-badge-row">
              <span className="dashboard-kicker">Today&apos;s Workout</span>
              <span className="lux-mini-pill">{activePlan.planName}</span>
            </div>

            <h2>{isRestDay ? "Recovery Day" : todayWorkout?.focus || "Workout Day"}</h2>
            <p className="main-hero-subtitle">
              {isRestDay
                ? `No workout is scheduled for ${todayName}. Use today to recover and come back stronger.`
                : `${exerciseCount} exercises • ${totalSetsToday} total sets • ${estimatedWorkoutTime}`}
            </p>

            {!isRestDay && (
              <div className="hero-meta-row">
                <div className="hero-meta-chip">
                  <span>Focus</span>
                  <strong>{todayWorkout?.focus}</strong>
                </div>
                <div className="hero-meta-chip">
                  <span>Exercises</span>
                  <strong>{exerciseCount}</strong>
                </div>
                <div className="hero-meta-chip">
                  <span>Time</span>
                  <strong>{estimatedWorkoutTime}</strong>
                </div>
                <div className="hero-meta-chip">
                  <span>Style</span>
                  <strong>{equipmentLabel}</strong>
                </div>
              </div>
            )}

            {isRestDay ? (
              <button
                type="button"
                className="dashboard-cta-button"
                onClick={handleViewPlan}
              >
                View Plan
              </button>
            ) : (
              <button
                type="button"
                className="dashboard-cta-button glow-cta"
                onClick={handleStartWorkout}
              >
                Start Workout
              </button>
            )}
          </div>

          <div className="main-hero-right">
            <div className="hero-visual-orb">
              <div className="hero-visual-ring" />
              <div className="hero-visual-content">
                <span className="hero-visual-label">Active Plan</span>
                <strong>{activePlan.planName}</strong>
                <p>{activePlan.goal}</p>
              </div>
            </div>
          </div>
        </div>

        {!isRestDay && (
          <div className="dashboard-exercise-showcase fade-up delay-3">
            <div className="section-headline-row">
              <div>
                <span className="dashboard-kicker">Exercise List</span>
                <h3>Today&apos;s Session</h3>
              </div>
              <div className="lux-side-metric">
                <strong>{totalSetsToday}</strong>
                <span>Total Sets</span>
              </div>
            </div>

            <div className="exercise-showcase-list">
              {todayWorkout?.exercises?.map((exercise, index) => (
                <div key={`${exercise.name}-${index}`} className="lux-exercise-row">
                  <div className="exercise-row-left">
                    <span className="exercise-index">0{index + 1}</span>
                    <div>
                      <strong>{exercise.name}</strong>
                      <p>{todayWorkout.focus}</p>
                    </div>
                  </div>

                  <div className="exercise-row-right">
                    <span>{exercise.sets} × {exercise.reps}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="dashboard-secondary-grid">
          <div className="dashboard-lux-card fade-up delay-4">
            <div className="section-headline-row">
              <div>
                <span className="dashboard-kicker">Plan Progress</span>
                <h3>{activePlan.planName}</h3>
              </div>
              <div className="compact-metric">{activePlanCompletion}%</div>
            </div>

            <div className="lux-progress-block">
              <div className="lux-progress-track">
                <div
                  className="lux-progress-fill"
                  style={{ width: `${activePlanCompletion}%` }}
                />
              </div>
            </div>

            <p className="support-copy">
              Goal: {activePlan.goal} • Duration: {activePlan.duration}
            </p>
          </div>

          <div className="dashboard-lux-card fade-up delay-5">
            <div className="section-headline-row">
              <div>
                <span className="dashboard-kicker">This Week</span>
                <h3>Weekly Consistency</h3>
              </div>
              <div className="compact-metric">
                {weeklyCompletionCount}/{activePlan.daysPerWeek}
              </div>
            </div>

            <div className="lux-progress-block">
              <div className="lux-progress-track">
                <div
                  className="lux-progress-fill"
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
            </div>

            <p className="support-copy">
              Keep showing up. Small sessions build long-term fitness identity.
            </p>
          </div>
        </div>

        <div className="dashboard-smart-grid">
          <div className="dashboard-lux-card insight-card fade-up delay-5">
            <span className="dashboard-kicker">Smart Insight</span>
            <h3>Today&apos;s Insight</h3>
            <p>{insightText}</p>
          </div>

          <div className="dashboard-lux-card achievement-card fade-up delay-6">
            <span className="dashboard-kicker">Achievement</span>
            <h3>{achievementText}</h3>
            <p>
              {activePlanCompletion >= 75
                ? "You are building strong weekly momentum."
                : "Stay consistent and your next badge will unlock soon."}
            </p>
          </div>
        </div>

        <div className="dashboard-next-section fade-up delay-6">
          <div className="dashboard-lux-card next-workout-card">
            <div className="section-headline-row">
              <div>
                <span className="dashboard-kicker">Next Workout</span>
                <h3>
                  {nextWorkout
                    ? `${nextWorkout.day} • ${nextWorkout.focus}`
                    : "No upcoming workout"}
                </h3>
              </div>
            </div>

            {nextWorkout ? (
              <>
                <p className="support-copy">
                  {nextWorkout.exercises?.length || 0} exercises planned for your next session.
                </p>

                <div className="next-chip-row">
                  {(nextWorkout.exercises || []).slice(0, 4).map((exercise, index) => (
                    <span key={`${exercise.name}-${index}`} className="lux-next-chip">
                      {exercise.name}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="support-copy">
                Your active plan does not have another scheduled day yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;