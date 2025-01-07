import { useContext, useEffect, useState } from "react";
import "./Navbar.css";
import logoKKU from "../pic/logo-head.jpg";
import { Link, useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { LuFileEdit } from "react-icons/lu";
import { UserContext } from "../App";
import { IoNotificationsOutline } from "react-icons/io5";
import UserNavigationPanel from "../components/user-navigation.component";
import axios from "axios";
import Notifications from "./chat/Notification";

function Navbar() {
  const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
  const [userNavPanel, setUserNavPanel] = useState(false);
  const navigate = useNavigate();

  const {
    userAuth,
    setUserAuth,
    userAuth: { access_token, profile_picture, new_notification_available },
  } = useContext(UserContext);

  useEffect(() => {
    if (access_token) {
      axios
        .get(`${import.meta.env.VITE_DOMAIN}/notifications/new-notification`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .then(({ data }) => {
          setUserAuth({ ...userAuth, ...data });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token]);

  const handleNavpanel = () => {
    setUserNavPanel((currentVal) => !currentVal);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(e);
    const query = e.currentTarget.value;

    if (e.key === "Enter" && query.length) {
      navigate(`/search/${query}`);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPanel(false);
    }, 200);
  };

  return (
    <nav className="navbar-navbar" style={{ zIndex: "50" }}>
      <Link to="/" className="logo-link">
        <img src={logoKKU} alt="Logo" className="logo-img" />
      </Link>

      <div
        className={`search-container ${searchBoxVisibility ? "show" : "hide"} `}
      >
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          onKeyDown={handleSearch}
        />
        <IoIosSearch className="icon-search" />
      </div>

      <div className="toggle-search">
        <button
          onClick={() => setSearchBoxVisibility((currentval) => !currentval)}
        >
          <IoIosSearch className="toggle-icon" />
        </button>

        <Link
          to="/editor"
          className="d-none d-md-flex align-items-center gap-2 md:flex gap-2 link"
          style={{ textDecoration: "none" }}
        >
          <LuFileEdit />
          <p className="m-0">เขียน</p>
        </Link>

        {access_token ? (
          <>
            <Link to="/dashboard/notifications">
              <button className="button-noti">
                <IoNotificationsOutline
                  className=" d-block"
                  style={{ fontSize: "1.5rem" }}
                />
              </button>
              {new_notification_available ? (
                <span
                  className="rounded-circle position-absolute z-10"
                  style={{
                    backgroundColor: "red",
                    width: "0.75rem",
                    height: "0.75rem",
                    zIndex: 10,
                    top: "1rem",
                    transform: "translateX(30px)",
                  }}
                ></span>
              ) : (
                ""
              )}
            </Link>

            <Notifications />

            <div
              className="relative"
              style={{ position: "relative" }}
              onClick={handleNavpanel}
              onBlur={handleBlur}
            >
              <button
                className=" mt-1"
                style={{ width: "3rem", height: "3rem" }}
              >
                <img
                  src={profile_picture}
                  className="img-fluid rounded-circle"
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>

              {userNavPanel ? <UserNavigationPanel /> : ""}
            </div>
          </>
        ) : (
          <>
            <Link
              className="btn-dark py-2"
              to="/signin"
              style={{ textDecoration: "none" }}
            >
              เข้าสู่ระบบ
            </Link>

            <Link
              className="btn-light py-2 hidden md:block"
              to="/signup"
              style={{ textDecoration: "none" }}
            >
              สมัครสมาชิก
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
