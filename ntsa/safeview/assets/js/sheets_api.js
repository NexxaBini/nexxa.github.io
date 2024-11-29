const SHEETS_API_KEY = 'AIzaSyDyGZ7lrR_SkdSYMdC7EdMTujQ4Yav_bHk';
const API_KEY = SHEETS_API_KEY;
const SPREADSHEET_ID = '1kgyoKvhVAI4sC9mYjghoZFtB8-Uka4kA4u4MN0zxMrA';
const SPREADSHEET_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

class SheetsAPI {
    constructor(apiKey) {
        this.API_KEY = apiKey;
        this.BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
    }

    // 디스코드 서버 ID로 스프레드시트 ID 조회
    async getSpreadsheetIdForServer(serverId) {
        try {
            // 메인 스프레드시트에서 서버 ID와 스프레드시트 ID 매핑 정보를 가져옴
            const response = await fetch(
                `${this.BASE_URL}/${REPORT_SPREADSHEET_ID}/values/Servers!A2:B?key=${this.API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch server mappings: ${response.status}`);
            }

            const data = await response.json();
            const mappings = data.values || [];
            
            // 서버 ID에 해당하는 스프레드시트 ID 찾기
            const mapping = mappings.find(row => row[0] === serverId);
            if (!mapping) {
                throw new Error('SERVER_NOT_REGISTERED');
            }

            return mapping[1]; // 스프레드시트 ID 반환
        } catch (error) {
            console.error('Error getting spreadsheet ID:', error);
            throw error;
        }
    }

    async getSheetData(serverId) {
        try {
            // 먼저 서버 ID에 해당하는 스프레드시트 ID를 가져옴
            const spreadsheetId = await this.getSpreadsheetIdForServer(serverId);
            
            const response = await fetch(
                `${this.BASE_URL}/${spreadsheetId}/values/Sheet1!A2:K?key=${this.API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.values || [];
        } catch (error) {
            if (error.message === 'SERVER_NOT_REGISTERED') {
                throw new Error('서버 데이터가 아직 등록되지 않았습니다. /safeview update 명령어를 사용해주세요.');
            }
            console.error('Error fetching server data:', error);
            throw error;
        }
    }

    async getReportData() {
        try {
            const response = await fetch(
                `${this.BASE_URL}/${REPORT_SPREADSHEET_ID}/values/Reports!A2:M?key=${this.API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.formatActiveData(data.values || []);
        } catch (error) {
            console.error('Error fetching report data:', error);
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
