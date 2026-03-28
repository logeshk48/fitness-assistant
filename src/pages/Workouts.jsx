import { useState } from "react";

const workoutTypes = [
  "Strength",
  "Cardio",
  "Mobility",
  "HIIT",
  "Endurance",
];

const initialWorkout = {
  workoutType: "Strength",
  exerciseName: "",
  sets: "",
  repsOrCount: "",
  notes: "",
};

const Workouts = () => {
  const [formData, setFormData] = useState(initialWorkout);
  const [workoutEntries, setWorkoutEntries] = useState([
    {
      id: 1,
      workoutType: "Strength",
      exerciseName: "Push Ups",
      sets: 4,
      repsOrCount: 15,
      notes: "Controlled tempo",
    },
  ]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedExercise = formData.exerciseName.trim();

    if (!trimmedExercise || !formData.sets || !formData.repsOrCount) {
      return;
    }

    setWorkoutEntries((currentEntries) => [
      {
        id: Date.now(),
        workoutType: formData.workoutType,
        exerciseName: trimmedExercise,
        sets: formData.sets,
        repsOrCount: formData.repsOrCount,
        notes: formData.notes.trim(),
      },
      ...currentEntries,
    ]);

    setFormData(initialWorkout);
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <span className="hero-tag">Workout Logger</span>
        <h2>Log Your Training</h2>
        <p>Add workout type, exercise name, set count, reps/count, and notes.</p>
      </div>

      <div className="workout-layout">
        <form className="info-card workout-form-card" onSubmit={handleSubmit}>
          <div className="workout-card-heading">
            <h3>Workout Form</h3>
            <p>Track each exercise with its type, sets, and rep count.</p>
          </div>

          <div className="workout-form-grid">
            <label className="form-field">
              <span>Workout Type</span>
              <select
                name="workoutType"
                value={formData.workoutType}
                onChange={handleChange}
              >
                {workoutTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Exercise Name</span>
              <input
                type="text"
                name="exerciseName"
                value={formData.exerciseName}
                onChange={handleChange}
                placeholder="Bench Press"
              />
            </label>

            <label className="form-field">
              <span>Set Count</span>
              <input
                type="number"
                min="1"
                name="sets"
                value={formData.sets}
                onChange={handleChange}
                placeholder="4"
              />
            </label>

            <label className="form-field">
              <span>Rep Count / Count</span>
              <input
                type="number"
                min="1"
                name="repsOrCount"
                value={formData.repsOrCount}
                onChange={handleChange}
                placeholder="12"
              />
            </label>

            <label className="form-field form-field-full">
              <span>Notes</span>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Add tempo, weight, or rest details"
              />
            </label>
          </div>

          <button className="workout-submit-button" type="submit">
            Add Workout Entry
          </button>
        </form>

        <div className="info-card workout-log-card">
          <div className="workout-card-heading">
            <h3>Recent Entries</h3>
            <p>{workoutEntries.length} workout entries saved in this session.</p>
          </div>

          <div className="workout-entry-list">
            {workoutEntries.map((entry) => (
              <article className="workout-entry" key={entry.id}>
                <div className="workout-entry-top">
                  <span className="workout-type-pill">{entry.workoutType}</span>
                  <strong>{entry.exerciseName}</strong>
                </div>

                <div className="workout-entry-metrics">
                  <span>{entry.sets} sets</span>
                  <span>{entry.repsOrCount} reps/count</span>
                </div>

                {entry.notes ? <p>{entry.notes}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Workouts;
