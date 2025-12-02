const ExcelJS = require('exceljs');
const Word = require('../models/Word');

class ExcelService {
    static async parseAndSaveWordbook(filePath, wordbookId) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);

        const worksheet = workbook.getWorksheet(1); // First sheet
        const words = [];

        // Assuming columns: A: English, B: Korean, C: Example (Optional)
        // Start from row 2 (skip header)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const english = row.getCell(1).text;
            const korean = row.getCell(2).text;
            const example = row.getCell(3).text;

            if (english && korean) {
                words.push({
                    wordbook_id: wordbookId,
                    english: english.trim(),
                    korean: korean.trim(),
                    example_sentence: example ? example.trim() : null,
                    order_index: rowNumber - 1
                });
            }
        });

        // Save to DB
        // Ideally this should be a batch insert, but for now loop is fine or implement batch in Model
        for (const word of words) {
            await Word.create(word);
        }

        return words.length;
    }

    static async createTemplate() {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Words Template');

        sheet.columns = [
            { header: 'English', key: 'english', width: 30 },
            { header: 'Korean', key: 'korean', width: 30 },
            { header: 'Example Sentence', key: 'example', width: 50 }
        ];

        sheet.addRow({ english: 'Apple', korean: '사과', example: 'I eat an apple.' });
        sheet.addRow({ english: 'School', korean: '학교', example: 'I go to school.' });

        return workbook;
    }
}

module.exports = ExcelService;
