// លីងទិន្នន័យ CSV ពី Sheet ទី ២ របស់អ្នក
const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGCalRYw3mO9krztmOJl2SBM3UMMmjDqSh4t5dTqoVPdxIImXGUALlavQ0fNTetQ/pub?output=csv';

let drugDatabase = []; 

// អនុគមន៍ជំនួយសម្រាប់ញែកទិន្នន័យ CSV (CSV Parser)
function parseCSV(text) {
    let lines = text.split('\n');
    let result = [];
    
    for (let i = 1; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        let arr = [];
        let inQuotes = false;
        let str = '';
        
        for (let j = 0; j < line.length; j++) {
            let char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes; 
            } else if (char === ',' && !inQuotes) {
                arr.push(str.trim());
                str = '';
            } else {
                str += char;
            }
        }
        arr.push(str.trim());
        result.push(arr);
    }
    return result;
}

// ទាញទិន្នន័យពី Google Sheets
async function fetchDrugData() {
    try {
        const response = await fetch(googleSheetUrl);
        const data = await response.text();
        
        const parsedRows = parseCSV(data);
        
        drugDatabase = parsedRows.map(columns => {
            if (columns.length >= 9) {
                // ប្រព័ន្ធត្រួតពិនិត្យរូបភាពយ៉ាងតឹងរ៉ឹង៖ ប្រសិនបើលីងទទេ ឬខូច នឹងជំនួសដោយរូបភាពលំនាំដើមភ្លាម (ទប់ទល់ការញាក់)
                let rawImage = columns[0] ? columns[0].replace(/^"|"$/g, '').trim() : '';
                let finalImage = (rawImage.startsWith('http://') || rawImage.startsWith('https://')) 
                                 ? rawImage 
                                 : "https://via.placeholder.com/250?text=No+Image";

                return {
                    image: finalImage, 
                    id: columns[1] ? columns[1].replace(/^"|"$/g, '').trim() : Math.random().toString(),          
                    brand: columns[2] ? columns[2].replace(/^"|"$/g, '').trim() : '---',       
                    generic: columns[3] ? columns[3].replace(/^"|"$/g, '').trim() : '---',     
                    class: columns[4] ? columns[4].replace(/^"|"$/g, '').trim() : '---',       
                    strength: columns[5] ? columns[5].replace(/^"|"$/g, '').trim() : '---',    
                    form: columns[6] ? columns[6].replace(/^"|"$/g, '').trim() : '---',        
                    dosage: columns[7] ? columns[7].replace(/^"|"$/g, '').trim() : '---',      
                    sideEffects: columns[8] ? columns[8].replace(/^"|"$/g, '').trim() : '---', 
                    notes: columns[9] ? columns[9].replace(/^"|"$/g, '').trim() : 'គ្មាន'
                };
            }
        }).filter(Boolean);

        displayDrugs(drugDatabase); 
    } catch (error) {
        console.error("ការទាញទិន្នន័យមានបញ្ហា:", error);
    }
}

// បង្ហាញកាតថ្នាំលើទំព័រ Web
function displayDrugs(drugs) {
    const grid = document.getElementById('drugGrid');
    grid.innerHTML = ''; 
    
    if(drugs.length === 0) {
        grid.innerHTML = `<p style="text-align:center; color:#e74c3c; grid-column: 1/-1; padding: 20px;">រកមិនឃើញឱសថដែលអ្នកស្វែងរកទេ!</p>`;
        return;
    }
    
    drugs.forEach(drug => {
        const card = document.createElement('div');
        card.className = 'drug-card';
        card.setAttribute('onclick', `showDrugDetails('${drug.id}')`);
        card.innerHTML = `
            <img src="${drug.image}" alt="${drug.brand}">
            <h3>${drug.brand}</h3>
            <p>${drug.generic}</p>
        `;
        grid.appendChild(card);
    });
}

// មុខងារស្វែងរកថ្នាំ (Search Bar)
function searchMedicine() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filteredDrugs = drugDatabase.filter(drug => {
        return drug.brand.toLowerCase().includes(query) || 
               drug.generic.toLowerCase().includes(query) ||
               drug.class.toLowerCase().includes(query);
    });
    displayDrugs(filteredDrugs); 
}

// បង្ហាញផ្ទាំង Modal ព័ត៌មានលម្អិត រួមទាំងរូបភាពថ្នាំដែលចុច
function showDrugDetails(drugId) {
    const drug = drugDatabase.find(d => d.id === drugId);
    
    if (drug) {
        // បាញ់រូបភាពថ្នាំដដែលទៅបង្ហាញក្នុងផ្ទាំងលម្អិត
        document.getElementById('modalDrugImage').src = drug.image;
        document.getElementById('modalDrugImage').alt = drug.brand;

        // បញ្ចូលព័ត៌មានអត្ថបទ
        document.getElementById('brandName').innerText = drug.brand || '---';
        document.getElementById('genericName').innerText = drug.generic || '---';
        document.getElementById('drugClass').innerText = drug.class || '---';
        document.getElementById('strength').innerText = drug.strength || '---';
        document.getElementById('form').innerText = drug.form || '---';
        document.getElementById('dosageRoute').innerText = drug.dosage || '---';
        document.getElementById('sideEffects').innerText = drug.sideEffects || '---';
        document.getElementById('notes').innerText = drug.notes || 'គ្មាន';
        
        document.getElementById('drugModal').style.display = 'flex';
    }
}

// បិទ Modal
function closeModal() {
    document.getElementById('drugModal').style.display = 'none';
}

// បិទ Modal ពេលចុចខាងក្រៅ
window.onclick = function(event) {
    const modal = document.getElementById('drugModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// ដំណើរការកូដភ្លាមៗពេលបើក Web
fetchDrugData();