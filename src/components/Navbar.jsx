import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/" },
  { label: "Workouts", path: "/workouts" },
  { label: "Body Map", path: "/body-map" },
  { label: "Progress", path: "/progress" },
  { label: "Plans", path: "/plans" },
  { label: "Profile", path: "/profile" },
];

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="brand-block">
        <div className="brand-badge">FA</div>
        <div>
          <h1>Fitness Assistant</h1>
          <p>Train smart. Track better.</p>
        </div>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;