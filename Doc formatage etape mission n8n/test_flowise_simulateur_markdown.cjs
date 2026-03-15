const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`<!DOCTYPE html>`);
global.document = dom.window.document;

function cleanEmptyRowsForReport(table) {
  let count = 0;
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length === 0) return;

    // Cas (a): Toutes vides
    const allEmpty = cells.every(cell => {
      const text = cell.textContent.trim();
      return text === '' || text === '---';
    });

    if (allEmpty) {
      console.log(`🗑️ Ligne supprimée (toutes cellules vides)`);
      row.remove();
      count++;
      return;
    }

    // Cas (b): Uniquement un numéro
    const firstCellText = cells[0].textContent.trim();
    const isFirstCellNumeric = /^\d+$/.test(firstCellText);
    
    // Soit il n'y a qu'une cellule, soit toutes les autres sont vides
    const isRestEmptyOrMissing = cells.length === 1 || cells.slice(1).every(cell => {
      const text = cell.textContent.trim();
      return text === '' || text === '---';
    });

    if (isFirstCellNumeric && isRestEmptyOrMissing) {
      console.log(`🗑️ Ligne supprimée (numéro "${firstCellText}" seul)`);
      row.remove();
      count++;
    }
  });
  return count;
}

const table = document.createElement("table");
const tbody = document.createElement("tbody");
table.appendChild(tbody);

// Row 1: Normal
const tr1 = document.createElement("tr");
tr1.innerHTML = "<td>Test</td><td>Valeur</td>";
tbody.appendChild(tr1);

// Row 2: Bug n8n (1 cell only)
const tr2 = document.createElement("tr");
tr2.innerHTML = "<td>2</td>";
tbody.appendChild(tr2);

// Row 3: Bug n8n (1 cell numeric + empty cells)
const tr3 = document.createElement("tr");
tr3.innerHTML = "<td>3</td><td></td><td>---</td>";
tbody.appendChild(tr3);

console.log("AVANT:");
Array.from(tbody.querySelectorAll("tr")).forEach(tr => console.log(tr.innerHTML));

cleanEmptyRowsForReport(table);

console.log("APRES:");
Array.from(tbody.querySelectorAll("tr")).forEach(tr => console.log(tr.innerHTML));
