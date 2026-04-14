import "./Plans.css";
import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const goalOptions = [
  "Muscle Gain",
  "Fat Loss",
  "Strength",
  "Consistency",
  "Endurance",
  "General Fitness",
];

const durationOptions = ["4 Weeks", "8 Weeks", "12 Weeks"];

const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const createExerciseRow = () => ({
  id: Date.now() + Math.random(),
  name: "",
  sets: "",
  reps: "",
});

const createDayBlock = (dayName = "Monday") => ({
  id: Date.now() + Math.random(),
  day: dayName,
  focus: "",
  exercises: [createExerciseRow()],
});

const createPlanDraft = () => ({
  planName: "",
  goal: "Muscle Gain",
  duration: "8 Weeks",
  difficulty: "Beginner",
  daysPerWeek: 4,
  days: [
    createDayBlock("Monday"),
    createDayBlock("Tuesday"),
    createDayBlock("Thursday"),
    createDayBlock("Saturday"),
  ],
});

const sanitizeDays = (days) => {
  return days.map((day, dayIndex) => ({
    ...day,
    id: day.id || Date.now() + dayIndex,
    day: day.day || weekDays[dayIndex] || "Monday",
    focus: day.focus || "",
    exercises:
      Array.isArray(day.exercises) && day.exercises.length > 0
        ? day.exercises.map((exercise, exerciseIndex) => ({
            id: exercise.id || Date.now() + exerciseIndex + Math.random(),
            name: exercise.name || "",
            sets: exercise.sets || "",
            reps: exercise.reps || "",
          }))
        : [createExerciseRow()],
  }));
};

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [draft, setDraft] = useState(createPlanDraft());

  const plansRef = collection(db, "plans");

  const fetchPlans = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const plansQuery = query(plansRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(plansQuery);

      const loadedPlans = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setPlans(loadedPlans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setErrorMessage("Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const activePlan = useMemo(() => {
    return plans.find((plan) => plan.isActive) || null;
  }, [plans]);

  const sortedPlans = useMemo(() => {
    const active = plans.filter((plan) => plan.isActive);
    const inactive = plans.filter((plan) => !plan.isActive);
    return [...active, ...inactive];
  }, [plans]);

  const openCreateModal = () => {
    setEditingPlanId(null);
    setDraft(createPlanDraft());
    setShowModal(true);
    setErrorMessage("");
  };

  const openEditModal = (plan) => {
    setEditingPlanId(plan.id);
    setDraft({
      planName: plan.planName || "",
      goal: plan.goal || "Muscle Gain",
      duration: plan.duration || "8 Weeks",
      difficulty: plan.difficulty || "Beginner",
      daysPerWeek: plan.daysPerWeek || 4,
      days: sanitizeDays(plan.days || []),
    });
    setShowModal(true);
    setErrorMessage("");
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlanId(null);
    setDraft(createPlanDraft());
  };

  const handleDraftChange = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDaysPerWeekChange = (value) => {
    const nextDays = Number(value);

    setDraft((prev) => {
      let updatedDays = [...prev.days];

      if (nextDays > updatedDays.length) {
        const usedDays = updatedDays.map((day) => day.day);

        for (const dayName of weekDays) {
          if (updatedDays.length >= nextDays) break;
          if (!usedDays.includes(dayName)) {
            updatedDays.push(createDayBlock(dayName));
          }
        }
      } else if (nextDays < updatedDays.length) {
        updatedDays = updatedDays.slice(0, nextDays);
      }

      return {
        ...prev,
        daysPerWeek: nextDays,
        days: updatedDays,
      };
    });
  };

  const handleDayChange = (dayId, field, value) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id === dayId ? { ...day, [field]: value } : day
      ),
    }));
  };

  const addExerciseRow = (dayId) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: [...day.exercises, createExerciseRow()],
            }
          : day
      ),
    }));
  };

  const removeExerciseRow = (dayId, exerciseId) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.id !== dayId) return day;
        if (day.exercises.length === 1) return day;

        return {
          ...day,
          exercises: day.exercises.filter(
            (exercise) => exercise.id !== exerciseId
          ),
        };
      }),
    }));
  };

  const handleExerciseChange = (dayId, exerciseId, field, value) => {
    setDraft((prev) => ({
      ...prev,
      days: prev.days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((exercise) =>
                exercise.id === exerciseId
                  ? { ...exercise, [field]: value }
                  : exercise
              ),
            }
          : day
      ),
    }));
  };

  const validateDraft = () => {
    if (!draft.planName.trim()) {
      return "Please enter a plan name.";
    }

    if (!draft.days.length) {
      return "Please add at least one workout day.";
    }

    for (const day of draft.days) {
      if (!day.day.trim()) {
        return "Each workout block needs a day name.";
      }

      if (!day.focus.trim()) {
        return `Please enter focus for ${day.day}.`;
      }

      const validExercises = day.exercises.filter(
        (exercise) =>
          exercise.name.trim() &&
          String(exercise.sets).trim() &&
          String(exercise.reps).trim()
      );

      if (!validExercises.length) {
        return `Please complete at least one exercise for ${day.day}.`;
      }
    }

    return "";
  };

  const buildPlanPayload = () => {
    return {
      planName: draft.planName.trim(),
      goal: draft.goal,
      duration: draft.duration,
      difficulty: draft.difficulty,
      daysPerWeek: draft.daysPerWeek,
      isActive: false,
      days: draft.days.map((day) => ({
        day: day.day,
        focus: day.focus.trim(),
        exercises: day.exercises
          .filter(
            (exercise) =>
              exercise.name.trim() &&
              String(exercise.sets).trim() &&
              String(exercise.reps).trim()
          )
          .map((exercise) => ({
            name: exercise.name.trim(),
            sets: Number(exercise.sets),
            reps: Number(exercise.reps),
          })),
      })),
    };
  };

  const handleSavePlan = async () => {
    const validationError = validateDraft();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const payload = buildPlanPayload();

      if (editingPlanId) {
        const existingPlan = plans.find((plan) => plan.id === editingPlanId);

        await updateDoc(doc(db, "plans", editingPlanId), {
          ...payload,
          isActive: existingPlan?.isActive || false,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(plansRef, {
          ...payload,
          isActive: plans.length === 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      await fetchPlans();
      closeModal();
    } catch (error) {
      console.error("Error saving plan:", error);
      setErrorMessage("Failed to save plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this plan?"
    );

    if (!confirmed) return;

    setErrorMessage("");

    try {
      const deletingPlan = plans.find((plan) => plan.id === planId);

      await deleteDoc(doc(db, "plans", planId));

      const remainingPlans = plans.filter((plan) => plan.id !== planId);

      if (deletingPlan?.isActive && remainingPlans.length > 0) {
        const latestRemainingPlan = remainingPlans[0];

        await updateDoc(doc(db, "plans", latestRemainingPlan.id), {
          isActive: true,
          updatedAt: serverTimestamp(),
        });
      }

      await fetchPlans();
    } catch (error) {
      console.error("Error deleting plan:", error);
      setErrorMessage("Failed to delete plan.");
    }
  };

  const handleSetActive = async (targetPlanId) => {
    setErrorMessage("");

    try {
      const updates = plans.map(async (plan) => {
        return updateDoc(doc(db, "plans", plan.id), {
          isActive: plan.id === targetPlanId,
          updatedAt: serverTimestamp(),
        });
      });

      await Promise.all(updates);
      await fetchPlans();
    } catch (error) {
      console.error("Error setting active plan:", error);
      setErrorMessage("Failed to set active plan.");
    }
  };

  return (
    <>
      <section className="page-section plans-manager-page">
        <div className="plans-bg-orb plans-orb-1" />
        <div className="plans-bg-orb plans-orb-2" />
        <div className="plans-bg-grid" />

        <div className="plans-manager-shell">
          <div className="plans-manager-hero">
            <div className="plans-hero-copy">
              <span className="plans-eyebrow">Plan Manager</span>
              <h2>Build and Manage Your Workout Plans</h2>
              <p>
                Create day-wise plans with focus, exercises, sets, and reps.
                Save multiple plans and choose one active plan for your app.
              </p>
            </div>

            <div className="plans-hero-actions">
              <button
                type="button"
                className="plans-primary-btn"
                onClick={openCreateModal}
              >
                + Create New Plan
              </button>
            </div>
          </div>

          {errorMessage && <div className="plans-feedback error">{errorMessage}</div>}

          {activePlan && (
            <div className="active-plan-section">
              <div className="section-header">
                <div>
                  <span className="section-kicker">Current Active</span>
                  <h3>Active Plan</h3>
                </div>
              </div>

              <div className="plan-card active-card">
                <div className="plan-card-top">
                  <div>
                    <div className="plan-badge-row">
                      <span className="status-pill active-pill">Active Plan</span>
                      <span className="difficulty-pill">
                        {activePlan.difficulty}
                      </span>
                    </div>
                    <h4>{activePlan.planName}</h4>
                    <p>
                      {activePlan.goal} • {activePlan.duration} •{" "}
                      {activePlan.daysPerWeek} days / week
                    </p>
                  </div>

                  <div className="plan-card-actions">
                    <button
                      type="button"
                      className="plans-secondary-btn"
                      onClick={() => openEditModal(activePlan)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="plans-secondary-btn danger-btn"
                      onClick={() => handleDeletePlan(activePlan.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="plan-days-list">
                  {activePlan.days?.map((dayBlock, index) => (
                    <div key={`${dayBlock.day}-${index}`} className="plan-day-card">
                      <div className="plan-day-header">
                        <div>
                          <h5>{dayBlock.day}</h5>
                          <span>{dayBlock.focus}</span>
                        </div>
                      </div>

                      <div className="plan-exercise-list">
                        {dayBlock.exercises?.map((exercise, exerciseIndex) => (
                          <div
                            key={`${exercise.name}-${exerciseIndex}`}
                            className="plan-exercise-row"
                          >
                            <div className="exercise-name">{exercise.name}</div>
                            <div className="exercise-meta">
                              {exercise.sets} sets × {exercise.reps} reps
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="saved-plans-section">
            <div className="section-header">
              <div>
                <span className="section-kicker">Stored Plans</span>
                <h3>Saved Plans</h3>
              </div>

              <div className="plans-count-pill">
                {loading ? "Loading..." : `${plans.length} plan${plans.length !== 1 ? "s" : ""}`}
              </div>
            </div>

            {loading ? (
              <div className="empty-state-card">
                <p>Loading saved plans...</p>
              </div>
            ) : sortedPlans.length === 0 ? (
              <div className="empty-state-card">
                <h4>No plans created yet</h4>
                <p>Create your first day-wise workout plan to get started.</p>
                <button
                  type="button"
                  className="plans-primary-btn"
                  onClick={openCreateModal}
                >
                  Create First Plan
                </button>
              </div>
            ) : (
              <div className="plans-grid">
                {sortedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`plan-card ${plan.isActive ? "active-card subtle-active" : ""}`}
                  >
                    <div className="plan-card-top">
                      <div>
                        <div className="plan-badge-row">
                          {plan.isActive && (
                            <span className="status-pill active-pill">Active</span>
                          )}
                          <span className="difficulty-pill">{plan.difficulty}</span>
                        </div>
                        <h4>{plan.planName}</h4>
                        <p>
                          {plan.goal} • {plan.duration} • {plan.daysPerWeek} days /
                          week
                        </p>
                      </div>

                      <div className="plan-card-actions">
                        <button
                          type="button"
                          className="plans-secondary-btn"
                          onClick={() => openEditModal(plan)}
                        >
                          Edit
                        </button>

                        {!plan.isActive && (
                          <button
                            type="button"
                            className="plans-secondary-btn"
                            onClick={() => handleSetActive(plan.id)}
                          >
                            Set Active
                          </button>
                        )}

                        <button
                          type="button"
                          className="plans-secondary-btn danger-btn"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="plan-days-list compact">
                      {plan.days?.map((dayBlock, index) => (
                        <div key={`${dayBlock.day}-${index}`} className="plan-day-card">
                          <div className="plan-day-header">
                            <div>
                              <h5>{dayBlock.day}</h5>
                              <span>{dayBlock.focus}</span>
                            </div>
                          </div>

                          <div className="plan-exercise-list">
                            {dayBlock.exercises?.map((exercise, exerciseIndex) => (
                              <div
                                key={`${exercise.name}-${exerciseIndex}`}
                                className="plan-exercise-row"
                              >
                                <div className="exercise-name">{exercise.name}</div>
                                <div className="exercise-meta">
                                  {exercise.sets} × {exercise.reps}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {showModal && (
        <div className="plan-modal-overlay" onClick={closeModal}>
          <div
            className="plan-modal-sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="plan-modal-header">
              <div>
                <span className="plans-eyebrow">
                  {editingPlanId ? "Edit Plan" : "Create Plan"}
                </span>
                <h3>{editingPlanId ? "Update Workout Plan" : "Create New Workout Plan"}</h3>
                <p>
                  Build your plan day by day. Add focus, exercises, sets, and reps.
                </p>
              </div>

              <button
                type="button"
                className="close-modal-btn"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <div className="plan-form-grid">
              <label className="form-field">
                <span>Plan Name</span>
                <input
                  type="text"
                  placeholder="Example: Push Pull Legs"
                  value={draft.planName}
                  onChange={(event) =>
                    handleDraftChange("planName", event.target.value)
                  }
                />
              </label>

              <label className="form-field">
                <span>Goal</span>
                <select
                  value={draft.goal}
                  onChange={(event) =>
                    handleDraftChange("goal", event.target.value)
                  }
                >
                  {goalOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Duration</span>
                <select
                  value={draft.duration}
                  onChange={(event) =>
                    handleDraftChange("duration", event.target.value)
                  }
                >
                  {durationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Difficulty</span>
                <select
                  value={draft.difficulty}
                  onChange={(event) =>
                    handleDraftChange("difficulty", event.target.value)
                  }
                >
                  {difficultyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Workout Days Per Week</span>
                <select
                  value={draft.daysPerWeek}
                  onChange={(event) => handleDaysPerWeekChange(event.target.value)}
                >
                  {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                    <option key={count} value={count}>
                      {count} day{count !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="day-builder-list">
              {draft.days.map((dayBlock) => (
                <div key={dayBlock.id} className="day-builder-card">
                  <div className="day-builder-header">
                    <div>
                      <span className="section-kicker">Workout Day</span>
                      <h4>{dayBlock.day}</h4>
                    </div>
                  </div>

                  <div className="day-builder-grid">
                    <label className="form-field">
                      <span>Day</span>
                      <select
                        value={dayBlock.day}
                        onChange={(event) =>
                          handleDayChange(dayBlock.id, "day", event.target.value)
                        }
                      >
                        {weekDays.map((dayName) => (
                          <option key={dayName} value={dayName}>
                            {dayName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span>Focus</span>
                      <input
                        type="text"
                        placeholder="Example: Chest"
                        value={dayBlock.focus}
                        onChange={(event) =>
                          handleDayChange(dayBlock.id, "focus", event.target.value)
                        }
                      />
                    </label>
                  </div>

                  <div className="exercise-builder-list">
                    {dayBlock.exercises.map((exercise, index) => (
                      <div key={exercise.id} className="exercise-builder-row">
                        <div className="exercise-row-top">
                          <span className="exercise-counter">
                            Exercise {index + 1}
                          </span>

                          <button
                            type="button"
                            className="remove-exercise-btn"
                            onClick={() =>
                              removeExerciseRow(dayBlock.id, exercise.id)
                            }
                          >
                            Remove
                          </button>
                        </div>

                        <div className="exercise-builder-grid">
                          <label className="form-field">
                            <span>Exercise Name</span>
                            <input
                              type="text"
                              placeholder="Example: Push-ups"
                              value={exercise.name}
                              onChange={(event) =>
                                handleExerciseChange(
                                  dayBlock.id,
                                  exercise.id,
                                  "name",
                                  event.target.value
                                )
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span>Sets</span>
                            <input
                              type="number"
                              min="1"
                              placeholder="3"
                              value={exercise.sets}
                              onChange={(event) =>
                                handleExerciseChange(
                                  dayBlock.id,
                                  exercise.id,
                                  "sets",
                                  event.target.value
                                )
                              }
                            />
                          </label>

                          <label className="form-field">
                            <span>Reps</span>
                            <input
                              type="number"
                              min="1"
                              placeholder="12"
                              value={exercise.reps}
                              onChange={(event) =>
                                handleExerciseChange(
                                  dayBlock.id,
                                  exercise.id,
                                  "reps",
                                  event.target.value
                                )
                              }
                            />
                          </label>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="plans-secondary-btn add-exercise-btn"
                      onClick={() => addExerciseRow(dayBlock.id)}
                    >
                      + Add Exercise
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="plan-modal-actions">
              <button
                type="button"
                className="plans-secondary-btn"
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="plans-primary-btn"
                onClick={handleSavePlan}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingPlanId
                  ? "Update Plan"
                  : "Save Plan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Plans;