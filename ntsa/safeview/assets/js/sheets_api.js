class SheetsAPI {
    constructor(apiKey) {
        this.API_KEY = apiKey;
        this.BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
    }

    async getSheetData(spreadsheetId) {
        try {
            const response = await fetch(
                `${this.BASE_URL}/${spreadsheetId}/values/Sheet1!A2:K?key=${this.API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.values || [];
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            throw error;
        }
    }
}
