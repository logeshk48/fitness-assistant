import "./Plans.css";
import { useMemo, useState } from "react";

const activePlanData = {
  id: "active-plan-1",
  name: "Lean Muscle Builder",
  goal: "Muscle Gain",
  duration: "8 Weeks",
  difficulty: "Intermediate",
  daysPerWeek: 5,
  progress: 42,
  completedDays: 14,
  remainingDays: 19,
  estimatedWorkoutTime: 48,
  status: "active",
  currentWeek: 3,
  badge: "Week 2 Complete",
  reward: "Titan Consistency Badge",
};

const weeklyScheduleData = [
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
  },
  {
    id: 6,
    day: "Sat",
    fullDay: "Saturday",
    title: "Full Body Conditioning",
    type: "workout",
    status: "missed",
    estimatedTime: "40 min",
    exercises: [
      "Burpees",
      "Mountain Climbers",
      "Jumping Jacks",
      "High Knees",
    ],
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

const achievementData = [
  {
    id: 1,
    title: "Week Warrior",
    subtitle: "Finish every workout this week",
    state: "unlocked",
  },
  {
    id: 2,
    title: "Momentum Builder",
    subtitle: "Complete 3 workout days in a row",
    state: "active",
  },
  {
    id: 3,
    title: "Plan Finisher",
    subtitle: "Unlock your end-of-plan reward",
    state: "locked",
  },
];

const Plans = () => {
  const [selectedDayId, setSelectedDayId] = useState(4);

  const selectedDay = useMemo(() => {
    return (
      weeklyScheduleData.find((day) => day.id === selectedDayId) ||
      weeklyScheduleData[0]
    );
  }, [selectedDayId]);

  const todayWorkout = useMemo(() => {
    return (
      weeklyScheduleData.find((day) => day.status === "today") ||
      weeklyScheduleData.find((day) => day.type === "workout") ||
      weeklyScheduleData[0]
    );
  }, []);

  const completionText = `${activePlanData.progress}% Completed`;

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
              <h2>{activePlanData.name}</h2>
              <p>
                Stay locked into your weekly structure with one clear active
                plan, one strong focus, and premium progress tracking.
              </p>
            </div>

            <button type="button" className="plans-primary-btn pulse-soft">
              Continue Plan
            </button>
          </div>

          <div className="plans-meta-grid">
            <div className="plans-meta-card">
              <span>Goal</span>
              <strong>{activePlanData.goal}</strong>
            </div>

            <div className="plans-meta-card">
              <span>Duration</span>
              <strong>{activePlanData.duration}</strong>
            </div>

            <div className="plans-meta-card">
              <span>Difficulty</span>
              <strong>{activePlanData.difficulty}</strong>
            </div>

            <div className="plans-meta-card">
              <span>Days / Week</span>
              <strong>{activePlanData.daysPerWeek} Days</strong>
            </div>
          </div>

          <div className="plans-progress-block">
            <div className="plans-progress-header">
              <div>
                <h3>Plan Progress</h3>
                <p>
                  Week {activePlanData.currentWeek} • {completionText}
                </p>
              </div>

              <div className="plans-progress-pill">{completionText}</div>
            </div>

            <div className="plans-progress-bar">
              <div
                className="plans-progress-fill"
                style={{ width: `${activePlanData.progress}%` }}
              />
            </div>

            <div className="plans-progress-stats">
              <div className="plans-mini-stat">
                <span>Completed</span>
                <strong>{activePlanData.completedDays} days</strong>
              </div>

              <div className="plans-mini-stat">
                <span>Remaining</span>
                <strong>{activePlanData.remainingDays} days</strong>
              </div>

              <div className="plans-mini-stat">
                <span>Badge</span>
                <strong>{activePlanData.badge}</strong>
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
                    : "Scheduled"}
                </span>
              </div>

              <div className="today-workout-card">
                <div className="today-workout-main">
                  <div className="today-icon">⚡</div>

                  <div>
                    <h4>{todayWorkout.title}</h4>
                    <p>
                      {todayWorkout.fullDay} • {todayWorkout.exercises.length}{" "}
                      exercises
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
                    <strong>{activePlanData.goal}</strong>
                  </div>

                  <div className="mini-info-chip">
                    <span>Level</span>
                    <strong>{activePlanData.difficulty}</strong>
                  </div>
                </div>

                <div className="today-workout-actions">
                  <button type="button" className="plans-primary-btn">
                    Start Workout
                  </button>
                  <button type="button" className="plans-secondary-btn">
                    Replace Workout
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
                  Tap a day to view workout details
                </span>
              </div>

              <div className="weekly-schedule-grid">
                {weeklyScheduleData.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    className={`week-day-card ${
                      selectedDayId === day.id ? "selected" : ""
                    } ${day.status}`}
                    onClick={() => setSelectedDayId(day.id)}
                  >
                    <span className="week-day-label">{day.day}</span>
                    <strong>{day.title}</strong>
                    <small>{day.estimatedTime}</small>
                  </button>
                ))}
              </div>

              <div className="day-details-card">
                <div className="day-details-top">
                  <div>
                    <span className="section-kicker">Workout Details</span>
                    <h4>
                      {selectedDay.fullDay} • {selectedDay.title}
                    </h4>
                  </div>

                  <div
                    className={`status-pill detail-status ${selectedDay.status}`}
                  >
                    {selectedDay.status === "completed" && "Completed"}
                    {selectedDay.status === "today" && "Today"}
                    {selectedDay.status === "upcoming" && "Upcoming"}
                    {selectedDay.status === "missed" && "Missed"}
                    {selectedDay.status === "rest" && "Rest Day"}
                  </div>
                </div>

                <div className="day-details-meta">
                  <div className="detail-chip">
                    <span>Estimated Time</span>
                    <strong>{selectedDay.estimatedTime}</strong>
                  </div>

                  <div className="detail-chip">
                    <span>Exercises</span>
                    <strong>{selectedDay.exercises.length}</strong>
                  </div>

                  <div className="detail-chip">
                    <span>Plan Track</span>
                    <strong>{activePlanData.name}</strong>
                  </div>
                </div>

                <div className="exercise-list">
                  {selectedDay.exercises.map((exercise) => (
                    <div key={exercise} className="exercise-row">
                      <span className="exercise-dot" />
                      <p>{exercise}</p>
                    </div>
                  ))}
                </div>

                <div className="day-details-actions">
                  <button type="button" className="plans-primary-btn success-btn">
                    Mark as Complete
                  </button>
                  <button type="button" className="plans-secondary-btn">
                    Replace Workout
                  </button>
                </div>
              </div>
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
                  <strong>{activePlanData.progress}%</strong>
                  <p>You're building strong momentum this cycle.</p>
                </div>

                <div className="summary-card">
                  <span>Workout Time</span>
                  <strong>{activePlanData.estimatedWorkoutTime} min avg</strong>
                  <p>Balanced duration for consistency and recovery.</p>
                </div>

                <div className="summary-card">
                  <span>Next Reward</span>
                  <strong>{activePlanData.reward}</strong>
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

              <div className="achievement-card">
                <div className="achievement-badge">🏆</div>
                <div>
                  <h4>{activePlanData.badge}</h4>
                  <p>Keep your rhythm strong and unlock your end-plan reward.</p>
                </div>
              </div>

              <div className="achievement-list">
                {achievementData.map((item) => (
                  <div
                    key={item.id}
                    className={`achievement-row ${item.state}`}
                  >
                    <div className="achievement-state-dot" />
                    <div>
                      <h5>{item.title}</h5>
                      <p>{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Plans;