import { useMemo, useState } from "react";
import { exerciseList } from "../data/exercises";

const Workouts = () => {
  const [selectedExerciseName, setSelectedExerciseName] = useState("Pushups");
  const [selectedVariation, setSelectedVariation] = useState("Standard");
  const [sets, setSets] = useState([
    { id: 1, reps: "" },
    { id: 2, reps: "" },
    { id: 3, reps: "" },
  ]);
  const [savedWorkouts, setSavedWorkouts] = useState([]);

  const selectedExercise = useMemo(() => {
    return (
      exerciseList.find((exercise) => exercise.name === selectedExerciseName) ||
      exerciseList[0]
    );
  }, [selectedExerciseName]);

  const totalSets = sets.length;
  const filledSetCount = sets.filter((set) => set.reps !== "").length;

  const handleExerciseChange = (event) => {
    const exerciseName = event.target.value;
    const exercise = exerciseList.find((item) => item.name === exerciseName);

    setSelectedExerciseName(exerciseName);
    setSelectedVariation(exercise?.variations?.[0] || "");
    setSets([
      { id: 1, reps: "" },
      { id: 2, reps: "" },
      { id: 3, reps: "" },
    ]);
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
    const validSets = sets.filter((set) => set.reps !== "");

    if (validSets.length === 0) {
      alert("Please enter reps for at least one set.");
      return;
    }

    const workoutEntry = {
      id: Date.now(),
      exercise: selectedExercise.name,
      variation: selectedVariation,
      type: selectedExercise.type,
      muscles: selectedExercise.muscles,
      sets: validSets,
    };

    setSavedWorkouts((prev) => [workoutEntry, ...prev]);

    setSets([
      { id: 1, reps: "" },
      { id: 2, reps: "" },
      { id: 3, reps: "" },
    ]);
  };

  return (
    <section className="page-section">
      <div className="hero-card">
        <span className="hero-tag">Workout Engine</span>
        <h2>Log Your Training</h2>
        <p>
          Select a workout, review the muscle groups automatically, add sets one
          by one, and save your session.
        </p>
      </div>

      <div className="workout-summary-grid">
        <div className="info-card">
          <h3>Selected Workout</h3>
          <p>{selectedExercise.name}</p>
        </div>

        <div className="info-card">
          <h3>Workout Type</h3>
          <p>{selectedExercise.type}</p>
        </div>

        <div className="info-card">
          <h3>Total Sets</h3>
          <p>{totalSets}</p>
        </div>

        <div className="info-card">
          <h3>Filled Sets</h3>
          <p>{filledSetCount}</p>
        </div>
      </div>

      <div className="workout-form-card">
        <div className="form-group">
          <label htmlFor="exercise">Workout</label>
          <select
            id="exercise"
            value={selectedExerciseName}
            onChange={handleExerciseChange}
          >
            {exerciseList.map((exercise) => (
              <option key={exercise.name} value={exercise.name}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="variation">Variation</label>
          <select
            id="variation"
            value={selectedVariation}
            onChange={handleVariationChange}
          >
            {selectedExercise.variations.map((variation) => (
              <option key={variation} value={variation}>
                {variation}
              </option>
            ))}
          </select>
        </div>

        <div className="muscle-preview-card">
          <h3>Muscle Groups</h3>
          <div className="muscle-chip-wrap">
            {selectedExercise.muscles.map((muscle) => (
              <span key={muscle} className="muscle-chip">
                {muscle}
              </span>
            ))}
          </div>
        </div>

        <div className="sets-card">
          <div className="sets-header">
            <h3>Sets & Reps</h3>
            <button type="button" className="secondary-btn" onClick={handleAddSet}>
              + Add Set
            </button>
          </div>

          <div className="sets-list">
            {sets.map((set, index) => (
              <div key={set.id} className="set-row">
                <div className="set-label">Set {index + 1}</div>

                <input
                  type="number"
                  min="1"
                  placeholder="Reps"
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
        </div>

        <button type="button" className="primary-btn" onClick={handleSaveWorkout}>
          Save Workout
        </button>
      </div>

      <div className="info-card">
        <h3>Today’s Logged Workouts</h3>

        {savedWorkouts.length === 0 ? (
          <p>No workouts saved yet.</p>
        ) : (
          <div className="saved-workouts-list">
            {savedWorkouts.map((workout) => (
              <div key={workout.id} className="saved-workout-item">
                <div className="saved-workout-top">
                  <h4>
                    {workout.exercise} <span>• {workout.variation}</span>
                  </h4>
                  <p>{workout.type}</p>
                </div>

                <div className="muscle-chip-wrap">
                  {workout.muscles.map((muscle) => (
                    <span key={muscle} className="muscle-chip">
                      {muscle}
                    </span>
                  ))}
                </div>

                <div className="saved-set-wrap">
                  {workout.sets.map((set) => (
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