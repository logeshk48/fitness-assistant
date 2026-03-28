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

  const handleMuscleChange = (event) => {
    setSelectedMuscle(event.target.value);
  };

  const handleEquipmentChange = (event) => {
    setSelectedEquipment(event.target.value);
  };

  const handleWorkoutChange = (event) => {
    const workoutName = event.target.value;
    const workout = filteredExercises.find((item) => item.name === workoutName);

    setSelectedWorkoutName(workoutName);
    setSelectedVariation(workout?.variations?.[0] || "");
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
      <div className="hero-card">
        <span className="hero-tag">Workout Engine</span>
        <h2>Build Your Workout</h2>
        <p>
          Choose a muscle group, choose whether it is with or without weight,
          select the workout, add sets and reps, then save it.
        </p>
      </div>

      <div className="workout-summary-grid">
        <div className="info-card">
          <h3>Muscle Group</h3>
          <p>{selectedMuscle}</p>
        </div>

        <div className="info-card">
          <h3>Equipment</h3>
          <p>{selectedEquipment}</p>
        </div>

        <div className="info-card">
          <h3>Workout</h3>
          <p>{selectedWorkout ? selectedWorkout.name : "No workout found"}</p>
        </div>

        <div className="info-card">
          <h3>Filled Sets</h3>
          <p>
            {filledSets} / {totalSets}
          </p>
        </div>
      </div>

      <div className="workout-form-card">
        <div className="form-group">
          <label htmlFor="muscle-group">Muscle Group</label>
          <select
            id="muscle-group"
            value={selectedMuscle}
            onChange={handleMuscleChange}
          >
            {muscleGroups.map((muscle) => (
              <option key={muscle} value={muscle}>
                {muscle}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="equipment-type">Equipment Type</label>
          <select
            id="equipment-type"
            value={selectedEquipment}
            onChange={handleEquipmentChange}
          >
            {equipmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="workout-select">Workout</label>
          <select
            id="workout-select"
            value={selectedWorkoutName}
            onChange={handleWorkoutChange}
            disabled={!filteredExercises.length}
          >
            {filteredExercises.length ? (
              filteredExercises.map((exercise) => (
                <option key={exercise.name} value={exercise.name}>
                  {exercise.name}
                </option>
              ))
            ) : (
              <option value="">No workouts available</option>
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="variation-select">Variation</label>
          <select
            id="variation-select"
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

        <div className="workout-details-grid">
          <div className="muscle-preview-card">
            <h3>Difficulty</h3>
            <div className="muscle-chip-wrap">
              <span className="muscle-chip strong">
                {selectedWorkout?.difficulty || "Not available"}
              </span>
            </div>
          </div>

          <div className="muscle-preview-card">
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

        <div className="sets-card">
          <div className="sets-header">
            <h3>Sets & Reps</h3>
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
              <div key={set.id} className="set-row">
                <div className="set-label">Set {index + 1}</div>

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
        </div>

        <button type="button" className="primary-btn" onClick={handleSaveWorkout}>
          Save Workout
        </button>
      </div>

      <div className="info-card">
        <h3>Saved Workouts</h3>

        {savedWorkouts.length === 0 ? (
          <p>No workouts saved yet.</p>
        ) : (
          <div className="saved-workouts-list">
            {savedWorkouts.map((item) => (
              <div key={item.id} className="saved-workout-item">
                <div className="saved-workout-top">
                  <h4>
                    {item.muscleGroup} • {item.workout}
                  </h4>
                  <p>{item.variation}</p>
                </div>

                <div className="saved-set-wrap">
                  <span className="saved-set-pill">
                    {item.equipmentType}
                  </span>
                  <span className="saved-set-pill">
                    {item.difficulty}
                  </span>

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