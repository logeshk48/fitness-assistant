import { useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import "./Stats.css";

const MONTHLY_WORKOUT_GOAL = 20;
const SNAPSHOT_KEY = "stats_behavior_snapshot_v1";

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getStartOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const daysBetween = (a, b) => {
  const diff = getStartOfDay(a).getTime() - getStartOfDay(b).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
};

const safeNumber = (value) => Number(value || 0);

const CountUp = ({ value, duration = 1000, suffix = "", decimals = 0 }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frameId;
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);

      if (progress < 1) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [value, duration]);

  return (
    <span>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const GoalRing = ({ value, total, label }) => {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;

  return (
    <div className="goal-ring-shell">
      <div
        className="goal-ring-v3"
        style={{
          background: `conic-gradient(
            from 200deg,
            rgba(114, 92, 255, 1) 0%,
            rgba(83, 229, 255, 1) ${percentage * 0.8}%,
            rgba(179, 108, 255, 1) ${percentage}%,
            rgba(255,255,255,0.08) ${percentage}%,
            rgba(255,255,255,0.08) 100%
          )`,
        }}
      >
        <div className="goal-ring-core">
          <strong>{Math.round(percentage)}%</strong>
          <span>{label}</span>
        </div>
      </div>
    </div>
  );
};

const SparkleBurst = () => (
  <div className="sparkle-burst" aria-hidden="true">
    <span className="spark s1" />
    <span className="spark s2" />
    <span className="spark s3" />
    <span className="spark s4" />
    <span className="spark s5" />
    <span className="spark s6" />
  </div>
);

const Stats = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [savePulse, setSavePulse] = useState(false);
  const [streakBoost, setStreakBoost] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [milestonePopup, setMilestonePopup] = useState(null);
  const [recordHighlights, setRecordHighlights] = useState({
    heaviestSet: false,
    bestVolumeWorkout: false,
    bestSetCountWorkout: false,
  });

  const firstBehaviorRun = useRef(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const workoutsRef = collection(db, "workouts");
        let snapshot;

        try {
          const q = query(workoutsRef, orderBy("createdAt", "desc"));
          snapshot = await getDocs(q);
        } catch {
          snapshot = await getDocs(workoutsRef);
        }

        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setWorkouts(items);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayKey = getDateKey(now);

    const normalized = workouts
      .map((item) => {
        const createdDate =
          item.createdAt?.toDate?.() ||
          (item.dateKey ? new Date(item.dateKey) : new Date());

        return {
          ...item,
          parsedDate: createdDate,
          dateKey: item.dateKey || getDateKey(createdDate),
          totalSets: safeNumber(item.totalSets),
          totalReps: safeNumber(item.totalReps),
          sets: Array.isArray(item.sets) ? item.sets : [],
        };
      })
      .sort((a, b) => b.parsedDate - a.parsedDate);

    const totalWorkouts = normalized.length;
    const totalSets = normalized.reduce((sum, item) => sum + item.totalSets, 0);
    const totalReps = normalized.reduce((sum, item) => sum + item.totalReps, 0);

    const uniqueWorkoutDays = [...new Set(normalized.map((w) => w.dateKey))].sort(
      (a, b) => new Date(a) - new Date(b)
    );

    let streak = 0;
    if (uniqueWorkoutDays.length) {
      const daySet = new Set(uniqueWorkoutDays);
      let cursor = new Date();

      if (!daySet.has(todayKey)) {
        cursor.setDate(cursor.getDate() - 1);
      }

      while (daySet.has(getDateKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
    }

    const exerciseMap = {};
    normalized.forEach((item) => {
      if (!exerciseMap[item.workout]) {
        exerciseMap[item.workout] = {
          name: item.workout,
          count: 0,
          reps: 0,
          sets: 0,
        };
      }
      exerciseMap[item.workout].count += 1;
      exerciseMap[item.workout].reps += item.totalReps;
      exerciseMap[item.workout].sets += item.totalSets;
    });

    const bestExercise =
      Object.values(exerciseMap).sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.reps - a.reps;
      })[0] || null;

    const muscleMap = {};
    normalized.forEach((item) => {
      const key = item.muscleGroup || "Other";
      muscleMap[key] = (muscleMap[key] || 0) + 1;
    });

    const muscleDistribution = Object.entries(muscleMap)
      .map(([name, value]) => ({
        name,
        value,
        percent: totalWorkouts ? Math.round((value / totalWorkouts) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const bestMuscle = muscleDistribution[0] || null;

    const equipmentMap = { "With Weight": 0, "Without Weight": 0 };
    normalized.forEach((item) => {
      const type = item.equipmentType || "Without Weight";
      if (equipmentMap[type] === undefined) equipmentMap[type] = 0;
      equipmentMap[type] += 1;
    });

    const weightedCount = equipmentMap["With Weight"] || 0;
    const bodyweightCount = equipmentMap["Without Weight"] || 0;

    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(now.getDate() - (6 - index));
      const key = getDateKey(date);
      const count = normalized.filter((item) => item.dateKey === key).length;

      return {
        key,
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        count,
      };
    });

    const maxWeeklyCount = Math.max(...last7Days.map((d) => d.count), 1);

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthDays = currentMonthEnd.getDate();
    const firstWeekday = currentMonthStart.getDay();

    const monthlyWorkoutCount = normalized.filter((item) => {
      const d = item.parsedDate;
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    const monthDateMap = {};
    normalized.forEach((item) => {
      const d = item.parsedDate;
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        monthDateMap[item.dateKey] = (monthDateMap[item.dateKey] || 0) + 1;
      }
    });

    const calendarDays = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      calendarDays.push({ empty: true, id: `empty-${i}` });
    }

    for (let day = 1; day <= monthDays; day += 1) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      const key = getDateKey(date);
      const count = monthDateMap[key] || 0;

      let level = "none";
      if (count >= 3) level = "high";
      else if (count === 2) level = "medium";
      else if (count === 1) level = "low";

      calendarDays.push({
        id: key,
        day,
        key,
        count,
        level,
        isToday: key === todayKey,
      });
    }

    const heaviestSet = normalized.reduce(
      (best, item) => {
        item.sets.forEach((set) => {
          const weight = safeNumber(set.weight);
          if (weight > best.weight) {
            best = { weight, workout: item.workout };
          }
        });
        return best;
      },
      { weight: 0, workout: "-" }
    );

    const bestVolumeWorkout = normalized.reduce(
      (best, item) =>
        item.totalReps > best.totalReps
          ? { workout: item.workout, totalReps: item.totalReps }
          : best,
      { workout: "-", totalReps: 0 }
    );

    const bestSetCountWorkout = normalized.reduce(
      (best, item) =>
        item.totalSets > best.totalSets
          ? { workout: item.workout, totalSets: item.totalSets }
          : best,
      { workout: "-", totalSets: 0 }
    );

    const recent7 = normalized.filter(
      (item) =>
        daysBetween(now, item.parsedDate) >= 0 &&
        daysBetween(now, item.parsedDate) <= 6
    );

    const previous7 = normalized.filter((item) => {
      const diff = daysBetween(now, item.parsedDate);
      return diff >= 7 && diff <= 13;
    });

    const recent7Count = recent7.length;
    const previous7Count = previous7.length;
    const recent7Reps = recent7.reduce((sum, item) => sum + item.totalReps, 0);
    const previous7Reps = previous7.reduce((sum, item) => sum + item.totalReps, 0);

    const weeklyWorkoutChange = recent7Count - previous7Count;
    const weeklyRepsChange = recent7Reps - previous7Reps;

    const insights = [];

    if (streak >= 5) {
      insights.push({
        title: "Streak is strong",
        text: `You're on a ${streak}-day streak. Keep that momentum alive.`,
      });
    } else if (streak > 0) {
      insights.push({
        title: "Momentum is building",
        text: `You're on a ${streak}-day streak. One more workout keeps the chain alive.`,
      });
    } else {
      insights.push({
        title: "Fresh restart available",
        text: "A short session today is enough to restart your consistency.",
      });
    }

    if (weeklyWorkoutChange > 0) {
      insights.push({
        title: "Weekly volume improved",
        text: `You completed ${weeklyWorkoutChange} more workout${
          weeklyWorkoutChange > 1 ? "s" : ""
        } than the previous 7 days.`,
      });
    } else if (weeklyWorkoutChange < 0) {
      insights.push({
        title: "Slight weekly drop",
        text: `You did ${Math.abs(weeklyWorkoutChange)} fewer workout${
          Math.abs(weeklyWorkoutChange) > 1 ? "s" : ""
        } than the previous 7 days.`,
      });
    } else {
      insights.push({
        title: "Stable rhythm",
        text: "Your workout frequency matches the previous 7 days.",
      });
    }

    if (bestMuscle) {
      insights.push({
        title: "Most trained muscle",
        text: `${bestMuscle.name} currently leads your split at ${bestMuscle.percent}%.`,
      });
    }

    const milestones = [
      { label: "Starter", unlocked: totalWorkouts >= 1 },
      { label: "5 Workouts", unlocked: totalWorkouts >= 5 },
      { label: "10 Workouts", unlocked: totalWorkouts >= 10 },
      { label: "3-Day Streak", unlocked: streak >= 3 },
      { label: "7-Day Streak", unlocked: streak >= 7 },
      { label: "Strength Mode", unlocked: weightedCount >= 10 },
    ];

    const recentImprovementSummary = {
      workoutText:
        weeklyWorkoutChange > 0
          ? `+${weeklyWorkoutChange} workouts vs previous 7 days`
          : weeklyWorkoutChange < 0
          ? `${weeklyWorkoutChange} workouts vs previous 7 days`
          : "No change vs previous 7 days",
      repsText:
        weeklyRepsChange > 0
          ? `+${weeklyRepsChange} reps vs previous 7 days`
          : weeklyRepsChange < 0
          ? `${weeklyRepsChange} reps vs previous 7 days`
          : "No rep change vs previous 7 days",
    };

    return {
      totalWorkouts,
      totalSets,
      totalReps,
      streak,
      bestExercise,
      bestMuscle,
      muscleDistribution,
      weightedCount,
      bodyweightCount,
      last7Days,
      maxWeeklyCount,
      calendarDays,
      monthlyWorkoutCount,
      goalTarget: MONTHLY_WORKOUT_GOAL,
      heaviestSet,
      bestVolumeWorkout,
      bestSetCountWorkout,
      insights: insights.slice(0, 3),
      milestones,
      recentImprovementSummary,
      latestWorkoutDate: normalized[0]?.parsedDate || null,
    };
  }, [workouts]);

  useEffect(() => {
    if (loading) return;

    const previousSnapshot = JSON.parse(
      localStorage.getItem(SNAPSHOT_KEY) || "null"
    );

    const currentSnapshot = {
      streak: stats.streak,
      heaviestSet: stats.heaviestSet.weight,
      bestVolumeWorkout: stats.bestVolumeWorkout.totalReps,
      bestSetCountWorkout: stats.bestSetCountWorkout.totalSets,
      unlockedMilestones: stats.milestones
        .filter((badge) => badge.unlocked)
        .map((badge) => badge.label),
    };

    const newHighlights = {
      heaviestSet: false,
      bestVolumeWorkout: false,
      bestSetCountWorkout: false,
    };

    let nextCelebration = null;
    let nextMilestone = null;
    let shouldBoostStreak = false;

    if (previousSnapshot) {
      if (currentSnapshot.streak > previousSnapshot.streak) {
        shouldBoostStreak = true;
      }

      if (currentSnapshot.heaviestSet > previousSnapshot.heaviestSet) {
        newHighlights.heaviestSet = true;
        nextCelebration = {
          title: "New Personal Record",
          text: `Heaviest set improved to ${currentSnapshot.heaviestSet} kg.`,
        };
      }

      if (
        currentSnapshot.bestVolumeWorkout > previousSnapshot.bestVolumeWorkout &&
        !nextCelebration
      ) {
        newHighlights.bestVolumeWorkout = true;
        nextCelebration = {
          title: "Volume Record Unlocked",
          text: `Most reps in one workout improved to ${currentSnapshot.bestVolumeWorkout}.`,
        };
      }

      if (
        currentSnapshot.bestSetCountWorkout > previousSnapshot.bestSetCountWorkout &&
        !nextCelebration
      ) {
        newHighlights.bestSetCountWorkout = true;
        nextCelebration = {
          title: "Set Record Improved",
          text: `Most sets in one workout improved to ${currentSnapshot.bestSetCountWorkout}.`,
        };
      }

      const newlyUnlocked = currentSnapshot.unlockedMilestones.filter(
        (label) => !previousSnapshot.unlockedMilestones.includes(label)
      );

      if (newlyUnlocked.length > 0) {
        nextMilestone = newlyUnlocked[newlyUnlocked.length - 1];
        if (!nextCelebration) {
          nextCelebration = {
            title: "Milestone Reached",
            text: `${nextMilestone} badge unlocked.`,
          };
        }
      }
    }

    const now = Date.now();
    const latestWorkoutMs = stats.latestWorkoutDate
      ? stats.latestWorkoutDate.getTime()
      : 0;

    if (latestWorkoutMs && now - latestWorkoutMs < 2 * 60 * 1000) {
      setSavePulse(true);
      setTimeout(() => setSavePulse(false), 2200);
    }

    if (shouldBoostStreak) {
      setStreakBoost(true);
      setTimeout(() => setStreakBoost(false), 2200);
    }

    setRecordHighlights(newHighlights);

    if (nextCelebration) {
      setCelebration(nextCelebration);
      setTimeout(() => setCelebration(null), 3200);
    }

    if (nextMilestone) {
      setMilestonePopup(nextMilestone);
      setTimeout(() => setMilestonePopup(null), 3600);
    }

    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(currentSnapshot));

    if (firstBehaviorRun.current) {
      firstBehaviorRun.current = false;
    }
  }, [loading, stats]);

  if (loading) {
    return (
      <section className="page-section stats-page">
        <div className="stats-hero skeleton shimmer" />
        <div className="stats-top-grid">
          <div className="stats-card skeleton shimmer" />
          <div className="stats-card skeleton shimmer" />
          <div className="stats-card skeleton shimmer" />
          <div className="stats-card skeleton shimmer" />
        </div>
        <div className="stats-main-grid">
          <div className="stats-panel tall skeleton shimmer" />
          <div className="stats-panel tall skeleton shimmer" />
        </div>
      </section>
    );
  }

  return (
    <section className="page-section stats-page">
      <div className="stats-bg-orb orb-1" />
      <div className="stats-bg-orb orb-2" />
      <div className="stats-bg-grid" />

      {savePulse && (
        <div className="save-success-pill">
          <span className="save-success-dot" />
          Workout saved successfully
        </div>
      )}

      {celebration && (
        <div className="celebration-toast">
          <SparkleBurst />
          <div className="celebration-toast-copy">
            <strong>{celebration.title}</strong>
            <p>{celebration.text}</p>
          </div>
        </div>
      )}

      {milestonePopup && (
        <div className="milestone-popup">
          <div className="milestone-popup-card">
            <div className="milestone-popup-icon">🏆</div>
            <div>
              <strong>Milestone Unlocked</strong>
              <p>{milestonePopup}</p>
            </div>
          </div>
        </div>
      )}

      <div className="stats-hero fade-up">
        <div className="stats-hero-copy">
          <span className="stats-tag">Performance Intelligence</span>
          <h2>Stats & Progress</h2>
          <p>
            Ultra-clean performance tracking from your workout engine. See streak,
            consistency, personal records, muscle split, and goal progress in one
            premium view.
          </p>

          <div className="hero-mini-stats">
            <div className="hero-mini-pill">
              <span>Total Sets</span>
              <strong>
                <CountUp value={stats.totalSets} />
              </strong>
            </div>
            <div className="hero-mini-pill">
              <span>Total Reps</span>
              <strong>
                <CountUp value={stats.totalReps} />
              </strong>
            </div>
          </div>
        </div>

        <GoalRing
          value={stats.monthlyWorkoutCount}
          total={stats.goalTarget}
          label="Monthly Goal"
        />
      </div>

      <div className="stats-top-grid">
        <div
          className={`stats-card fade-up delay-1 interactive-card spotlight-card ${
            streakBoost ? "streak-boost" : ""
          }`}
        >
          <div className="card-shine" />
          <div className="stats-card-head">
            <span>Workout Streak</span>
            <div className="flame-pulse">🔥</div>
          </div>
          <strong>
            <CountUp value={stats.streak} />
          </strong>
          <p>consecutive active days</p>
        </div>

        <div className="stats-card fade-up delay-2 interactive-card">
          <div className="card-shine" />
          <div className="stats-card-head">
            <span>Total Workouts</span>
            <span className="mini-badge">All Time</span>
          </div>
          <strong>
            <CountUp value={stats.totalWorkouts} />
          </strong>
          <p>sessions completed</p>
        </div>

        <div className="stats-card fade-up delay-3 interactive-card">
          <div className="card-shine" />
          <div className="stats-card-head">
            <span>Best Exercise</span>
            <span className="mini-badge">Top</span>
          </div>
          <strong className="text-strong-sm">
            {stats.bestExercise?.name || "No data yet"}
          </strong>
          <p>
            {stats.bestExercise
              ? `${stats.bestExercise.count} logged sessions`
              : "Start logging workouts"}
          </p>
        </div>

        <div className="stats-card fade-up delay-4 interactive-card">
          <div className="card-shine" />
          <div className="stats-card-head">
            <span>Goal Progress</span>
            <span className="mini-badge">
              {stats.monthlyWorkoutCount}/{stats.goalTarget}
            </span>
          </div>
          <div className="goal-bar">
            <div
              className="goal-bar-fill"
              style={{
                width: `${Math.min(
                  (stats.monthlyWorkoutCount / stats.goalTarget) * 100,
                  100
                )}%`,
              }}
            />
          </div>
          <p>monthly workout target</p>
        </div>
      </div>

      <div className="section-label fade-up delay-1">
        <span>Main Performance View</span>
      </div>

      <div className="stats-main-grid">
        <div className="stats-panel fade-up delay-2">
          <div className="panel-glow" />
          <div className="panel-top">
            <div>
              <h3>Weekly Progress</h3>
              <p>Last 7 days workout activity</p>
            </div>
          </div>

          <div className="weekly-chart">
            {stats.last7Days.map((day, index) => {
              const height = (day.count / stats.maxWeeklyCount) * 100 || 8;

              return (
                <div className="bar-col" key={day.key}>
                  <span className="bar-count">{day.count}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        height: `${Math.max(height, day.count > 0 ? 16 : 6)}%`,
                        animationDelay: `${index * 0.08}s`,
                      }}
                    />
                  </div>
                  <span className="bar-label">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stats-panel fade-up delay-3">
          <div className="panel-glow" />
          <div className="panel-top">
            <div>
              <h3>Muscle Distribution</h3>
              <p>Your most trained muscle groups</p>
            </div>
          </div>

          <div className="distribution-list">
            {stats.muscleDistribution.length === 0 ? (
              <div className="empty-box">No workout data yet</div>
            ) : (
              stats.muscleDistribution.map((item, index) => (
                <div className="distribution-row" key={item.name}>
                  <div className="distribution-label">
                    <span className="distribution-dot" />
                    <strong>{item.name}</strong>
                  </div>

                  <div className="distribution-bar-wrap">
                    <div className="distribution-bar">
                      <div
                        className="distribution-bar-fill"
                        style={{
                          width: `${item.percent}%`,
                          animationDelay: `${index * 0.08}s`,
                        }}
                      />
                    </div>
                    <span>{item.percent}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="stats-panel fade-up delay-4">
          <div className="panel-glow" />
          <div className="panel-top">
            <div>
              <h3>Monthly Consistency</h3>
              <p>
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="calendar-weekdays">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="calendar-grid">
            {stats.calendarDays.map((day, index) =>
              day.empty ? (
                <div key={day.id} className="calendar-cell empty" />
              ) : (
                <div
                  key={day.id}
                  className={`calendar-cell ${day.level} ${
                    day.isToday ? "today" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.015}s` }}
                  title={`${day.count} workout${day.count !== 1 ? "s" : ""}`}
                >
                  {day.day}
                </div>
              )
            )}
          </div>
        </div>

        <div className="stats-panel fade-up delay-5">
          <div className="panel-glow" />
          <div className="panel-top">
            <div>
              <h3>Workout Split</h3>
              <p>Weighted vs bodyweight sessions</p>
            </div>
          </div>

          <div className="split-wrap">
            <div className="split-card">
              <span>With Weight</span>
              <strong>
                <CountUp value={stats.weightedCount} />
              </strong>
            </div>

            <div className="split-card">
              <span>Without Weight</span>
              <strong>
                <CountUp value={stats.bodyweightCount} />
              </strong>
            </div>
          </div>

          <div className="goal-bar split-bar">
            <div
              className="split-segment weighted"
              style={{
                width: `${
                  stats.totalWorkouts
                    ? (stats.weightedCount / stats.totalWorkouts) * 100
                    : 0
                }%`,
              }}
            />
            <div
              className="split-segment bodyweight"
              style={{
                width: `${
                  stats.totalWorkouts
                    ? (stats.bodyweightCount / stats.totalWorkouts) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="section-label fade-up delay-2">
        <span>Performance Highlights</span>
      </div>

      <div className="stats-lower-grid">
        <div className="stats-panel fade-up delay-2">
          <div className="panel-glow" />
          <div className="panel-top">
            <div>
              <h3>Personal Records</h3>
              <p>Your strongest performance markers</p>
            </div>
          </div>

          <div className="records-grid">
            <div
              className={`record-card record-pop ${
                recordHighlights.heaviestSet ? "is-new-record" : ""
              }`}
            >
              <span>Heaviest Set</span>
              <strong>
                <CountUp value={stats.heaviestSet.weight} suffix=" kg" />
              </strong>
              <p>{stats.heaviestSet.workout || "-"}</p>
            </div>

            <div
              className={`record-card record-pop delay-1 ${
                recordHighlights.bestVolumeWorkout ? "is-new-record" : ""
              }`}
            >
              <span>Most Reps in One Workout</span>
              <strong>
                <CountUp value={stats.bestVolumeWorkout.totalReps} />
              </strong>
              <p>{stats.bestVolumeWorkout.workout}</p>
            </div>

            <div
              className={`record-card record-pop delay-2 ${
                recordHighlights.bestSetCountWorkout ? "is-new-record" : ""
              }`}
            >
              <span>Most Sets in One Workout</span>
              <strong>
                <CountUp value={stats.bestSetCountWorkout.totalSets} />
              </strong>
              <p>{stats.bestSetCountWorkout.workout}</p>
            </div>
          </div>
        </div>

        <div className="stats-panel fade-up delay-3">
          <div className="panel-glow" />
          <div className="panel-top">
            <div>
              <h3>Smart Insights</h3>
              <p>Short useful takeaways from your activity</p>
            </div>
          </div>

          <div className="insight-stack">
            {stats.insights.map((insight, index) => (
              <div
                key={insight.title}
                className="insight-card"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <strong>{insight.title}</strong>
                <p>{insight.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-panel fade-up delay-4">
          <div className="panel-glow" />
          <div className="panel-top">
            <div>
              <h3>Milestone Badges</h3>
              <p>Unlocked by consistency and effort</p>
            </div>
          </div>

          <div className="badge-grid">
            {stats.milestones.map((badge, index) => (
              <div
                key={badge.label}
                className={`badge-card ${badge.unlocked ? "unlocked" : "locked"}`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="badge-icon">{badge.unlocked ? "🏆" : "🔒"}</div>
                <strong>{badge.label}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-panel fade-up delay-5">
          <div className="panel-glow" />
          <div className="panel-top">
            <div>
              <h3>Recent Improvement Summary</h3>
              <p>Compare the last 7 days with the previous 7 days</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-line">
              <span>Workout frequency</span>
              <strong>{stats.recentImprovementSummary.workoutText}</strong>
            </div>
            <div className="summary-line">
              <span>Training volume</span>
              <strong>{stats.recentImprovementSummary.repsText}</strong>
            </div>
            <div className="summary-line">
              <span>Most trained muscle</span>
              <strong>{stats.bestMuscle?.name || "No data yet"}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;