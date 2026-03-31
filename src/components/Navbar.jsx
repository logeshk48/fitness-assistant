import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Workout", path: "/workouts" },
  { label: "Body", path: "/body-map" },
  { label: "Stats", path: "/stats" },
  { label: "Plans", path: "/plans" },
  { label: "Profile", path: "/profile" },
];

const Navbar = () => {
  return (
    <>
      {/* Desktop Navbar */}
      <header className="top-navbar">
        <div className="brand">Fitness Assistant</div>

        <nav className="top-nav-links">
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

      {/* Mobile Bottom Navbar */}
      <nav className="bottom-navbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              isActive ? "bottom-link active" : "bottom-link"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Navbar;