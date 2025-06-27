let programFormUid = 0;

// Создание формы программы
function createProgramForm(onChange, onRemove) {
  const uid = ++programFormUid;
  const checkboxMap = new Map();
  let elements = {};
  let removeButton, toggleButton, programBody, element;

  // Создание DOM элемента
  function createElement() {
    const card = document.createElement("div");
    card.className = "ui--dms-card";

    card.innerHTML = `
      <div class="ui--dms-text-container">
       <div class="ui--program-header">
  <span class="text-title-lg program-title">Программа</span>
  <div class="ui--program-actions">
    <button type="button" class="ui-button ui-button--outline ui-button--sm toggleProgramBtn">Свернуть</button>
    <button type="button" class="ui-button ui-button--danger ui-button--sm removeProgramBtn">Удалить</button>
  </div>
</div>

      </div>

      <div class="ui--program-body">
        <div class="ui--program-wrapper">
      <div class="ui--field">
  <label class="ui--label" for="employeeCount_${uid}">Количество сотрудников</label>
<input
  type="number"
  class="ui--input employeeCount"
  id="employeeCount_${uid}"
  name="employeeCount_${uid}"
  max="10000"
  value="1"
/>

</div>

          <div class="ui--field">
            <label class="ui--label" for="regionSelect_${uid}">Регион</label>
            <div class="ui--select-wrapper">
              <select class="ui--select regionSelect" id="regionSelect_${uid}" name="region_${uid}">
                <option value="">Выберите регион</option>
              </select>
            </div>
          </div>

          <div class="ui--field">
            <label class="ui--label" for="programSelect_${uid}">Программа</label>
            <div class="ui--select-wrapper">
              <select class="ui--select programSelect" id="programSelect_${uid}" name="program_${uid}">
                <option value="">Выберите программу</option>
              </select>
            </div>
          </div>
        </div>

        <div class="ui--field">
          <div class="ui--label">Выберите опции:</div>
          <div class="ui--checkbox-group checkboxGroup"></div>
          <div class="ui--alert-warning" style="display: none;">
            Чтобы выбрать опции, сначала укажите регион и программу
          </div>
        </div>
      </div>
    `;

    element = card;
  }

  // Инициализация элементов и событий
  function init() {
    elements = {
      employeeCount: element.querySelector(".employeeCount"),
      regionSelect: element.querySelector(".regionSelect"),
      programSelect: element.querySelector(".programSelect"),
      checkboxGroup: element.querySelector(".checkboxGroup"),
      checkboxHint: element.querySelector(".ui--alert-warning"),
    };

    removeButton = element.querySelector(".removeProgramBtn");
    toggleButton = element.querySelector(".toggleProgramBtn");
    programBody = element.querySelector(".ui--program-body");

    // События
    removeButton.addEventListener("click", () => onRemove(programForm));
    toggleButton.addEventListener("click", toggleCollapse);

    populateSelects();
    generateCheckboxes();
    bindEvents();
  }

  function updateTitle(index) {
    const titleEl = element.querySelector(".program-title");
    if (titleEl) {
      titleEl.textContent = `Программа ${index + 1}`;
    }
  }

  function populateSelects() {
    dmsData.regions.forEach((r) => {
      const o = new Option(r.name, r.id);
      elements.regionSelect.appendChild(o);
    });
    dmsData.programs.forEach((p) => {
      const o = new Option(p.name, p.id);
      elements.programSelect.appendChild(o);
    });
  }

  function bindEvents() {
    elements.regionSelect.addEventListener("change", updateCheckboxes);
    elements.programSelect.addEventListener("change", updateCheckboxes);
    elements.employeeCount.addEventListener("change", onChange);
    elements.employeeCount.addEventListener("input", handleEmployeeCountInput);

    checkboxMap.forEach(({ input }) => {
      input.addEventListener("change", onChange);
    });
  }

  function generateCheckboxes() {
    const mutuallyExclusiveIds = ["stom_policlinika", "spec_stom"];

    dmsData.services.forEach((service) => {
      const label = document.createElement("label");
      label.className = "ui--checkbox-wrapper";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "ui--checkbox-input";
      input.value = service.id;
      input.id = `service_${service.id}_${uid}`;
      input.name = `service_${service.id}_${uid}`;

      const box = document.createElement("span");
      box.className = "ui--checkbox-box";

      const name = document.createElement("span");
      name.className = "ui--checkbox-label";
      name.textContent =
        service.name + (service.required ? " (обязательно)" : "");

      label.setAttribute("for", input.id);
      label.append(input, box, name);

      if (service.required) {
        input.checked = true;
        input.disabled = true;
      } else {
        input.disabled = true;
        label.classList.add("ui--checkbox--disabled");
      }

      checkboxMap.set(service.id, { input, label, name, service });
      elements.checkboxGroup.appendChild(label);

      if (mutuallyExclusiveIds.includes(service.id)) {
        input.addEventListener("change", () => {
          if (!input.checked) return;

          mutuallyExclusiveIds.forEach((otherId) => {
            if (otherId !== service.id) {
              const other = checkboxMap.get(otherId);
              if (other && other.input.checked) {
                other.input.checked = false;
              }
            }
          });

          onChange();
        });
      }
    });

    // Предупреждение
    if (elements.checkboxHint) {
      elements.checkboxHint.style.display = "block";
    }
  }

  function collapse() {
    programBody.style.display = "none";
    toggleButton.textContent = "Развернуть";
  }

  function expand() {
    programBody.style.display = "";
    toggleButton.textContent = "Свернуть";
  }

  function toggleCollapse() {
    const isVisible = programBody.style.display !== "none";
    isVisible ? collapse() : expand();
  }

  function updateCheckboxes() {
    const regionId = parseInt(elements.regionSelect.value);
    const programId = elements.programSelect.value;
    const showHint = !regionId || !programId;

    const groupId = dmsData.regions.find((r) => r.id === regionId)?.groupId;

    elements.checkboxHint.style.display = showHint ? "block" : "none";

    checkboxMap.forEach(({ input, label, name, service }) => {
      if (service.required) return;

      const price = getPrice(groupId, service.id, programId);
      const isAvailable = !showHint && price !== null;

      input.disabled = !isAvailable;
      label.classList.toggle("ui--checkbox--disabled", !isAvailable);
      input.checked = input.checked && isAvailable;
      name.textContent = service.name;
    });

    onChange();
  }

  function getPrice(groupId, serviceId, programId) {
    return dmsData.groupTariffs?.[groupId]?.[serviceId]?.[programId] ?? null;
  }

  function isValid() {
    const regionId = parseInt(elements.regionSelect.value);
    const programId = elements.programSelect.value;
    return !!(regionId && programId);
  }

  function calculate() {
    const regionId = parseInt(elements.regionSelect.value);
    const programId = elements.programSelect.value;
    const employeeCount = parseInt(elements.employeeCount.value || "1");

    if (!regionId || !programId) {
      return null;
    }

    const groupId = dmsData.regions.find((r) => r.id === regionId)?.groupId;
    let total = getPrice(groupId, "policlinika", programId) || 0;
    const selectedOptions = ["Поликлиника"];

    checkboxMap.forEach(({ input, service }) => {
      if (input.checked && !service.required) {
        const price = getPrice(groupId, service.id, programId);
        if (price !== null) {
          total += price;
          selectedOptions.push(service.name);
        }
      }
    });

    return {
      pricePerPerson: total,
      totalCost: total * employeeCount,
      selectedOptions,
      employeeCount,
      isValid: true,
    };
  }

  // Создаем и инициализируем
  createElement();
  init();

  // Публичный API
  const programForm = {
    uid,
    element,
    elements,
    removeButton,
    checkboxMap,
    updateTitle,
    collapse,
    expand,
    toggleCollapse,
    isValid,
    calculate,
  };

  return programForm;
}

