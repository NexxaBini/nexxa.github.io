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
            // serverId가 스프레드시트 ID
            const response = await fetch(
                `${this.BASE_URL}/${serverId}/values/Sheet1!A2:K?key=${this.API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.values || [];
        } catch (error) {
            console.error('Error fetching server data:', error);
            throw error;
        }
    }

    async getReportData() {
        // 여기서는 메인 신고 데이터 스프레드시트 ID 사용
        try {
            const response = await fetch(
                `${this.BASE_URL}/${REPORT_SPREADSHEET_ID}/values/Sheet1!A2:M?key=${this.API_KEY}`
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

    async getActiveData() {
        try {
            console.log('Fetching active data from:', SPREADSHEET_ID); // 디버깅용
            const response = await fetch(
                `${this.BASE_URL}/${SPREADSHEET_ID}/values/Sheet1!A2:M?key=${this.API_KEY}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
            }

            const data = await response.json();
            return this.formatActiveData(data.values || []);
        } catch (error) {
            console.error('Error fetching active data:', error);
            if (error.message.includes('403')) {
                throw new Error('메인 스프레드시트 접근 권한이 없습니다.');
            }
            throw error;
        }
    }
    
    formatActiveData(rows) {
        const activeData = {
            meta: {
                last_updated: null,
                total_records: rows.length,
                monthly_reports: 0,
                status_summary: {
                    WARNING: 0,
                    DANGEROUS: 0,
                    NORMAL: 0
                }
            },
            users: {}
        };

        rows.forEach(row => {
            if (row.length < 13) return;

            const userId = row[0];
            const status = row[12] || 'NORMAL';
            
            activeData.users[userId] = {
                target: {
                    username: row[1],
                    display_name: row[2],
                    join_date: row[4],
                    last_active: row[10],
                    known_servers: row[5] ? row[5].split(',') : [],
                    status: status
                },
                reporter: row[11] ? {
                    reporter_type: row[6],
                    reporter_id: row[7],
                    reporter_name: row[8],
                    timestamp: row[10],
                    type: row[9],
                    evidence: null,
                    description: row[11]
                } : null
            };

            activeData.meta.status_summary[status] = 
                (activeData.meta.status_summary[status] || 0) + 1;
        });

        return activeData;
    }
}

// 전역으로 내보내기
window.SheetsAPI = SheetsAPI;
window.SHEETS_API_KEY = SHEETS_API_KEY;
window.API_KEY = 'AIzaSyDyGZ7lrR_SkdSYMdC7EdMTujQ4Yav_bHk';
window.REPORT_SPREADSHEET_ID = '1kgyoKvhVAI4sC9mYjghoZFtB8-Uka4kA4u4MN0zxMrA'; // 신고 데이터 시트
window.SPREADSHEET_ID = SPREADSHEET_ID;
window.SPREADSHEET_BASE_URL = SPREADSHEET_BASE_URL;
