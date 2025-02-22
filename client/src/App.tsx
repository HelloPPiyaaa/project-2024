import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import TestPage from "./Screens/test";
import HomePage from "./Screens/home.page";
import Profile from "./Screens/profile";
import EditProfile from "./Screens/edit-profile.page";
import RegisterAdmin from "./Screens/Admin/adminRegister";
// import Content from "./Screens/Content";
import LoginAdmin from "./Screens/Admin/adminLogin";
import AdminHome from "./Screens/Admin/adminHome";
import Setting from "./Screens/setting1";
import Setting2 from "./Screens/setting2";
import Setting3 from "./Screens/setting3";
import Sidebar from "./Screens/sidebar";
import Settingtest from "./Screens/settingtest";
import Category from "./Screens/category";
import Footer from "./Navbar/footer";
import ForgotPassword from "./Screens/ForgotPassword";
import ResetPassword from "./Screens/ResetPassword";
import Chat from "./Screens/chat";
import { ChatContextProvider } from "./Screens/ChatContext";
import Navbar2 from "./Navbar/Navbar1";
import Navbar from "./Navbar/Navbar";
import EditPost from "./Screens/edit-post";
// import SearchResults from "./Navbar/SearchResults ";
import HelpCentre from "./Screens/helpcentre";
import Popular from "./Screens/Popular";
import { createContext } from "react";
import { lookInSession } from "./common/session";
import UserAuthForm from "./Screens/UserAuthForm";
import Editor from "./Screens/editor-page";
import SearchPage from "./Screens/search.page";
import PageNotFound from "./Screens/404";
import ProfilePage from "./Screens/ProfilePage";
import BlogPage from "./Screens/blog.page";
import SideNav from "./components/sideNavbar";
import ChangPassword from "./Screens/change-password";
import Notifications from "./Screens/notifications.page";
import ManageBlogs from "./Screens/manageblogs";

interface UserContextType {
  userAuth: {
    access_token: string | null;
    username?: string;
    fullname?: string;
    profile_picture?: string;
    new_notification_available?: boolean;
  };
  setUserAuth: React.Dispatch<React.SetStateAction<any>>;
}

export const UserContext = createContext<UserContextType>({
  userAuth: { access_token: null },
  setUserAuth: () => {},
});

function NavbarLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  const [userAuth, setUserAuth] = useState<{ access_token: string | null }>({
    access_token: null,
  });

  useEffect(() => {
    const userInSession = lookInSession("user");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);
  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <ChatContextProvider>
        <Routes>
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:blog_id" element={<Editor />} />
          <Route element={<NavbarLayout />}>
            <Route
              path="/signin"
              element={<UserAuthForm type="เข้าสู่ระบบ" />}
            />
            <Route
              path="/signup"
              element={<UserAuthForm type="สมัครสมาชิก" />}
            />
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<SideNav />}>
              <Route path="blogs" element={<ManageBlogs />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
            <Route path="settings" element={<SideNav />}>
              <Route path="edit-profile" element={<EditProfile />}></Route>
              <Route path="change-password" element={<ChangPassword />}></Route>
            </Route>
            <Route path="/search/:query" element={<SearchPage />} />
            <Route path="*" element={<PageNotFound />} />
            <Route path="/user/:id" element={<ProfilePage />} />
            <Route path="/blog/:blog_id" element={<BlogPage />}></Route>

            <Route path="/test" element={<TestPage />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile/edit-profile/:id" element={<EditProfile />} />
            <Route path="/editpost/:id" element={<EditPost />} />
            <Route path="/setting1" element={<Setting />} />
            <Route path="/setting2" element={<Setting2 />} />
            <Route path="/setting3" element={<Setting3 />} />
            <Route path="/sidebar" element={<Sidebar />} />
            <Route path="/st" element={<Settingtest />} />
            <Route path="/footer" element={<Footer />} />
            <Route path="/helpcentre" element={<HelpCentre />} />
            {/* <Route path="/content/:id" element={<Content />} /> */}
            <Route path="/category" element={<Category />} />
            <Route path="/popular" element={<Popular />} />
            {/* <Route path="/search" element={<SearchResults />} /> */}
          </Route>

          <Route path="/admin/register" element={<RegisterAdmin />} />
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/admin/:id" element={<AdminHome />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset_password/:id/:token"
            element={<ResetPassword />}
          />
          <Route path="/chats" element={<Chat />} />
          <Route path="/nav" element={<Navbar2 />} />
        </Routes>
      </ChatContextProvider>
    </UserContext.Provider>
  );
}

export default App;
