const BASE_URL = "http://localhost:8000";

let mode = "CREATE"; // Default
let selectedId = "";

window.onload = async () => {
  // นำ parameter ทั้งหมดมาใส่ตัวแปร urlParams
  const urlParams = new URLSearchParams(window.location.search);
  // ดึง id ออกมาจาก parameter
  const id = urlParams.get("id");
  if (id) {
    // ถ้ามี id = เปลี่ยน mode และเก็บตัวแปร id เอาไว้
    mode = "EDIT";
    selectedId = id;
    document.querySelector("#heading").innerHTML = "Edit form";
    // select dom
    let firstNameDOM = document.querySelector("input[name=firstname]");
    let lastNameDOM = document.querySelector("input[name=lastname]");
    let ageDOM = document.querySelector("input[name=age]");
    let genderDOMs = document.querySelectorAll("input[name=gender]");
    let interestDOMs = document.querySelectorAll("input[name=interest]");

    try {
      const response = await axios.get(`${BASE_URL}/users/${id}`);
      const user = response.data;

      // update ค่า
      firstNameDOM.value = user.firstname;
      lastNameDOM.value = user.lastname;
      ageDOM.value = user.age;
      genderDOMs.forEach((gender) => {
        if (gender.value == user.gender) {
          gender.checked = true;
        }
      });

      const interests = user.interests
        .split(",")
        .map((interest) => interest.trim());

      interestDOMs.forEach((interest) => {
        if (interests.includes(interest.value)) {
          interest.checked = true;
        }
      });
    } catch (error) {
      console.log("error", error);
    }
  }
};

const validateData = (userData) => {
  let errors = [];

  if (
    !userData.firstname ||
    !userData.lastname ||
    !userData.age ||
    !userData.gender ||
    !userData.interests
  ) {
    errors.push("กรุณากรอกข้อมูลให้ครบ");
  }

  return errors;
};

const submitData = async (e) => {
  e.preventDefault();
  const form = e.target;

  let responseMessageDOM = document.getElementById("response-message");

  try {
    let interest = [];
    form
      .querySelectorAll('input[name="interest"]:checked')
      .forEach((checkbox) => {
        interest.push(checkbox.value);
      });

    let userData = {
      firstname: form.firstname.value,
      lastname: form.lastname.value,
      age: form.age.value,
      gender: form.gender.value,
      interests: interest.join(", "),
    };

    //  handle Error หน้าบ้าน
    const errors = validateData(userData);

    if (errors.length > 0) {
      throw {
        message: "กรอกข้อมูลไม่ครบ",
        errors: errors,
      };
    }

    let response = {};
    let successText = "เพิ่มข้อมูลเรียบร้อย !";

    if (mode == "EDIT") {
      successText = "แก้ไขข้อมูลเรียบร้อย !"
      response = await axios.put(`${BASE_URL}/users/${selectedId}`, userData);
      console.log("response : ", response.data);
    } else {
      response = await axios.post(`${BASE_URL}/users`, userData);
      console.log("response : ", response.data);
      setTimeout(() => {
        responseMessageDOM.innerHTML = "";
        responseMessageDOM.classList = "hidden";
        form.reset();
      }, 2000);
    }

    responseMessageDOM.innerHTML = successText;
    responseMessageDOM.classList = "block bg-lime-500 px-2";
  } catch (error) {
    // console.log(error.response.data);
    let messageDOM = "มีปัญหาเกิดขึ้น";
    // หน้าบ้าน
    if (error.errors && error.errors.length > 0) {
      messageDOM = error.errors;
    }

    // หลังบ้าน
    /* if (error.response.data.errors && error.response.data.errors.length > 0) {
      let htmlData = `<div>
        <div>${error.response.data.message}</div>
        <ul>
        ${error.response.data.errors.map((error) => {
          console.log(error);
          return `<li>${error}</li>`;
        })}
        </ul>
        </div>`;
      messageDOM = htmlData;
    } */
    responseMessageDOM.innerHTML = messageDOM;
    responseMessageDOM.classList = "block bg-red-500 px-2";
  }
};
