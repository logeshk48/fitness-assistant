import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import BodyMap from "./pages/BodyMap";
import Progress from "./pages/Progress";
import Plans from "./pages/Plans";
import Profile from "./pages/Profile";
import Stats from "./pages/Stats";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="body-map" element={<BodyMap />} />
          <Route path="progress" element={<Progress />} />
          <Route path="plans" element={<Plans />} />
          <Route path="profile" element={<Profile />} />
          <Route path="stats" element={<Stats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;