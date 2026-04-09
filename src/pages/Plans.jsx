import "./Plans.css";
import { useEffect, useMemo, useState } from "react";

const createInitialSchedule = () => [
  {
    id: 1,
    day: "Mon",
    fullDay: "Monday",
    title: "Chest + Triceps",
    type: "workout",
    status: "completed",
    estimatedTime: "50 min",
    exercises: [
      "Push-ups",
      "Incline Dumbbell Press",
      "Dumbbell Fly",
      "Tricep Kickbacks",
    ],
    completed: true,
    missed: false,
  },
  {
    id: 2,
    day: "Tue",
    fullDay: "Tuesday",
    title: "Back + Biceps",
    type: "workout",
    status: "completed",
    estimatedTime: "45 min",
    exercises: [
      "Pull-ups",
      "Dumbbell Rows",
      "Hammer Curls",
      "Concentration Curls",
    ],
    completed: true,
    missed: false,
  },
  {
    id: 3,
    day: "Wed",
    fullDay: "Wednesday",
    title: "Rest Day",
    type: "rest",
    status: "rest",
    estimatedTime: "Recovery",
    exercises: ["Light stretching", "Mobility work", "Walk for 20 minutes"],
    completed: false,
    missed: false,
  },
  {
    id: 4,
    day: "Thu",
    fullDay: "Thursday",
    title: "Legs + Core",
    type: "workout",
    status: "today",
    estimatedTime: "55 min",
    exercises: [
      "Goblet Squats",
      "Dumbbell Lunges",
      "Romanian Deadlifts",
      "Weighted Russian Twists",
    ],
    completed: false,
    missed: false,
  },
  {
    id: 5,
    day: "Fri",
    fullDay: "Friday",
    title: "Shoulders + Calves",
    type: "workout",
    status: "upcoming",
    estimatedTime: "42 min",
    exercises: [
      "Dumbbell Shoulder Press",
      "Lateral Raises",
      "Rear Delt Fly",
      "Standing Calf Raises",
    ],
    completed: false,
    missed: false,
  },
  {
    id: 6,
    day: "Sat",
    fullDay: "Saturday",
    title: "Full Body Conditioning",
    type: "workout",
    status: "upcoming",
    estimatedTime: "40 min",
    exercises: [
      "Burpees",
      "Mountain Climbers",
      "Jumping Jacks",
      "High Knees",
    ],
    completed: false,
    missed: false,
  },
  {
    id: 7,
    day: "Sun",
    fullDay: "Sunday",
    title: "Recovery Day",
    type: "rest",
    status: "rest",
    estimatedTime: "Reset",
    exercises: ["Foam rolling", "Stretching", "Hydration focus"],
    completed: false,
    missed: false,
  },
];

const recommendedPlansData = [
  {
    id: "rec-1",
    name: "Foundation Starter",
    goal: "Consistency",
    duration: "4 Weeks",
    difficulty: "Beginner",
    daysPerWeek: 3,
    time: "30-35 min",
    accent: "soft",
  },
  {
    id: "rec-2",
    name: "Strength Forge",
    goal: "Strength",
    duration: "12 Weeks",
    difficulty: "Advanced",
    daysPerWeek: 5,
    time: "55-65 min",
    accent: "strong",
  },
  {
    id: "rec-3",
    name: "Shred Sprint",
    goal: "Fat Loss",
    duration: "8 Weeks",
    difficulty: "Intermediate",
    daysPerWeek: 4,
    time: "35-45 min",
    accent: "electric",
  },
];

