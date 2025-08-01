import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  LayoutDashboard,
  BarChart2,
  Users,
  ChevronDown,
  ChevronUp,
  Globe,
  PieChart,
  Folders,
  Menu,
  X,
  Wallet,
  Vote,
  FileHeart,
} from "lucide-react";
import { useState } from "react";

interface SidebarLink {
  name: string;
  icon: React.ReactNode;
  path: string;
  subItems?: {
    name: string;
    path: string;
    subItems?: { name: string; path: string }[];
  }[];
}

const links: SidebarLink[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: "/dashboard",
  },
  {
    name: "Users",
    icon: <Users className="w-5 h-5" />,
    path: "/users",
  },
  {
    name: "Administrative Units",
    icon: <Globe className="w-5 h-5" />,
    path: "/administrative-units",
    subItems: [
      { name: "Regions", path: "/administrative-units/regions" },
      { name: "Subregions", path: "/administrative-units/subregions" },
      { name: "Districts", path: "/administrative-units/districts" },
      {
        name: "Constituencies/Municipalities",
        path: "/administrative-units/constituencies",
      },
      {
        name: "Subcounties/Divisions",
        path: "/administrative-units/subcounties",
      },
      { name: "Parishes/Wards", path: "/administrative-units/parishes" },
      { name: "Villages/Cells", path: "/administrative-units/villages" },
    ],
  },
  {
    name: "Express Interest",
    icon: <FileHeart className="w-5 h-5" />,
    path: "/express-interest",
    subItems: [
      {
        name: "Internal Party",
        path: "/express-interest/internal-party",
        subItems: [
          {
            name: "Village Cell",
            path: "/express-interest/internal-party/village-cell",
          },
          {
            name: "Parish Ward",
            path: "/express-interest/internal-party/parish-ward",
          },
          {
            name: "Subcounty Division",
            path: "/express-interest/internal-party/subcounty-division",
          },
          {
            name: "Constituency Municipality",
            path: "/express-interest/internal-party/constituency-municipality",
          },
          {
            name: "District",
            path: "/express-interest/internal-party/district",
          },
          {
            name: "National",
            path: "/express-interest/internal-party/national",
          },
        ],
      },
      {
        name: "Primaries",
        path: "/express-interest/primaries",
        subItems: [
          {
            name: "Village Cell",
            path: "/express-interest/primaries/village-cell",
          },
          {
            name: "Parish Ward",
            path: "/express-interest/primaries/parish-ward",
          },
          {
            name: "Subcounty Division",
            path: "/express-interest/primaries/subcounty-division",
          },
          {
            name: "Constituency Municipality",
            path: "/express-interest/primaries/constituency-municipality",
          },
          { name: "District", path: "/express-interest/primaries/district" },
          { name: "National", path: "/express-interest/primaries/national" },
        ],
      },
    ],
  },
  {
    name: "General Elections",
    icon: <BarChart2 className="w-5 h-5" />,
    path: "/general-elections",
    subItems: [
      { name: "Village Cell", path: "/general-elections/village-cell" },
      { name: "Parish Ward", path: "/general-elections/parish-ward" },
      {
        name: "Subcounty Division",
        path: "/general-elections/subcounty-division",
      },
      {
        name: "Constituency Municipality",
        path: "/general-elections/constituency-municipality",
      },
      { name: "District", path: "/general-elections/district" },
      { name: "National", path: "/general-elections/national" },
    ],
  },
  {
    name: "Reports",
    icon: <Folders className="w-5 h-5" />,
    path: "/reports",
    subItems: [
      { name: "Administrative Units", path: "/reports/administrative-units" },
      // { name: "Report Template", path: "/reports/template" },
      { name: "Polling Stations", path: "/reports/polling-stations" },
      { name: "Registrars", path: "/reports/registrars" },
    ],
  },
  {
    name: "Payments",
    icon: <Wallet className="w-5 h-5" />,
    path: "/payments",    subItems: [
      { name: "Fee Settings", path: "/payments/settings" },
      { name: "Receive Payments", path: "/payments/receive" },
      { name: "Payment Report", path: "/payments/report" },
      { name: "Enhanced Payment Report", path: "/payments/enhanced-report" },
    ],
  },
  {
    name: "Nominations",
    icon: <Users className="w-5 h-5" />,
    path: "/nominations",
    subItems: [
      {
        name: "Primaries",
        path: "/nominations/primaries",
        subItems: [
          { name: "Village Cell", path: "/nominations/primaries/village-cell" },
          { name: "Parish Ward", path: "/nominations/primaries/parish-ward" },
          {
            name: "Subcounty Division",
            path: "/nominations/primaries/subcounty-division",
          },
          {
            name: "Constituency Municipality",
            path: "/nominations/primaries/constituency-municipality",
          },
          { name: "District", path: "/nominations/primaries/district" },
          { name: "National", path: "/nominations/primaries/national" },
        ],
      },
      {
        name: "Internal Party",
        path: "/nominations/internal-party",
        subItems: [
          {
            name: "Village Cell",
            path: "/nominations/internal-party/village-cell",
          },
          {
            name: "Parish Ward",
            path: "/nominations/internal-party/parish-ward",
          },
          {
            name: "Subcounty Division",
            path: "/nominations/internal-party/subcounty-division",
          },
          {
            name: "Constituency Municipality",
            path: "/nominations/internal-party/constituency-municipality",
          },
          { name: "District", path: "/nominations/internal-party/district" },
          { name: "National", path: "/nominations/internal-party/national" },
        ],
      },
    ],
  },
  {
    name: "Votes",
    icon: <Vote className="w-5 h-5" />,
    path: "/votes",
    subItems: [
      {
        name: "Primaries",
        path: "/votes/primaries",
        subItems: [
          { name: "Village Cell", path: "/votes/primaries/village-cell" },
          { name: "Parish Ward", path: "/votes/primaries/parish-ward" },
          {
            name: "Subcounty Division",
            path: "/votes/primaries/subcounty-division",
          },
          {
            name: "Constituency Municipality",
            path: "/votes/primaries/constituency-municipality",
          },
          { name: "District", path: "/votes/primaries/district" },
          { name: "National", path: "/votes/primaries/national" },
        ],
      },
      {
        name: "Internal Party",
        path: "/votes/internal-party",
        subItems: [
          { name: "Village Cell", path: "/votes/internal-party/village-cell" },
          { name: "Parish Ward", path: "/votes/internal-party/parish-ward" },
          {
            name: "Subcounty Division",
            path: "/votes/internal-party/subcounty-division",
          },
          {
            name: "Constituency Municipality",
            path: "/votes/internal-party/constituency-municipality",
          },
          { name: "District", path: "/votes/internal-party/district" },
          { name: "National", path: "/votes/internal-party/national" },
        ],
      },
    ],
  },
];

