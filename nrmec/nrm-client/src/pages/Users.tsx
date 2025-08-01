import { useState, useEffect } from "react";
import {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetDistrictsQuery,
  useGetSubregionsQuery,
} from "../store/api/baseApi";
import { AlertCircle, CheckCircle, Edit, Trash, X } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  ninNumber: string;
  phoneNumber: string;
  district?: number | null;
  subregion?: number | null;
}

const userRoles = [
  "RegionalCoordinator",
  "DistrictRegistra",
  "PEO",
  "SuperAdmin",
  "Accountant",
];

const Users = () => {
  const { data: users, isLoading, refetch } = useGetUsersQuery();
  const [addUser] = useAddUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const { data: districts } = useGetDistrictsQuery();
  const { data: subregions } = useGetSubregionsQuery();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [operationResult, setOperationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
  }, [users]);

  const handleAddUser = async () => {
    try {
      const userToAdd: Partial<User> = {
        ...newUser,
        district: newUser.role === "DistrictRegistra" ? newUser.district ?? null : null,
        subregion: newUser.role === "RegionalCoordinator" ? newUser.subregion ?? null : null,
      };
      await addUser(userToAdd).unwrap();
      setIsModalOpen(false);
      setNewUser({});
      refetch();
      setOperationResult({
        success: true,
        message: "User added successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to add user",
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const updatedUser: Partial<User> = {
        ...editingUser,
        ...newUser,
        district: newUser.role === "DistrictRegistra" ? newUser.district ?? null : null,
        subregion: newUser.role === "RegionalCoordinator" ? newUser.subregion ?? null : null,
      };
      await updateUser(updatedUser).unwrap();
      setIsModalOpen(false);
      setEditingUser(null);
      setNewUser({});
      refetch();
      setOperationResult({
        success: true,
        message: "User updated successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to update user",
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      refetch();
      setOperationResult({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      setOperationResult({
        success: false,
        message: error.data?.message || "Failed to delete user",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
        >
          Add User
        </button>
      </div>

      {operationResult && (
        <div
          className={`${
            operationResult.success ? "bg-green-100" : "bg-red-100"
          } p-4 mb-4 rounded flex items-center`}
        >
          {operationResult.success ? (
            <CheckCircle className="mr-2" />
          ) : (
            <AlertCircle className="mr-2" />
          )}
          {operationResult.message}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Phone Number</th>
              <th className="px-4 py-2">NIN Number</th>
              <th className="px-4 py-2">District/Region</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="border px-4 py-2">{`${user.firstName} ${user.lastName}`}</td>
                <td className="border px-4 py-2">{user.email}</td>
                <td className="border px-4 py-2">{user.role}</td>
                <td className="border px-4 py-2">{user.phoneNumber}</td>
                <td className="border px-4 py-2">{user.ninNumber}</td>
                <td className="border px-4 py-2">
                  {user.role === "DistrictRegistra" && user.district
                    ? districts?.find((d) => d.id === user.district)?.name || "Unknown District"
                    : user.role === "RegionalCoordinator" && user.subregion
                    ? subregions?.find((r) => r.id === user.subregion)?.name || "Unknown Subregion"
                    : "N/A"}
                </td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setNewUser(user);
                      setIsModalOpen(true);
                    }}
                    className="text-yellow-600 hover:text-yellow-700 mr-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2"
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? "Edit User" : "Add User"}
            </h2>
            {/* Form fields */}
            <div className="space-y-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={newUser.firstName || ""}
                onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={newUser.lastName || ""}
                onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={newUser.email || ""}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={newUser.password || ""}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <input
                type="text"
                name="ninNumber"
                placeholder="NIN Number"
                value={newUser.ninNumber || ""}
                onChange={(e) => setNewUser({ ...newUser, ninNumber: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={newUser.phoneNumber || ""}
                onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                className="border p-2 w-full rounded"
              />
              <select
                name="role"
                value={newUser.role || ""}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="border p-2 w-full rounded"
              >
                <option value="">Select Role</option>
                {userRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {newUser.role === "DistrictRegistra" && (
                <select
                  name="district"
                  value={newUser.district || ""}
                  onChange={(e) => setNewUser({ ...newUser, district: Number(e.target.value) })}
                  className="border p-2 w-full rounded"
                >
                  <option value="">Select District</option>
                  {districts?.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
              )}
              {newUser.role === "RegionalCoordinator" && (
                <select
                  name="subregion"
                  value={newUser.subregion || ""}
                  onChange={(e) => setNewUser({ ...newUser, subregion: Number(e.target.value) })}
                  className="border p-2 w-full rounded"
                >
                  <option value="">Select Subregion</option>
                  {subregions?.map((subregion) => (
                    <option key={subregion.id} value={subregion.id}>
                      {subregion.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleUpdateUser : handleAddUser}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                {editingUser ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
