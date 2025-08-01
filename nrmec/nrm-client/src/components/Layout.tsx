import { Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
import Sidebar from "./Sidebar";
import BackButton from "./BackButton";

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!user) {
    return null; // or navigate to login
  }

  const showBackButton = location.pathname !== "/dashboard";

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 2xl:ml-64 pl-16 2xl:pl-0 w-full transition-all duration-300">
        <nav className="bg-white shadow-sm">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center py-3 sm:py-4">
              <div className="w-full sm:w-auto text-center sm:text-left mb-2 sm:mb-0 flex items-center gap-4">
                {showBackButton && <BackButton />}
                <h1 className="text-lg sm:text-xl font-semibold">
                  Analytics Dashboard
                </h1>
              </div>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                {user && (
                  <span className="text-sm sm:text-base text-gray-700">
                    Welcome, {user.firstName} {user.lastName} ({user.role})
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm sm:text-base transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="w-full max-w-7xl mx-auto py-4 px-3 sm:px-4 sm:py-6 lg:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}