const Plans = () => {
  const [weeklySchedule, setWeeklySchedule] = useState(createInitialSchedule());
  const [selectedDayId, setSelectedDayId] = useState(4);
  const [expandedDayId, setExpandedDayId] = useState(4);
  const [successPulse, setSuccessPulse] = useState(false);
  const [weekBadgePop, setWeekBadgePop] = useState(false);

  const basePlan = useMemo(
    () => ({
      id: "active-plan-1",
      name: "Lean Muscle Builder",
      goal: "Muscle Gain",
      duration: "8 Weeks",
      difficulty: "Intermediate",
      estimatedWorkoutTime: 48,
      currentWeek: 3,
      reward: "Titan Consistency Badge",
    }),
    []
  );

  const derivedSchedule = useMemo(() => {
    const workoutDays = weeklySchedule.filter((day) => day.type === "workout");

    const firstPendingWorkoutIndex = workoutDays.findIndex(
      (day) => !day.completed && !day.missed
    );

    return weeklySchedule.map((day) => {
      if (day.type === "rest") {
        return { ...day, status: "rest" };
      }

      if (day.completed) {
        return { ...day, status: "completed" };
      }

      if (day.missed) {
        return { ...day, status: "missed" };
      }

      const workoutIndex = workoutDays.findIndex((item) => item.id === day.id);

      if (workoutIndex === firstPendingWorkoutIndex) {
        return { ...day, status: "today" };
      }

      return { ...day, status: "upcoming" };
    });
  }, [weeklySchedule]);

  const selectedDay = useMemo(() => {
    return (
      derivedSchedule.find((day) => day.id === selectedDayId) || derivedSchedule[0]
    );
  }, [derivedSchedule, selectedDayId]);

  const todayWorkout = useMemo(() => {
    return (
      derivedSchedule.find((day) => day.status === "today") ||
      derivedSchedule.find((day) => day.type === "workout" && !day.completed) ||
      derivedSchedule.find((day) => day.type === "workout") ||
      derivedSchedule[0]
    );
  }, [derivedSchedule]);

  const workoutDaysCount = useMemo(() => {
    return derivedSchedule.filter((day) => day.type === "workout").length;
  }, [derivedSchedule]);

  const completedDays = useMemo(() => {
    return derivedSchedule.filter(
      (day) => day.type === "workout" && day.completed
    ).length;
  }, [derivedSchedule]);

  const remainingDays = useMemo(() => {
    return derivedSchedule.filter(
      (day) => day.type === "workout" && !day.completed
    ).length;
  }, [derivedSchedule]);

  const missedDays = useMemo(() => {
    return derivedSchedule.filter(
      (day) => day.type === "workout" && day.missed && !day.completed
    ).length;
  }, [derivedSchedule]);

  const daysPerWeek = workoutDaysCount;

  const progress = useMemo(() => {
    if (workoutDaysCount === 0) return 0;
    return Math.round((completedDays / workoutDaysCount) * 100);
  }, [completedDays, workoutDaysCount]);

  const completionText = `${progress}% Completed`;

  const currentBadge = useMemo(() => {
    if (progress === 100) return "Plan Complete";
    if (completedDays >= 4) return "Week Warrior";
    if (completedDays >= 2) return "Week Momentum";
    return "Week in Progress";
  }, [progress, completedDays]);

  const weekCompletionUnlocked = completedDays === workoutDaysCount && workoutDaysCount > 0;

  const activePlan = useMemo(
    () => ({
      ...basePlan,
      progress,
      completedDays,
      remainingDays,
      daysPerWeek,
      badge: currentBadge,
      status: progress === 100 ? "completed" : "active",
    }),
    [basePlan, progress, completedDays, remainingDays, daysPerWeek, currentBadge]
  );

  useEffect(() => {
    if (!derivedSchedule.some((day) => day.id === selectedDayId)) {
      setSelectedDayId(derivedSchedule[0]?.id || 1);
    }
  }, [derivedSchedule, selectedDayId]);

  const handleSelectDay = (dayId) => {
    setSelectedDayId(dayId);

    if (expandedDayId === dayId) {
      setExpandedDayId(null);
    } else {
      setExpandedDayId(dayId);
    }
  };

  const handleMarkComplete = () => {
    if (!selectedDay || selectedDay.type !== "workout" || selectedDay.completed) {
      return;
    }

    setWeeklySchedule((prev) =>
      prev.map((day) =>
        day.id === selectedDay.id
          ? {
              ...day,
              completed: true,
              missed: false,
            }
          : day
      )
    );

    setSuccessPulse(true);
    setTimeout(() => setSuccessPulse(false), 900);
  };

  const handleContinuePlan = () => {
    setSelectedDayId(todayWorkout.id);
    setExpandedDayId(todayWorkout.id);
  };

  const handleReplaceWorkout = () => {
    if (!selectedDay || selectedDay.type !== "workout") return;

    setWeeklySchedule((prev) =>
      prev.map((day) =>
        day.id === selectedDay.id
          ? {
              ...day,
              title: `${day.title} Alt`,
              exercises: day.exercises.map((exercise, index) =>
                index === 0 ? `${exercise} Variation` : exercise
              ),
            }
          : day
      )
    );
  };

  const handleMarkMissed = () => {
    if (!selectedDay || selectedDay.type !== "workout" || selectedDay.completed) {
      return;
    }

    setWeeklySchedule((prev) =>
      prev.map((day) =>
        day.id === selectedDay.id
          ? {
              ...day,
              missed: true,
              completed: false,
            }
          : day
      )
    );
  };

  useEffect(() => {
    if (weekCompletionUnlocked) {
      setWeekBadgePop(true);
      const timer = setTimeout(() => setWeekBadgePop(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [weekCompletionUnlocked]);

  return (
    <section className="page-section plans-page">
      <div className="plans-bg-orb plans-orb-1" />
      <div className="plans-bg-orb plans-orb-2" />
      <div className="plans-bg-grid" />

      <div className="plans-shell">
        <div className="plans-hero-card fade-up delay-1">
          <div className="plans-hero-top">
            <div>
              <span className="plans-hero-tag">Plan Engine</span>
              <h2>{activePlan.name}</h2>
              <p>
                Stay locked into your weekly structure with one clear active
                plan, one strong focus, and premium progress tracking.
              </p>
            </div>

            <button
              type="button"
              className="plans-primary-btn pulse-soft"
              onClick={handleContinuePlan}
            >
              {progress === 100 ? "Plan Completed" : "Continue Plan"}
            </button>
          </div>

          <div className="plans-meta-grid">
            <div className="plans-meta-card">
              <span>Goal</span>
              <strong>{activePlan.goal}</strong>
            </div>

            <div className="plans-meta-card">
              <span>Duration</span>
              <strong>{activePlan.duration}</strong>
            </div>

            <div className="plans-meta-card">
              <span>Difficulty</span>
              <strong>{activePlan.difficulty}</strong>
            </div>

            <div className="plans-meta-card">
              <span>Days / Week</span>
              <strong>{activePlan.daysPerWeek} Days</strong>
            </div>
          </div>

          <div className="plans-progress-block">
            <div className="plans-progress-header">
              <div>
                <h3>Plan Progress</h3>
                <p>
                  Week {activePlan.currentWeek} • {completionText}
                </p>
              </div>

              <div className="plans-progress-pill">{completionText}</div>
            </div>

            <div className="plans-progress-bar">
              <div
                className="plans-progress-fill"
                style={{ width: `${activePlan.progress}%` }}
              />
            </div>

            <div className="plans-progress-stats">
              <div className="plans-mini-stat">
                <span>Completed</span>
                <strong>{activePlan.completedDays} days</strong>
              </div>

              <div className="plans-mini-stat">
                <span>Remaining</span>
                <strong>{activePlan.remainingDays} days</strong>
              </div>

              <div className="plans-mini-stat">
                <span>Badge</span>
                <strong>{activePlan.badge}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="plans-main-grid">
          <div className="plans-left-col">
            <div className="plans-panel fade-up delay-2">
              <div className="plans-panel-header">
                <div>
                  <span className="section-kicker">Today Focus</span>
                  <h3>Today's Workout</h3>
                </div>

                <span
                  className={`status-pill ${
                    todayWorkout.status === "today" ? "today" : ""
                  }`}
                >
                  {todayWorkout.status === "today"
                    ? "Today's Session"
                    : todayWorkout.status === "completed"
                    ? "Completed"
                    : todayWorkout.status === "rest"
                    ? "Rest Day"
                    : todayWorkout.status === "missed"
                    ? "Missed"
                    : "Upcoming"}
                </span>
              </div>

              <div className="today-workout-card">
                <div className="today-workout-main">
                  <div className="today-icon">
                    {todayWorkout.type === "rest" ? "🌙" : "⚡"}
                  </div>

                  <div>
                    <h4>{todayWorkout.title}</h4>
                    <p>
                      {todayWorkout.fullDay} • {todayWorkout.exercises.length}{" "}
                      items
                    </p>
                  </div>
                </div>

                <div className="today-workout-meta">
                  <div className="mini-info-chip">
                    <span>Time</span>
                    <strong>{todayWorkout.estimatedTime}</strong>
                  </div>

                  <div className="mini-info-chip">
                    <span>Goal</span>
                    <strong>{activePlan.goal}</strong>
                  </div>

                  <div className="mini-info-chip">
                    <span>Level</span>
                    <strong>{activePlan.difficulty}</strong>
                  </div>
                </div>

                <div className="today-workout-actions">
                  <button
                    type="button"
                    className="plans-primary-btn"
                    onClick={handleContinuePlan}
                  >
                    {todayWorkout.type === "rest" ? "View Day" : "Start Workout"}
                  </button>

                  <button
                    type="button"
                    className="plans-secondary-btn"
                    onClick={() => {
                      setSelectedDayId(todayWorkout.id);
                      setExpandedDayId(todayWorkout.id);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div className="plans-panel fade-up delay-3">
              <div className="plans-panel-header">
                <div>
                  <span className="section-kicker">Week View</span>
                  <h3>Weekly Schedule</h3>
                </div>

                <span className="panel-hint">
                  Tap a day to expand workout details
                </span>
              </div>

              <div className="weekly-schedule-grid">
                {derivedSchedule.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    className={`week-day-card ${
                      selectedDayId === day.id ? "selected" : ""
                    } ${day.status}`}
                    onClick={() => handleSelectDay(day.id)}
                  >
                    <span className="week-day-label">{day.day}</span>
                    <strong>{day.title}</strong>
                    <small>{day.estimatedTime}</small>
                  </button>
                ))}
              </div>

              {derivedSchedule.map((day) => {
                const isOpen = expandedDayId === day.id;
                const isSelected = selectedDayId === day.id;

                return (
                  <div
                    key={day.id}
                    className={`day-accordion ${isOpen ? "open" : ""} ${
                      isSelected ? "active" : ""
                    }`}
                  >
                    <div className="day-accordion-inner">
                      <div className="day-details-card">
                        <div className="day-details-top">
                          <div>
                            <span className="section-kicker">Workout Details</span>
                            <h4>
                              {day.fullDay} • {day.title}
                            </h4>
                          </div>

                          <div className={`status-pill detail-status ${day.status}`}>
                            {day.status === "completed" && "Completed"}
                            {day.status === "today" && "Today"}
                            {day.status === "upcoming" && "Upcoming"}
                            {day.status === "missed" && "Missed"}
                            {day.status === "rest" && "Rest Day"}
                          </div>
                        </div>

                        <div className="day-details-meta">
                          <div className="detail-chip">
                            <span>Estimated Time</span>
                            <strong>{day.estimatedTime}</strong>
                          </div>

                          <div className="detail-chip">
                            <span>Exercises</span>
                            <strong>{day.exercises.length}</strong>
                          </div>

                          <div className="detail-chip">
                            <span>Plan Track</span>
                            <strong>{activePlan.name}</strong>
                          </div>
                        </div>

                        <div className="exercise-list">
                          {day.exercises.map((exercise) => (
                            <div key={exercise} className="exercise-row">
                              <span className="exercise-dot" />
                              <p>{exercise}</p>
                            </div>
                          ))}
                        </div>

                        <div className="day-details-actions">
                          {day.type === "workout" && (
                            <>
                              <button
                                type="button"
                                className={`plans-primary-btn success-btn ${
                                  successPulse && selectedDayId === day.id
                                    ? "completed-pulse"
                                    : ""
                                }`}
                                onClick={handleMarkComplete}
                                disabled={day.completed}
                              >
                                {day.completed ? "Completed" : "Mark as Complete"}
                              </button>

                              <button
                                type="button"
                                className="plans-secondary-btn"
                                onClick={handleReplaceWorkout}
                              >
                                Replace Workout
                              </button>

                              {!day.completed && (
                                <button
                                  type="button"
                                  className="plans-secondary-btn danger-btn"
                                  onClick={handleMarkMissed}
                                >
                                  Mark Missed
                                </button>
                              )}
                            </>
                          )}

                          {day.type === "rest" && (
                            <button type="button" className="plans-secondary-btn">
                              Recovery Day
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="plans-right-col">
            <div className="plans-panel fade-up delay-2">
              <div className="plans-panel-header">
                <div>
                  <span className="section-kicker">Progress</span>
                  <h3>Completion Summary</h3>
                </div>
              </div>

              <div className="summary-stack">
                <div className="summary-card highlight">
                  <span>Plan Completion</span>
                  <strong>{activePlan.progress}%</strong>
                  <p>You're building strong momentum this cycle.</p>
                </div>

                <div className="summary-card">
                  <span>Completed vs Remaining</span>
                  <strong>
                    {activePlan.completedDays} / {activePlan.remainingDays}
                  </strong>
                  <p>Track finished and pending workout days clearly.</p>
                </div>

                <div className="summary-card">
                  <span>Workout Time</span>
                  <strong>{activePlan.estimatedWorkoutTime} min avg</strong>
                  <p>Balanced duration for consistency and recovery.</p>
                </div>

                <div className="summary-card">
                  <span>Missed Workouts</span>
                  <strong>{missedDays} day{missedDays !== 1 ? "s" : ""}</strong>
                  <p>Missed days stay visible so the schedule stays honest.</p>
                </div>

                <div className="summary-card">
                  <span>Next Reward</span>
                  <strong>{activePlan.reward}</strong>
                  <p>Finish this week to unlock your premium badge.</p>
                </div>
              </div>
            </div>

            <div className="plans-panel fade-up delay-3">
              <div className="plans-panel-header">
                <div>
                  <span className="section-kicker">Suggestions</span>
                  <h3>Recommended Plans</h3>
                </div>
              </div>

              <div className="recommended-plans-list">
                {recommendedPlansData.map((plan) => (
                  <div
                    key={plan.id}
                    className={`recommended-plan-card ${plan.accent}`}
                  >
                    <div className="recommended-top">
                      <div>
                        <h4>{plan.name}</h4>
                        <p>{plan.goal}</p>
                      </div>

                      <span className="difficulty-tag">{plan.difficulty}</span>
                    </div>

                    <div className="recommended-meta">
                      <span>{plan.duration}</span>
                      <span>{plan.daysPerWeek} Days / Week</span>
                      <span>{plan.time}</span>
                    </div>

                    <button type="button" className="plans-secondary-btn full-btn">
                      View Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="plans-panel fade-up delay-4">
              <div className="plans-panel-header">
                <div>
                  <span className="section-kicker">Achievements</span>
                  <h3>Weekly Rewards</h3>
                </div>
              </div>

              <div className={`achievement-card ${weekBadgePop ? "badge-burst" : ""}`}>
                <div className="achievement-badge">🏆</div>
                <div>
                  <h4>{activePlan.badge}</h4>
                  <p>
                    {weekCompletionUnlocked
                      ? "Full week completed. Premium reward unlocked."
                      : "Keep your rhythm strong and unlock your end-plan reward."}
                  </p>
                </div>
              </div>

              <div className="achievement-list">
                <div className={`achievement-row ${completedDays >= 2 ? "unlocked" : "active"}`}>
                  <div className="achievement-state-dot" />
                  <div>
                    <h5>Momentum Builder</h5>
                    <p>Complete 2 workout days to build early momentum.</p>
                  </div>
                </div>

                <div className={`achievement-row ${completedDays >= 4 ? "unlocked" : "active"}`}>
                  <div className="achievement-state-dot" />
                  <div>
                    <h5>Week Warrior</h5>
                    <p>Finish 4 workout days to earn your weekly badge.</p>
                  </div>
                </div>

                <div
                  className={`achievement-row ${
                    progress === 100 ? "unlocked" : "locked"
                  }`}
                >
                  <div className="achievement-state-dot" />
                  <div>
                    <h5>Plan Finisher</h5>
                    <p>Complete the full plan cycle to unlock your final reward.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;