// Helper to format keys for display
function formatSidebarLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

const SidebarLink = ({
  link,
  isOpen,
  toggleDropdown,
  setIsMobileMenuOpen,
}: {
  link: SidebarLink;
  isOpen?: boolean;
  toggleDropdown?: () => void;
  setIsMobileMenuOpen: (value: boolean) => void;
}) => {
  const location = useLocation();
  const [openNestedDropdown, setOpenNestedDropdown] = useState<string | null>(
    null
  );

  const isActive =
    location.pathname === link.path ||
    location.pathname.startsWith(link.path + "/");

  const toggleNestedDropdown = (subItemName: string) => {
    setOpenNestedDropdown(
      openNestedDropdown === subItemName ? null : subItemName
    );
  };

  if (link.subItems) {
    return (
      <div className="dropdown-content">
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleDropdown?.();
          }}
          className={`
            flex items-center px-4 py-3 cursor-pointer transition-colors
            ${isActive ? "bg-yellow-600 text-white" : "hover:bg-gray-700"}
            text-sm lg:text-base
          `}
        >
          {link.icon}
          <span className="ml-3 flex-1 whitespace-nowrap">{link.name}</span>
          <div className="ml-auto">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
        {isOpen && (
          <div className="bg-[#1a2233] pl-8">
            {link.subItems.map((subItem) => {
              if (subItem.subItems) {
                // Handle nested subItems
                const isNestedOpen = openNestedDropdown === subItem.name;
                const isSubItemActive = location.pathname.startsWith(
                  subItem.path + "/"
                );

                return (
                  <div key={subItem.path}>
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleNestedDropdown(subItem.name);
                      }}
                      className={`
                        flex items-center px-4 py-2 cursor-pointer transition-colors
                        text-sm lg:text-base whitespace-nowrap
                        ${
                          isSubItemActive
                            ? "bg-yellow-600 text-white"
                            : "hover:bg-gray-700"
                        }
                      `}
                    >
                      <span className="flex-1">{subItem.name}</span>
                      <div className="ml-auto">
                        {isNestedOpen ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>
                    {isNestedOpen && (
                      <div className="bg-[#0f1419] pl-8">
                        {subItem.subItems.map((nestedItem) => (
                          <Link
                            key={nestedItem.path}
                            to={nestedItem.path}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.innerWidth < 1536) {
                                setIsMobileMenuOpen(false);
                              }
                            }}
                            className={`
                              flex items-center px-4 py-2 transition-colors
                              text-sm lg:text-base whitespace-nowrap
                              ${
                                location.pathname === nestedItem.path
                                  ? "bg-yellow-600 text-white"
                                  : "hover:bg-gray-700"
                              }
                            `}
                          >
                            <span>{nestedItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              } else {
                // Handle regular subItems
                return (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.innerWidth < 1536) {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    className={`
                      flex items-center px-4 py-2 transition-colors
                      text-sm lg:text-base whitespace-nowrap
                      ${
                        location.pathname === subItem.path
                          ? "bg-yellow-600 text-white"
                          : "hover:bg-gray-700"
                      }
                    `}
                  >
                    <span>{subItem.name}</span>
                  </Link>
                );
              }
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={link.path}
      className={`
        flex items-center px-4 py-3 transition-colors
        text-sm lg:text-base whitespace-nowrap
        ${isActive ? "bg-yellow-600 text-white" : "hover:bg-gray-700"}
      `}
    >
      {link.icon}
      <span className="ml-3">{link.name}</span>
    </Link>
  );
};

export default function Sidebar() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDropdown = (linkName: string) => {
    setOpenDropdown(openDropdown === linkName ? null : linkName);
  };

  // Get filtered administrative units based on user role
  const getAdministrativeUnits = () => {
    if (user?.role === "DistrictRegistra") {
      return [
        { name: "Districts", path: "/administrative-units/districts" },
        {
          name: "Constituencies/Municipalities",
          path: "/administrative-units/constituencies",
        },
        {
          name: "Subcounties/Divisions",
          path: "/administrative-units/subcounties",
        },
        { name: "Parishes/Wards", path: "/administrative-units/parishes" },
        { name: "Villages/Cells", path: "/administrative-units/villages" },
      ];
    }
    if (user?.role === "RegionalCoordinator") {
      return [
        { name: "Subregions", path: "/administrative-units/subregions" },
        { name: "Districts", path: "/administrative-units/districts" },
        {
          name: "Constituencies/Municipalities",
          path: "/administrative-units/constituencies",
        },
        {
          name: "Subcounties/Divisions",
          path: "/administrative-units/subcounties",
        },
        { name: "Parishes/Wards", path: "/administrative-units/parishes" },
        { name: "Villages/Cells", path: "/administrative-units/villages" },
      ];
    }
    return (
      links.find((link) => link.name === "Administrative Units")?.subItems || []
    );
  };

  // Filter links based on user role and modify subItems
  const filteredLinks = links
    .map((link) => {
      if (link.name === "Administrative Units") {
        return {
          ...link,
          subItems: getAdministrativeUnits(),
        };
      }
      if (link.name === "Payments") {
        return {
          ...link,
          subItems: link.subItems?.filter((item) => {
            if (item.name === "Payment Report") {
              return user?.role === "SuperAdmin" || user?.role === "Accountant";
            }
            return true;
          }),
        };
      }
      return link;
    })
    .filter((link) => {
      if (user?.role !== "SuperAdmin") {
        return !["Users", "Audit Trails", "Pending Actions"].includes(
          link.name
        );
      }
      return true;
    });

  return (
    <>
      {/* Hamburger Menu Button - moved to left side */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="2xl:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        aria-label="Toggle Menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#1a2233] text-gray-300 
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        2xl:translate-x-0
      `}
      >
        <div className="p-5 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">NRM Dashboard</h1>
          {/* Close button for mobile - optional */}
          {isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="2xl:hidden text-gray-300 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation */}
        <nav className="mt-5 h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide">
          {filteredLinks.map((link) => (
            <div
              key={link.path}
              onClick={(e) => {
                // Only close mobile menu if clicking outside of dropdown
                if (!(e.target as HTMLElement).closest(".dropdown-content")) {
                  setIsMobileMenuOpen(false);
                }
              }}
            >
              <SidebarLink
                link={link}
                isOpen={openDropdown === link.name}
                toggleDropdown={() => toggleDropdown(link.name)}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
            </div>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 2xl:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
