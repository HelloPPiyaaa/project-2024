// const API_BASE_URL = "http://localhost:3001";

export const fetchAdminProfile = async (id: string): Promise<any> => {
  if (!id) {
    throw new Error("Invalid Admin ID");
  }

  const token = localStorage.getItem("adminToken");
  if (!token) {
    console.error("No token found, redirecting to login...");
    return null;
  }

  const url = `${import.meta.env.VITE_DOMAIN}/admin/${id}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const statusText = response.statusText || "Unknown Error";
      throw new Error(
        `Server returned ${response.status} ${statusText} for ${url}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseData = await response.text();
      return responseData;
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Error:", (error as Error).message);

    if (error instanceof TypeError) {
      console.error("Network error or CORS issue");
    } else if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response");
    }

    return null;
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ทั้งหมดจาก backend
export const fetchUsersAPI = async () => {
  const token = localStorage.getItem("userId");
  if (!token) {
    console.error("No token found, redirecting to login...");
    return;
  }

  const response = await fetch(`${import.meta.env.VITE_DOMAIN}/admin/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return data;
};

export const fetchAllUser = async () => {
  const token = localStorage.getItem("userId");
  if (!token) {
    console.error("No token found, redirecting to login...");
    return;
  }

  const response = await fetch(`${import.meta.env.VITE_DOMAIN}/admin/viewer`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  const data = await response.json();
  return data;
};

export const deleteUserAPI = async (userId: string): Promise<void> => {
  const adminToken = localStorage.getItem("userId"); // ดึง token จาก localStorage

  if (!adminToken) {
    throw new Error("No admin token found. Unauthorized request.");
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_DOMAIN}/admin/users/${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`, // ส่ง token ไปใน header
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};
