import { useEffect, useMemo, useState } from "react";
import {
  exercises,
  muscleGroups,
  equipmentTypes,
} from "../data/exercises";

const createDefaultSets = () => [
  { id: 1, reps: "" },
  { id: 2, reps: "" },
  { id: 3, reps: "" },
];

const Workouts = () => {
  const [selectedMuscle, setSelectedMuscle] = useState("Chest");
  const [selectedEquipment, setSelectedEquipment] = useState("Without Weight");
  const [selectedWorkoutName, setSelectedWorkoutName] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("");
  const [sets, setSets] = useState(createDefaultSets());
  const [savedWorkouts, setSavedWorkouts] = useState([]);

  const filteredExercises = useMemo(() => {
    return exercises.filter(
      (exercise) =>
        exercise.muscleGroup === selectedMuscle &&
        exercise.equipmentType === selectedEquipment
    );
  }, [selectedMuscle, selectedEquipment]);

  useEffect(() => {
    if (filteredExercises.length === 0) {
      setSelectedWorkoutName("");
      setSelectedVariation("");
      setSets(createDefaultSets());
      return;
    }

    const firstWorkout = filteredExercises[0];
    setSelectedWorkoutName(firstWorkout.name);
    setSelectedVariation(firstWorkout.variations?.[0] || "");
    setSets(createDefaultSets());
  }, [filteredExercises]);

  const selectedWorkout = useMemo(() => {
    if (!filteredExercises.length) return null;

    return (
      filteredExercises.find(
        (exercise) => exercise.name === selectedWorkoutName
      ) || filteredExercises[0]
    );
  }, [filteredExercises, selectedWorkoutName]);

  const handleWorkoutSelect = (workout) => {
    setSelectedWorkoutName(workout.name);
    setSelectedVariation(workout.variations?.[0] || "");
    setSets(createDefaultSets());
  };

  const handleVariationChange = (event) => {
    setSelectedVariation(event.target.value);
  };

  const handleSetRepsChange = (id, value) => {
    setSets((prevSets) =>
      prevSets.map((set) => (set.id === id ? { ...set, reps: value } : set))
    );
  };

  const handleAddSet = () => {
    setSets((prevSets) => [
      ...prevSets,
      { id: prevSets.length + 1, reps: "" },
    ]);
  };

  const handleRemoveSet = (id) => {
    if (sets.length === 1) return;

    const updatedSets = sets
      .filter((set) => set.id !== id)
      .map((set, index) => ({
        ...set,
        id: index + 1,
      }));

    setSets(updatedSets);
  };

  const handleSaveWorkout = () => {
    if (!selectedWorkout) {
      alert("No workout available for this filter.");
      return;
    }

    const validSets = sets.filter((set) => set.reps !== "");

    if (validSets.length === 0) {
      alert("Please enter reps for at least one set.");
      return;
    }

    const workoutEntry = {
      id: Date.now(),
      muscleGroup: selectedWorkout.muscleGroup,
      equipmentType: selectedWorkout.equipmentType,
      workout: selectedWorkout.name,
      difficulty: selectedWorkout.difficulty,
      secondaryMuscles: selectedWorkout.secondaryMuscles || [],
      variation: selectedVariation,
      sets: validSets,
    };

    setSavedWorkouts((prev) => [workoutEntry, ...prev]);
    setSets(createDefaultSets());
  };

  const totalSets = sets.length;
  const filledSets = sets.filter((set) => set.reps !== "").length;

  return (
    <section className="page-section">
      <div className="premium-hero">
        <div>
          <span className="hero-tag">Workout Engine</span>
          <h2>Build Your Workout</h2>
          <p>
            Choose muscle group, filter by equipment, pick a workout, add sets,
            and save it to power your body map, dashboard, and progress.
          </p>
        </div>
      </div>

      <div className="premium-stats-grid">
        <div className="premium-stat-card">
          <span>Muscle</span>
          <strong>{selectedMuscle}</strong>
        </div>
        <div className="premium-stat-card">
          <span>Equipment</span>
          <strong>{selectedEquipment}</strong>
        </div>
        <div className="premium-stat-card">
          <span>Workout</span>
          <strong>{selectedWorkout ? selectedWorkout.name : "None"}</strong>
        </div>
        <div className="premium-stat-card">
          <span>Sets</span>
          <strong>
            {filledSets}/{totalSets}
          </strong>
        </div>
      </div>

      <div className="premium-panel">
        <div className="panel-header">
          <h3>1. Select Muscle Group</h3>
          <p>Pick the body part you want to train.</p>
        </div>

        <div className="chip-scroll">
          {muscleGroups.map((muscle) => (
            <button
              key={muscle}
              type="button"
              className={
                selectedMuscle === muscle
                  ? "select-chip active"
                  : "select-chip"
              }
              onClick={() => setSelectedMuscle(muscle)}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      <div className="premium-panel">
        <div className="panel-header">
          <h3>2. Select Equipment Type</h3>
          <p>Choose whether you want weighted or bodyweight workouts.</p>
        </div>

        <div className="equipment-toggle">
          {equipmentTypes.map((type) => (
            <button
              key={type}
              type="button"
              className={
                selectedEquipment === type
                  ? "equipment-pill active"
                  : "equipment-pill"
              }
              onClick={() => setSelectedEquipment(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="premium-panel">
        <div className="panel-header">
          <h3>3. Choose Workout</h3>
          <p>Only workouts matching your selected filters are shown here.</p>
        </div>

        {filteredExercises.length === 0 ? (
          <div className="empty-state-card">
            No workouts available for this combination.
          </div>
        ) : (
          <div className="workout-card-grid">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise.name}
                type="button"
                className={
                  selectedWorkoutName === exercise.name
                    ? "workout-select-card active"
                    : "workout-select-card"
                }
                onClick={() => handleWorkoutSelect(exercise)}
              >
                <div className="workout-card-top">
                  <h4>{exercise.name}</h4>
                  <span className="difficulty-badge">{exercise.difficulty}</span>
                </div>

                <div className="muscle-chip-wrap">
                  <span className="muscle-chip strong">
                    {exercise.muscleGroup}
                  </span>

                  {exercise.secondaryMuscles.slice(0, 2).map((muscle) => (
                    <span key={muscle} className="muscle-chip">
                      {muscle}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="premium-panel">
        <div className="panel-header">
          <h3>4. Workout Details</h3>
          <p>Adjust variation and review difficulty and secondary muscles.</p>
        </div>

        <div className="workout-details-grid">
          <div className="muscle-preview-card">
            <h3>Variation</h3>
            <div className="form-group">
              <select
                value={selectedVariation}
                onChange={handleVariationChange}
                disabled={!selectedWorkout}
              >
                {selectedWorkout?.variations?.length ? (
                  selectedWorkout.variations.map((variation) => (
                    <option key={variation} value={variation}>
                      {variation}
                    </option>
                  ))
                ) : (
                  <option value="">No variation</option>
                )}
              </select>
            </div>
          </div>

          <div className="muscle-preview-card">
            <h3>Difficulty</h3>
            <div className="muscle-chip-wrap">
              <span className="muscle-chip strong">
                {selectedWorkout?.difficulty || "Not available"}
              </span>
            </div>
          </div>

          <div className="muscle-preview-card full-width">
            <h3>Secondary Muscles</h3>
            <div className="muscle-chip-wrap">
              {selectedWorkout?.secondaryMuscles?.length ? (
                selectedWorkout.secondaryMuscles.map((muscle) => (
                  <span key={muscle} className="muscle-chip">
                    {muscle}
                  </span>
                ))
              ) : (
                <span className="empty-text">No secondary muscles</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="premium-panel">
        <div className="sets-header premium-sets-header">
          <div>
            <h3>5. Sets & Reps</h3>
            <p>Add each set one by one.</p>
          </div>

          <button
            type="button"
            className="secondary-btn"
            onClick={handleAddSet}
          >
            + Add Set
          </button>
        </div>

        <div className="sets-list">
          {sets.map((set, index) => (
            <div key={set.id} className="set-row premium-set-row">
              <div className="set-badge">Set {index + 1}</div>

              <input
                type="number"
                min="1"
                placeholder="Enter reps"
                value={set.reps}
                onChange={(event) =>
                  handleSetRepsChange(set.id, event.target.value)
                }
              />

              <button
                type="button"
                className="remove-set-btn"
                onClick={() => handleRemoveSet(set.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="primary-btn premium-save-btn"
          onClick={handleSaveWorkout}
        >
          Save Workout
        </button>
      </div>

      <div className="premium-panel">
        <div className="panel-header">
          <h3>Saved Workouts</h3>
          <p>Your recent logged workout entries appear here.</p>
        </div>

        {savedWorkouts.length === 0 ? (
          <div className="empty-state-card">No workouts saved yet.</div>
        ) : (
          <div className="saved-workouts-list">
            {savedWorkouts.map((item) => (
              <div key={item.id} className="saved-workout-item premium-saved-card">
                <div className="saved-workout-top">
                  <div>
                    <h4>{item.workout}</h4>
                    <p>
                      {item.muscleGroup} • {item.equipmentType}
                    </p>
                  </div>

                  <span className="difficulty-badge">{item.difficulty}</span>
                </div>

                <div className="saved-set-wrap">
                  <span className="saved-set-pill">{item.variation}</span>

                  {item.secondaryMuscles.map((muscle) => (
                    <span key={muscle} className="saved-set-pill subtle">
                      {muscle}
                    </span>
                  ))}
                </div>

                <div className="saved-set-wrap">
                  {item.sets.map((set) => (
                    <span key={set.id} className="saved-set-pill">
                      Set {set.id}: {set.reps} reps
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Workouts;