// Создание калькулятора ДМС
function createDMSCalculator() {
  const programsContainer = document.getElementById("programsContainer");
  const resultBox = document.getElementById("resultBox");
  const addButton = document.getElementById("addProgram");
  const programDetailsEl = document.getElementById("programDetails");
  const programDetailsAlertEl = document.getElementById("programDetailsAlert");
  const totalCostEl = document.getElementById("totalCost");
  const downloadButton = document.getElementById("downloadExcel");

  let programs = [];

  function addProgram() {
    const lastProgram = programs[programs.length - 1];
    if (lastProgram) lastProgram.collapse();

    const programForm = createProgramForm(recalculate, removeProgram);
    programForm.expand();

    programs.push(programForm);
    programsContainer.appendChild(programForm.element);

    recalculate();
    updateRemoveButtons();
  }

  function removeProgram(programForm) {
    programs = programs.filter((p) => p !== programForm);
    programForm.element.remove();
    recalculate();
    updateRemoveButtons();
  }

  function updateRemoveButtons() {
    const canRemove = programs.length > 1;
    programs.forEach((program) => {
      program.removeButton.style.display = canRemove ? "inline-block" : "none";
    });
  }

  function hasAtLeastOneValidProgram() {
    return programs.some((program) => {
      const regionSelected = program.elements.regionSelect.value !== "";
      const programSelected = program.elements.programSelect.value !== "";
      const employeeCount = parseInt(
        program.elements.employeeCount.value || "0"
      );
      return regionSelected && programSelected && employeeCount > 0;
    });
  }

  function updateDownloadButtonState() {
    const enable = hasAtLeastOneValidProgram();
    if (downloadButton) {
      downloadButton.classList.toggle("ui-button--disabled", !enable);
      downloadButton.style.pointerEvents = enable ? "auto" : "none";
      downloadButton.style.opacity = enable ? "1" : "0.5";
    }
  }

  function recalculate() {
    let total = 0;
    let hasValidPrograms = false;
    programDetailsEl.innerHTML = "";

    programs.forEach((program, index) => {
      program.updateTitle(index);
      const result = program.calculate();

      const detailBlock = document.createElement("div");
      detailBlock.className = "program-detail-block";

      if (!result) {
        detailBlock.innerHTML = `
        <div class="text-title-sm">Программа ${index + 1}</div>
        <div class="text-subtitle text-color-warning">Заполните все обязательные поля (регион и программа)</div>
      `;
      } else {
        hasValidPrograms = true;
        total += result.totalCost;

        const optionsHtml = result.selectedOptions
          .map((opt) => {
            const groupId = dmsData.regions.find(
              (r) => r.id === parseInt(program.elements.regionSelect.value)
            )?.groupId;
            const programId = program.elements.programSelect.value;
            const serviceId = dmsData.services.find((s) => s.name === opt)?.id;

            let price = 0;
            if (serviceId && groupId && programId) {
              price =
                dmsData.groupTariffs?.[groupId]?.[serviceId]?.[programId] ?? 0;
            }

            return `
          <div class="option-row">
            <div class="option-row__label">${opt}</div>
            <div class="option-row__price">${price.toLocaleString(
              "ru-RU"
            )} ₽</div>
          </div>
        `;
          })
          .join("");

        detailBlock.innerHTML = `
        <div class="program-detail-group">
         <div class="text-title-sm">Программа ${index + 1}</div>
        <div class="text-subtitle">Сотрудников: ${result.employeeCount}</div>
        </div>

         <div class="program-detail-group">
        <div class="price-row">
          <div class="price-row__label text-subtitle">Страховая премия на 1 застрахованное лицо:</div>
          <div class="price-row__value text-subtitle">${result.pricePerPerson.toLocaleString(
            "ru-RU"
          )} ₽</div>
        </div>

        <div class="price-row">
          <div class="price-row__label text-subtitle">Стоимость программы:</div>
          <div class="price-row__value text-subtitle">${result.totalCost.toLocaleString(
            "ru-RU"
          )} ₽</div>
        </div>
          </div>

        <div class="text-title-sm options-title" style="">Опции:</div>
        <div class="program-options-list">
          ${optionsHtml}
        </div>
      `;
      }

      programDetailsEl.appendChild(detailBlock);
    });

    totalCostEl.textContent = `${total.toLocaleString("ru-RU")} ₽`;

    if (!hasValidPrograms && programs.length > 0) {
      programDetailsAlertEl.style.display = "block";
      programDetailsAlertEl.innerHTML = `
    Для расчета стоимости необходимо заполнить все поля во всех программах
  `;
    } else {
      programDetailsAlertEl.style.display = "none";
      programDetailsAlertEl.innerHTML = "";
    }

    updateDownloadButtonState();
    fillTildaHiddenField();
  }

  // Инициализация
  addButton.addEventListener("click", addProgram);
  addProgram();
  updateDownloadButtonState();

  // Публичный API
  return {
    programs,
    addProgram,
    removeProgram,
    recalculate,
    hasAtLeastOneValidProgram,
  };
}

