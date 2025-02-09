const proxyUrl = "https://cors-anywhere.herokuapp.com/";
const date = document.querySelector(".date");
const box = document.querySelector(".box");
let SCHEDULE = [];
let targetUrl = "https://www.vgtk.by/schedule/lessons/day-today.php";
let isToday = true;

const lessonsTime = {
  1: "09.00 - 09.45",
  2: "09.55 - 10.40",
  3: "10.50 - 11.35",
  4: "11.45 - 12.30",
  5: "12.40 - 13.25",
  6: "13.35 - 14.20",
  7: "14.30 - 15.15",
  8: "15.25 - 16.10",
  9: "16.20 - 17.05",
  10: "17.15 - 18.00",
  11: "18.10 - 18.55",
};

const allGroups = ["ВР-21"]

const splitRowspan2TD = (tableElement) => {
  for (let i = 0; i < tableElement.rows.length; i++) {
    let row = tableElement.rows[i];
    for (let j = 0; j < row.cells.length; j++) {
      let cell = row.cells[j];
      let rowspan = parseInt(cell.getAttribute("rowspan"));
      if (cell.hasAttribute("rowspan") && rowspan > 1) {
        let newCell = cell.cloneNode(true);
        cell.removeAttribute("rowspan");
        for (let k = 1; k < rowspan; k++) {
          let nextRow = tableElement.rows[i + k];
          if (nextRow) {
            if (j <= nextRow.cells.length) {
              let nextCell = nextRow.insertCell(j);
              nextCell.innerHTML = newCell.innerHTML;
            } else {
              console.warn(`Недопустимый индекс: ${j} для строки ${i + k}`);
            }
          }
        }
      }
    }
  }
};

const mergeSplittedCells = (tableElement) => {
    const rows = tableElement.rows;
    const numRows = rows.length;
    const numCols = rows[0].cells.length;

    for (let j = 0; j < numCols; j++) {
        for (let i = 0; i < numRows; i++){
            const cell1 = rows[i].cells[j]
            const cell2 = rows[i++].cells[j]

            /*if (cell1.textContent == cell2.textContent) { // Проверяем, одинаковое ли содержимое
                rowspan++;
                rows[i++].deleteCell(j); //Удаляем дубликат
            } else {
                if (rowspan > 1) {
                    cell1.setAttribute('rowspan', rowspan);
                }
                rowspan = 1;
            }*/
        }
    }

    console.log(tableElement)
};

const getVGTK = (url) => {
  let SCHEDULE = [];

  fetch(url, {
  headers: {
    Access-Control-Allow-Origin: "https://yaroslavyaroslavov.github.io"
  }
})
    .then((response) => response.text())
    .then((data) => {
      const tempElement = document.createElement("div");
      tempElement.innerHTML = data;
      const tableElement = tempElement.querySelector("table");
      console.log(tableElement.rows[0].innerText.trim())
      date.innerText = tableElement.rows[0].innerText.trim()

      splitRowspan2TD(tableElement);

      for (let i = 0; i < tableElement.rows.length - 11; i++) {
        const row = tableElement.rows[i];
        if (row.cells.length > 1) {
          Array.from(row.cells).forEach((cell, j) => {
            let cellValue = cell.innerText.trim();
            if (allGroups.includes(cellValue)) {
              const groupSchedule = {
                groupName: cellValue,
                lessons: Array.from({ length: 11 }, (_, index) => ({
                  lessonName:
                    tableElement.rows[i + index + 1].cells[j]?.innerText.trim(),
                  cabinet:
                    tableElement.rows[i + index + 1].cells[
                      j + 1
                    ]?.innerText.trim(),
                  lessonNumber: index + 1,
                })),
              };
              SCHEDULE.push(groupSchedule);
            }
          });
        }
      }
      renderLessons(SCHEDULE)
    })
    .catch((error) => console.error("Ошибка:", error));

    function renderLessons(data){
      //const box = document.createElement("table");

      box.innerHTML = ''
      let spice = data[0].lessons
      for(let i = 0; i<spice.length; i++){
        console.log(spice[i])
        if (spice[i].lessonName == 'обед'){
          box.innerHTML += `<tr><th>${lessonsTime[spice[i].lessonNumber]}</th><th class="obed">${spice[i].lessonName}</th><th>${spice[i].cabinet}</th></tr>`
        } else {
          box.innerHTML += `<tr><th>${lessonsTime[spice[i].lessonNumber]}</th><th>${spice[i].lessonName}</th><th>${spice[i].cabinet}</th></tr>`
        }
      }

      //mergeSplittedCells(box)
    }
};

getVGTK(proxyUrl + targetUrl);

function changeDay() {
  isToday = !isToday;
  targetUrl = isToday
    ? "https://www.vgtk.by/schedule/lessons/day-today.php"
    : "https://www.vgtk.by/schedule/lessons/day-tomorrow.php";
  getVGTK(proxyUrl + targetUrl);
}


