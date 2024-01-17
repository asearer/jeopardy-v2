const BASE_URL = "https://jservice.arcanine.io/";
let categories = [];

/** Get random categories from API.
 * Returns an array of category ids
 */
async function getCategoryIds() {
  let offset = Math.floor(Math.random() * 500 + 1);
  let res = await axios.get(
    `${BASE_URL}api/categories?count=100&offset=${offset}`
  );

  let newResData = res.data.filter((val) => val["clues_count"] >= 5);

  let NUM_CATEGORIES = _.sampleSize(newResData, [(n = 6)]);

  let catId = [];
  for (let num of NUM_CATEGORIES) {
    let categoryID = num.id;
    catId.push(categoryID);
  }
  return catId;
}

/** Return an object with data about a category: */
async function getCategory(catId) {
  for (id of catId) {
    let { data } = await axios.get(
      `https://jservice.arcanine.io/api/category?id=${id}`
    );

    // created clues object for questions and answers.
    let clues = _.sampleSize(data.clues, [(n = 5)]);
    let clueArray = [];
    clues.forEach((e) => {
      clueArray.push({
        questionId: e.id,
        answer: e.answer,
        question: e.question,
        showing: null,
      });
    });

    categories.push({
      categoryId: data.id,
      title: data.title,
      clues: clueArray,
    });
  }
  return categories;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions. */
async function fillTable() {
  for (let i = 0; i < 5; i++) {
    $("tbody").append("<tr></tr>");
    for (let j = 0; j < 6; j++) {
      let monetaryValue = (i + 1) * 200;
      $("tbody tr").last().append(`<td id="${j}-${i}">$${monetaryValue}</td>`);
    }
  }

  // Create the table header
  categories.forEach((category) => {
    $("thead tr").append(`<th scope="col">${category.title}</th>`);
  });
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 */
function handleClick(target) {
  if (target.tagName.toLowerCase() === "td") {
    let j = parseInt(target.getAttribute("id")[0]);
    let i = parseInt(target.getAttribute("id")[2]);

    if (categories[j].clues[i].showing === null) {
      target.innerHTML = `${categories[j].clues[i].question}`;
      categories[j].clues[i].showing = "question";
    } else if (categories[j].clues[i].showing === "question") {
      target.style.backgroundColor = "#28a200";
      target.style.cursor = "default";
      target.innerHTML = `${categories[j].clues[i].answer}`;
      categories[j].clues[i].showing = "answer";
    } else {
      return;
    }
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
  document.querySelector(".loader").style.display = "block";
}

function hideLoadingView() {
  document.querySelector(".loader").style.display = "none";
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 */
async function setupAndStart() {
  showLoadingView();
  let catId = await getCategoryIds();
  await getCategory(catId);
  hideLoadingView();
  $(".container").prepend(
    $(`<table class="table">
    <thead>
    <tr>
    </tr>
    </thead>
    <tbody>
    </tbody>
    </table>
    `),
    $(document.createElement("button")).prop({
      type: "button",
      innerHTML: "Restart Game",
      class: "btn-styled",
    })
  );

  fillTable();
  $("td").on("click", function (e) {
    handleClick(e.target);
  });

  $(".btn-styled").on("click", function () {
    location.reload();
  });
}

setupAndStart();
