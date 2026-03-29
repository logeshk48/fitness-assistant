import { useMemo, useState } from "react";
import { workoutMuscleMap } from "../data/bodyMapData";
import "./BodyMap.css";
const BodyMap = () => {
  const [selectedWorkout, setSelectedWorkout] = useState("Push-ups");

  const activeMuscles = useMemo(() => {
    const workout = workoutMuscleMap[selectedWorkout];
    if (!workout) return [];
    return [...workout.primary, ...workout.secondary];
  }, [selectedWorkout]);

  const isActive = (muscle) => activeMuscles.includes(muscle);

  const getMuscleStyle = (muscle) => ({
    fill: isActive(muscle) ? "#ff6b6b" : "#23232a",
    stroke: isActive(muscle) ? "#ffb3b3" : "#3a3a44",
    strokeWidth: 2,
    transition: "all 0.3s ease",
  });

  return (
    <div className="bodymap-page">
      <div className="bodymap-card">
        <h2 className="bodymap-title">Body Map</h2>
        <p className="bodymap-subtitle">
          Select a workout to see the muscles involved
        </p>

        <select
          className="bodymap-select"
          value={selectedWorkout}
          onChange={(e) => setSelectedWorkout(e.target.value)}
        >
          {Object.keys(workoutMuscleMap).map((workout) => (
            <option key={workout} value={workout}>
              {workout}
            </option>
          ))}
        </select>

        <div className="bodymap-svg-wrap">
          <svg
            viewBox="0 0 220 500"
            className="bodymap-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="110" cy="45" r="28" fill="#34343d" stroke="#555" strokeWidth="2" />
            <rect x="98" y="72" width="24" height="18" rx="8" fill="#34343d" />

            <ellipse cx="70" cy="105" rx="24" ry="18" style={getMuscleStyle("shoulders")} />
            <ellipse cx="150" cy="105" rx="24" ry="18" style={getMuscleStyle("shoulders")} />

            <ellipse cx="85" cy="145" rx="28" ry="32" style={getMuscleStyle("chest")} />
            <ellipse cx="135" cy="145" rx="28" ry="32" style={getMuscleStyle("chest")} />

            <rect x="82" y="180" width="56" height="70" rx="18" style={getMuscleStyle("abs")} />

            <rect x="42" y="125" width="20" height="70" rx="10" style={getMuscleStyle("triceps")} />
            <rect x="158" y="125" width="20" height="70" rx="10" style={getMuscleStyle("triceps")} />

            <rect x="38" y="195" width="16" height="70" rx="10" fill="#2b2b33" stroke="#3a3a44" strokeWidth="2" />
            <rect x="166" y="195" width="16" height="70" rx="10" fill="#2b2b33" stroke="#3a3a44" strokeWidth="2" />

            <path
              d="M72 170 Q60 220 80 250 L92 230 Q84 205 92 175 Z"
              style={getMuscleStyle("lats")}
            />
            <path
              d="M148 170 Q160 220 140 250 L128 230 Q136 205 128 175 Z"
              style={getMuscleStyle("lats")}
            />

            <circle cx="52" cy="145" r="12" style={getMuscleStyle("biceps")} />
            <circle cx="168" cy="145" r="12" style={getMuscleStyle("biceps")} />

            <rect x="82" y="255" width="22" height="95" rx="12" style={getMuscleStyle("quads")} />
            <rect x="116" y="255" width="22" height="95" rx="12" style={getMuscleStyle("quads")} />

            <rect x="84" y="355" width="18" height="85" rx="10" style={getMuscleStyle("calves")} />
            <rect x="118" y="355" width="18" height="85" rx="10" style={getMuscleStyle("calves")} />

            <ellipse cx="92" cy="455" rx="16" ry="10" fill="#2b2b33" />
            <ellipse cx="128" cy="455" rx="16" ry="10" fill="#2b2b33" />
          </svg>
        </div>

        <div className="bodymap-tags">
          {activeMuscles.map((muscle) => (
            <span key={muscle} className="bodymap-tag">
              {muscle}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BodyMap;