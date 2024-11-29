const SHEETS_API_KEY = 'AIzaSyDyGZ7lrR_SkdSYMdC7EdMTujQ4Yav_bHk';
const API_KEY = SHEETS_API_KEY;
const SPREADSHEET_ID = '1kgyoKvhVAI4sC9mYjghoZFtB8-Uka4kA4u4MN0zxMrA';
const SPREADSHEET_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

class SheetsAPI {
    constructor(apiKey) {
        this.API_KEY = apiKey;
        this.BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
    }

    async getSheetData(serverId) {
        try {
            console.log('Fetching server data for serverId:', serverId); // 디버깅

            if (!serverId) {
                throw new Error('Server ID is required');
            }

            const url = `${this.BASE_URL}/${serverId}/values/Sheet1!A2:K?key=${this.API_KEY}`;
            console.log('Request URL:', url); // 디버깅

            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText); // 디버깅
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Server data received:', data); // 디버깅
            return data.values || [];
        } catch (error) {
            console.error('Error in getSheetData:', error);
            throw error;
        }
    }

    async getReportData() {
        try {
            if (!REPORT_SPREADSHEET_ID) {
                throw new Error('Report spreadsheet ID is not configured');
            }

            console.log('Fetching report data from ID:', REPORT_SPREADSHEET_ID); // 디버깅
            const response = await fetch(
                `${this.BASE_URL}/${REPORT_SPREADSHEET_ID}/values/Sheet1!A2:M?key=${this.API_KEY}`
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText); // 디버깅
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.formatActiveData(data.values || []);
        } catch (error) {
            console.error('Error in getReportData:', error);
            throw error;
        }
    }
}

// 전역으로 내보내기
window.SheetsAPI = SheetsAPI;
window.SHEETS_API_KEY = SHEETS_API_KEY;
window.API_KEY = 'AIzaSyDyGZ7lrR_SkdSYMdC7EdMTujQ4Yav_bHk';
window.REPORT_SPREADSHEET_ID = '1kgyoKvhVAI4sC9mYjghoZFtB8-Uka4kA4u4MN0zxMrA'; // 신고 데이터 시트
window.SPREADSHEET_ID = SPREADSHEET_ID;
window.SPREADSHEET_BASE_URL = SPREADSHEET_BASE_URL;
