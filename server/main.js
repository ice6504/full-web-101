const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const port = 8000;
app.use(bodyParser.json());
app.use(cors());

let conn = null;

const validateData = (userData) => {
  let errors = [];
  if (!userData.firstname) {
    errors.push("กรุณาใส่ชื่อจริง");
  }
  if (!userData.lastname) {
    errors.push("กรุณาใส่นามสกุล");
  }
  if (!userData.age) {
    errors.push("กรุณาใส่อายุ");
  }
  if (!userData.interests) {
    errors.push("กรุณาเลือกความสนใจอย่างน้อย 1 อย่าง");
  }
  return errors;
};

const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "tutorials",
  });
};

// // ต่อ database และใช้ async awiat + try catch
app.get("/testDb", async (req, res) => {
  try {
    const results = await conn.query("SELECT * FROM users");
    res.json(results[0]);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// GET /users สำหรับ get users ทั้งหมดที่บันทึกเข้าไปออกมา
app.get("/users", async (req, res) => {
  try {
    const results = await conn.query(
      "SELECT Id , firstname , lastname FROM users"
    );

    filterData = results[0].map((user) => {
      return {
        id: user.Id,
        firstname: user.firstname,
        lastname: user.lastname,
        fullname: `${user.firstname} ${user.lastname}`,
      };
    });
    res.json(filterData);
  } catch (error) {
    console.error("Error fetching users : ", error.message);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// POST /users สำหรับการสร้าง users ใหม่บันทึกเข้าไป
app.post("/users", async (req, res) => {
  try {
    const data = req.body;
  
    const errors = validateData(data);
    
    if (errors.length > 0) {
      throw {
        errorMessage: "กรอกข้อมูลไม่ครบ",
        errors: errors,
      };
    }
    
    const results = await conn.query("INSERT INTO users SET ?", data);
    res.json({
      message: "User created successfully",
      user: results[0],
    });
  } catch (error) {
    const message = error.errorMessage || "something wrong";
    res.status(500).json({
      message: message,
      errors: error.errors || [],
    });
  }
});

// GET /users/:id สำหรับการดึง users รายคนออกมา
app.get("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [findUser] = await conn.query("SELECT * FROM users WHERE Id = ?", id);
    if (findUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(findUser[0]);
  } catch (error) {
    console.error("User not found : ", error.message);
    res.status(404).json({ error: "User not found" });
  }
});

// PUT /users/:id สำหรับการแก้ไข users รายคน (ตาม id ที่บันทึกเข้าไป)
app.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  try {
    const result = await conn.query("UPDATE users SET ? WHERE id = ?", [
      data,
      id,
    ]);
    // ใช้ affectedRows เพื่อเช็ค แถว ใน ตาราง users ว่ามีการถูก update ไหม
    // หากไม่มีแถวใดถูกอัพเดต (ค่า affectedRows เป็น 0)
    if (result.affectedRows === 0) {
      // throw โยนไปให้ catch
      throw { statusCode: 404, message: "User not found" };
    }
    res.json({ message: "User updated successfully", userId: id });
  } catch (error) {
    let errorStatus = error.status || 500;
    console.error("Error", error.message);
    res.status(errorStatus).json({ error: "Error updating user" });
  }
});

// DELETE /users/:id สำหรับการลบ users รายคน (ตาม id ที่บันทึกเข้าไป)
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await conn.query(
      "DELETE FROM users WHERE Id = ?",
      parseInt(id)
    );
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      message: "User deleted successfully",
      UsersId: id,
    });
  } catch (error) {
    console.log("Error deleting user : ", error.message);
    res.status(500).json({ error: "Error deleting user" });
  }
});

// ประกาศ​ http server ที่ port 8000 (ตามตัวแปร port)
app.listen(port, async (req, res) => {
  await initMySQL();
  console.log(`http server run at lo http://localhost:${port}`);
});
