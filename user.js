const BASE_URL = "http://localhost:8000";

const loadData = async () => {
  const response = await axios.get(`${BASE_URL}/users`);
  const users = response.data;

  const usersDom = document.querySelector("#users");

  let userHTMLData = `<ul class="list-disc">`;
  users.map((user) => {
    userHTMLData += `<li>
      ${user.firstname} ${user.lastname}
      <a href='index.html?id=${user.id}'><button class="mx-3 rounded-md bg-green-600 px-1 text-white" data-id='${user.id}'>Edit</button></a>
      <button id="delete" class="mx-3 rounded-md bg-red-600 px-1 text-white" data-id='${user.id}'>Delete</button>
      </li>`;
  });
  userHTMLData += "</ul>";

  usersDom.innerHTML = userHTMLData;

  const deleteDoms = document.querySelectorAll("#delete");
  deleteDoms.forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      let id = event.target.dataset.id;
      console.log(id);

      try {
        await axios.delete(`${BASE_URL}/users/${id}`);
        loadData(); //recursive เรียกใช้ตัวเองซ้ำๆ
      } catch (error) {
        console.error(error.message);
      }
    });
  });
};

window.onload = async () => {
  await loadData();
};
