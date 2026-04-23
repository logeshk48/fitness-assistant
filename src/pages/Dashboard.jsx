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

const DAY_ABBR = ["S", "M", "T", "W", "T", "F", "S"];

const Dashboard = () => {
  const navigate = useNavigate();

  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const today = useMemo(() => new Date(), []);
  const todayName = todayNames[today.getDay()];
  const todayDayIndex = today.getDay();

  const todayDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour < 12) return "Good\nmorning.";
    if (hour < 17) return "Good\nafternoon.";
    return "Good\nevening.";
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

  const isRestDay = useMemo(() => activePlan && !todayWorkout, [activePlan, todayWorkout]);

  const exerciseCount = useMemo(() => todayWorkout?.exercises?.length || 0, [todayWorkout]);

  const totalSetsToday = useMemo(() => {
    if (!todayWorkout?.exercises) return 0;
    return todayWorkout.exercises.reduce(
      (sum, ex) => sum + Number(ex.sets || 0),
      0
    );
  }, [todayWorkout]);

  const estimatedWorkoutTime = useMemo(() => {
    if (!todayWorkout?.exercises?.length) return "Recovery";
    const minutes = Math.max(todayWorkout.exercises.length * 12, 25);
    return `${minutes} min`;
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

  const consistencyPercent = useMemo(() => {
    if (!activePlan?.daysPerWeek) return 0;
    return Math.min(100, Math.round((weeklyCompletionCount / Math.max(activePlan.daysPerWeek, 1)) * 100));
  }, [activePlan, weeklyCompletionCount]);

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
    if (!activePlan) return "Create a plan to get a personalized daily workout flow.";
    if (isRestDay) return "Today is a recovery day. Rest well so your next workout feels stronger.";
    if (exerciseCount >= 4) return "Lead with your heaviest compound movement first. Your CNS is freshest at the start of your session.";
    return "A focused session today builds the momentum that carries your whole week.";
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

  const handleViewPlan = () => navigate("/plans");

  /* ── LOADING ── */
  if (loading) {
    return (
      <section className="db-page">
        <div className="db-shell">
          <div className="db-state-card fade-up">
            <span className="db-kicker">Today Screen</span>
            <h2>Loading dashboard…</h2>
            <p>Fetching your active plan and today&apos;s workout.</p>
          </div>
        </div>
      </section>
    );
  }

  /* ── ERROR ── */
  if (errorMessage) {
    return (
      <section className="db-page">
        <div className="db-shell">
          <div className="db-state-card fade-up">
            <span className="db-kicker">Dashboard</span>
            <h3>Unable to load dashboard</h3>
            <p>{errorMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  /* ── NO ACTIVE PLAN ── */
  if (!activePlan) {
    return (
      <section className="db-page">
        <div className="db-shell">
          <header className="db-hero fade-up delay-1">
            <div className="db-greeting">{greeting.split("\n").map((line, i) => (
              <span key={i}>{line}</span>
            ))}</div>
            <div className="db-hero-right">
              <div className="db-streak-pill">
                <span className="db-streak-dot" />
                0 day streak
              </div>
            </div>
          </header>

          <div className="db-state-card fade-up delay-2">
            <span className="db-kicker">No Active Plan</span>
            <h3>Create and activate a plan</h3>
            <p>
              Head to the Plans tab, build your workout schedule, and set one plan as active to power this Today screen.
            </p>
            <button type="button" className="db-btn-primary" onClick={handleViewPlan}>
              Go to Plans
            </button>
          </div>
        </div>
      </section>
    );
  }

  /* ── MAIN DASHBOARD ── */
  return (
    <section className="db-page">
      <div className="db-shell">

        {/* ── HERO ROW ── */}
        <header className="db-hero fade-up delay-1">
          <div className="db-greeting-block">
            <div className="db-greeting">
              {greeting.split("\n").map((line, i) => <span key={i}>{line}</span>)}
            </div>
            <p className="db-date">{todayDate}</p>
          </div>
          <div className="db-hero-right">
            <div className="db-streak-pill">
              <span className="db-streak-dot" />
              {streakPlaceholder} day streak
            </div>
          </div>
        </header>

        {/* ── TODAY CARD ── */}
        <div className="db-today-card fade-up delay-2">
          <div className="db-today-inner">
            <div>
              <span className="db-kicker light">Today&apos;s Workout · {activePlan.planName}</span>
              <h2 className="db-today-focus">
                {isRestDay ? "Recovery Day" : todayWorkout?.focus || "Workout Day"}
              </h2>
              <p className="db-today-meta">
                {isRestDay
                  ? `No workout scheduled for ${todayName}. Rest and recover.`
                  : `${exerciseCount} exercises · ${totalSetsToday} total sets · ${estimatedWorkoutTime}`}
              </p>

              {!isRestDay && (
                <div className="db-meta-chips">
                  <div className="db-chip">
                    <span className="db-chip-label">Focus</span>
                    <span className="db-chip-value">{todayWorkout?.focus}</span>
                  </div>
                  <div className="db-chip">
                    <span className="db-chip-label">Exercises</span>
                    <span className="db-chip-value">{exerciseCount}</span>
                  </div>
                  <div className="db-chip">
                    <span className="db-chip-label">Time</span>
                    <span className="db-chip-value">{estimatedWorkoutTime}</span>
                  </div>
                  <div className="db-chip">
                    <span className="db-chip-label">Sets</span>
                    <span className="db-chip-value">{totalSetsToday}</span>
                  </div>
                </div>
              )}

              <div className="db-cta-row">
                {isRestDay ? (
                  <button type="button" className="db-btn-primary light" onClick={handleViewPlan}>
                    View Plan
                  </button>
                ) : (
                  <button type="button" className="db-btn-primary light" onClick={handleStartWorkout}>
                    Start Workout →
                  </button>
                )}
                <button type="button" className="db-btn-ghost" onClick={handleViewPlan}>
                  View Plan
                </button>
              </div>
            </div>

            <div className="db-orb" aria-hidden="true">
              <div className="db-orb-ring" />
              <div className="db-orb-content">
                <span className="db-orb-label">Active Plan</span>
                <strong>{activePlan.planName}</strong>
                <p>{activePlan.goal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── EXERCISE LIST ── */}
        {!isRestDay && (
          <div className="db-card fade-up delay-3">
            <div className="db-card-header">
              <div>
                <span className="db-kicker dark">Exercise List</span>
                <h3 className="db-card-title">Today&apos;s Session</h3>
              </div>
              <div className="db-metric-badge">{totalSetsToday} sets</div>
            </div>

            <div className="db-exercise-list">
              {todayWorkout?.exercises?.map((exercise, index) => (
                <div key={`${exercise.name}-${index}`} className="db-ex-row">
                  <div className="db-ex-left">
                    <span className="db-ex-num">0{index + 1}</span>
                    <div>
                      <strong className="db-ex-name">{exercise.name}</strong>
                      <p className="db-ex-focus">{todayWorkout.focus}</p>
                    </div>
                  </div>
                  <span className="db-ex-sets">{exercise.sets} × {exercise.reps}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PLAN PROGRESS + WEEKLY ── */}
        <div className="db-grid-2 fade-up delay-4">
          <div className="db-card">
            <div className="db-card-header">
              <div>
                <span className="db-kicker dark">Plan Progress</span>
                <h3 className="db-card-title">{activePlan.planName}</h3>
              </div>
              <span className="db-big-num">{activePlanCompletion}%</span>
            </div>
            <div className="db-progress-track">
              <div className="db-progress-fill" style={{ width: `${activePlanCompletion}%` }} />
            </div>
            <p className="db-support-copy">
              Goal: {activePlan.goal} · Duration: {activePlan.duration}
            </p>

            {/* Week dots */}
            <div className="db-week-dots">
              {DAY_ABBR.map((abbr, i) => {
                const isToday = i === todayDayIndex;
                const isPast = i < todayDayIndex;
                const hasWorkout = activePlan?.days?.find(
                  (d) => d.day === todayNames[i] && d.exercises?.length > 0
                );
                return (
                  <div
                    key={i}
                    className={`db-day-dot ${isToday ? "today" : ""} ${isPast && hasWorkout ? "done" : ""} ${!hasWorkout ? "rest" : ""}`}
                  >
                    {abbr}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <div>
                <span className="db-kicker dark">This Week</span>
                <h3 className="db-card-title">Consistency</h3>
              </div>
              <span className="db-big-num">
                {weeklyCompletionCount}<span className="db-big-num-sub">/{activePlan.daysPerWeek}</span>
              </span>
            </div>
            <div className="db-progress-track">
              <div
                className="db-progress-fill accent"
                style={{ width: `${consistencyPercent}%` }}
              />
            </div>
            <p className="db-support-copy">
              Keep showing up. Small sessions build long-term fitness identity.
            </p>
          </div>
        </div>

        {/* ── INSIGHT + ACHIEVEMENT ── */}
        <div className="db-grid-2 fade-up delay-5">
          <div className="db-card insight">
            <span className="db-kicker insight-kicker">Smart Insight</span>
            <h3 className="db-card-title">Today&apos;s Insight</h3>
            <p className="db-insight-text">{insightText}</p>
          </div>

          <div className="db-card">
            <span className="db-kicker dark">Achievement</span>
            <h3 className="db-card-title">{achievementText}</h3>
            <p className="db-support-copy">
              {activePlanCompletion >= 75
                ? "You are building strong weekly momentum."
                : "Stay consistent and your next badge will unlock soon."}
            </p>
            <div className="db-achievement-bar">
              <div className="db-achievement-fill" style={{ width: `${Math.min(100, activePlanCompletion * 1.3)}%` }} />
            </div>
          </div>
        </div>

        {/* ── NEXT WORKOUT ── */}
        <div className="db-card db-next-card fade-up delay-6">
          <div className="db-card-header">
            <div>
              <span className="db-kicker dark">Next Workout</span>
              <h3 className="db-card-title">
                {nextWorkout
                  ? `${nextWorkout.day} · ${nextWorkout.focus}`
                  : "No upcoming workout"}
              </h3>
            </div>
          </div>

          {nextWorkout ? (
            <>
              <p className="db-support-copy">
                {nextWorkout.exercises?.length || 0} exercises planned for your next session.
              </p>
              <div className="db-chip-row">
                {(nextWorkout.exercises || []).slice(0, 4).map((exercise, index) => (
                  <span key={`${exercise.name}-${index}`} className="db-mini-chip">
                    {exercise.name}
                  </span>
                ))}
                {nextWorkout.exercises?.length > 4 && (
                  <span className="db-mini-chip">+{nextWorkout.exercises.length - 4} more</span>
                )}
              </div>
            </>
          ) : (
            <p className="db-support-copy">
              Your active plan does not have another scheduled day yet.
            </p>
          )}
        </div>

      </div>
    </section>
  );
};

export default Dashboard;