// Утилитарные функции
function withLoading(button, loadingText, callback) {
  const originalText = button.textContent;
  button.textContent = loadingText;
  button.disabled = true;
  button.classList.add("is-loading");

  return callback()
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      button.textContent = originalText;
      button.disabled = false;
      button.classList.remove("is-loading");
    });
}

function normalizeRegionName(name) {
  return (name || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function handleEmployeeCountInput(e) {
  const value = parseInt(e.target.value, 10);

  if (isNaN(value)) return;

  if (value > 10000) {
    e.target.value = 10000;
  }
}

function getSelectedNormalizedRegions(instance) {
  return instance.programs
    .map((program) => {
      const regionId = parseInt(program.elements.regionSelect.value, 10);
      const region = !isNaN(regionId)
        ? dmsData.regions.find((r) => r.id === regionId)
        : null;
      return normalizeRegionName(region?.name);
    })
    .filter(Boolean);
}

function formatCell(cell) {
  cell.font = { name: "Arial" };

  cell.alignment = {
    wrapText: true,
    vertical: "middle",
    horizontal: "left",
  };

  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
  };
}

async function loadExcelTemplate() {
  const workbook = new ExcelJS.Workbook();
  const excelUrl = `https://storage.yandexcloud.net/wellbeingmedia/assets/tilda/%D0%94%D0%9C%D0%A1.xlsx?nocache=${Date.now()}`;
  const response = await fetch(excelUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки Excel-файла: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  await workbook.xlsx.load(buffer);
  return workbook;
}

function filterClinicSheet(workbook, selectedRegionNames) {
  const sheet = workbook.getWorksheet("Клиники");
  if (!sheet) return;

  const rowsToDelete = [];

  for (let rowIndex = 3; rowIndex <= sheet.actualRowCount; rowIndex++) {
    const cell = sheet.getCell(`B${rowIndex}`);
    const rawRegionName = String(cell.value || "");
    const normalizedRegionName = normalizeRegionName(rawRegionName);

    if (!selectedRegionNames.includes(normalizedRegionName)) {
      rowsToDelete.push(rowIndex);
    }
  }

  rowsToDelete.sort((a, b) => b - a);
  for (const rowIndex of rowsToDelete) {
    const row = sheet.getRow(rowIndex);
    row.eachCell((cell) => (cell.value = null));
    sheet.spliceRows(rowIndex, 1);
  }
}

function fillIntroSheet(workbook, instance) {
  const sheet = workbook.getWorksheet("Вводная");
  if (!sheet) {
    console.warn("Лист 'Вводная' не найден в шаблоне Excel");
    return;
  }

  const totalEmployees = instance.programs.reduce((sum, program) => {
    const count = parseInt(program.elements.employeeCount.value || "0", 10);
    return sum + (Number.isFinite(count) && count > 0 ? count : 0);
  }, 0);

  sheet.getCell("C3").value = totalEmployees;
  console.log(`Общее количество сотрудников: ${totalEmployees}`);
}

async function downloadUpdatedExcel(workbook) {
  const updatedBuffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([updatedBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "Расчёт ДМС.xlsx";
  downloadLink.click();

  console.log("Файл успешно сформирован и скачан");
}

function fillBudgetSheetRegionHeadersOnly(workbook, instance) {
  const sheet = workbook.getWorksheet("Бюджет");
  if (!sheet) {
    console.warn("Лист 'Бюджет' не найден");
    return;
  }

  const grouped = groupProgramsByRegion(instance);
  let currentRow = 1;

  for (const [regionName, programs] of grouped) {
    const regionCell = sheet.getCell(currentRow, 1);
    regionCell.value = regionName;
    formatCell(regionCell);
    regionCell.font = {
      name: "Arial",
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    regionCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF31869B" },
    };
    sheet.getRow(currentRow).height = 30;
    sheet.getColumn(1).width = 30;

    const uniqueOptions = ["Поликлиника"];
    const optionIdMap = new Map();
    optionIdMap.set("Поликлиника", "policlinika");

    for (const program of programs) {
      program.checkboxMap.forEach(({ input, service }) => {
        if (input.checked && !optionIdMap.has(service.name)) {
          uniqueOptions.push(service.name);
          optionIdMap.set(service.name, service.id);
        }
      });
    }

    const headerRow = sheet.getRow(currentRow + 1);
    headerRow.height = 30;

    const headers = [
      "Наименование программы",
      "Кол-во сотрудников",
      ...uniqueOptions,
      "Страховая премия на 1 ЗЛ",
      "Стоимость программы",
    ];

    headers.forEach((title, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = title;
      formatCell(cell);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFB8CCE4" },
      };
      sheet.getColumn(index + 1).width = 30;
    });

    let regionTotal = 0;
    for (let i = 0; i < programs.length; i++) {
      const program = programs[i];
      const dataRow = sheet.getRow(currentRow + 2 + i);
      dataRow.height = 30;

      const programId = program.elements.programSelect.value;
      const programName =
        dmsData.programs.find((p) => p.id === programId)?.name || "";
      const employeeCount =
        parseInt(program.elements.employeeCount.value, 10) || 0;
      const regionId = parseInt(program.elements.regionSelect.value, 10);
      const groupId = dmsData.regions.find((r) => r.id === regionId)?.groupId;

      let colIndex = 1;

      const values = [programName, employeeCount];
      values.forEach((val) => {
        const cell = dataRow.getCell(colIndex++);
        cell.value = val;
        formatCell(cell);
      });

      for (const optionName of uniqueOptions) {
        const serviceId = optionIdMap.get(optionName);
        const isChecked =
          serviceId === "policlinika" ||
          program.checkboxMap.get(serviceId)?.input.checked;
        let price = null;

        if (isChecked) {
          price =
            dmsData.groupTariffs?.[groupId]?.[serviceId]?.[programId] ?? null;
        }

        const cell = dataRow.getCell(colIndex++);
        cell.value = price ?? "";
        formatCell(cell);
      }

      const result = program.calculate();
      if (result) {
        const premiumCell = dataRow.getCell(colIndex++);
        premiumCell.value = result.pricePerPerson;
        formatCell(premiumCell);

        const costCell = dataRow.getCell(colIndex++);
        costCell.value = result.totalCost;
        formatCell(costCell);

        regionTotal += result.totalCost;
      }
    }

    const totalRow = sheet.getRow(currentRow + 2 + programs.length);
    totalRow.height = 30;

    for (let col = 1; col <= headers.length; col++) {
      const cell = totalRow.getCell(col);
      formatCell(cell);
      sheet.getColumn(col).width = 30;
    }

    const labelCell = totalRow.getCell(1);
    labelCell.value = "Итого";
    labelCell.font = { name: "Arial", bold: true };

    const sumCell = totalRow.getCell(headers.length);
    sumCell.value = regionTotal;
    sumCell.font = { name: "Arial", bold: true };

    currentRow += 2 + programs.length + 2;
  }
}

function groupProgramsByRegion(instance) {
  const result = new Map();
  for (const program of instance.programs) {
    const regionId = parseInt(program.elements.regionSelect.value);
    const region = dmsData.regions.find((r) => r.id === regionId);
    if (!region) continue;

    const list = result.get(region.name) || [];
    list.push(program);
    result.set(region.name, list);
  }
  return result;
}

function fillTildaHiddenField() {
  const formBlock = document.getElementById("rec1090409596");
  if (!formBlock) return;

  const form = formBlock.querySelector("form#form1090409596");
  if (!form) return;

  const hiddenField = form.querySelector('input[name="1145221"]');
  if (!hiddenField) return;

  const calc = window.__dmsCalcInstance;
  if (!calc || !calc.programs || !calc.programs.length) {
    hiddenField.value = "";
    return;
  }

  const result = [];

  calc.programs.forEach((program, idx) => {
    const regionId = parseInt(program.elements.regionSelect.value);
    const programId = program.elements.programSelect.value;
    const employeeCount = parseInt(program.elements.employeeCount.value || "1");

    const regionName =
      dmsData.regions.find((r) => r.id === regionId)?.name || "";
    const programName =
      dmsData.programs.find((p) => p.id === programId)?.name || "";

    const options = [];
    program.checkboxMap.forEach(({ input, service }) => {
      if (input.checked) {
        options.push(service.name);
      }
    });

    result.push(
      `Программа ${
        idx + 1
      }: Сотрудников - ${employeeCount}, Регион: ${regionName}, Программа: ${programName}, Опции: ${options.join(
        ", "
      )}`
    );
  });

  hiddenField.value = result.join(" | ");
}

// Обработчики событий
// document
//   .getElementById("downloadExcel")
//   .addEventListener("click", async (event) => {
//     event.preventDefault();
//     const button = event.currentTarget;

//     await withLoading(button, "Формируем файл...", async () => {
//       const instance = window.__dmsCalcInstance;
//       const workbook = await loadExcelTemplate();
//       const selectedRegionNames = getSelectedNormalizedRegions(instance);
//       filterClinicSheet(workbook, selectedRegionNames);
//       fillIntroSheet(workbook, instance);
//       fillBudgetSheetRegionHeadersOnly(workbook, instance);
//       await downloadUpdatedExcel(workbook);
//     });
//   });

function beforeSend() {
  const form = document.querySelector("#form1090409596");
  const downloadBtn = document.getElementById("downloadExcel");

  if (!form || !downloadBtn) return;

  form.addEventListener("tildaform:aftersuccess", async function () {
    await withLoading(downloadBtn, "Формируем файл...", async () => {
      const instance = window.__dmsCalcInstance;
      const workbook = await loadExcelTemplate();
      const selectedRegionNames = getSelectedNormalizedRegions(instance);
      filterClinicSheet(workbook, selectedRegionNames);
      fillIntroSheet(workbook, instance);
      fillBudgetSheetRegionHeadersOnly(workbook, instance);
      await downloadUpdatedExcel(workbook);
    });
  });
}

// Инициализация
if (document.readyState !== "loading") {
  beforeSend();
} else {
  document.addEventListener("DOMContentLoaded", beforeSend);
}

document.addEventListener("DOMContentLoaded", () => {
  const instance = createDMSCalculator();
  window.__dmsCalcInstance = instance;
});
