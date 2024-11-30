// 상수 정의
const API_KEY = 'AIzaSyDyGZ7lrR_SkdSYMdC7EdMTujQ4Yav_bHk';
const REPORT_SPREADSHEET_ID = '1kgyoKvhVAI4sC9mYjghoZFtB8-Uka4kA4u4MN0zxMrA';
const SPREADSHEET_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

class SheetsAPI {
    constructor(apiKey) {
        this.API_KEY = apiKey;
        this.BASE_URL = SPREADSHEET_BASE_URL;
    }

    async getSpreadsheetIdForServer(serverId) {
        try {
            console.log('Fetching spreadsheet ID for server:', serverId);
            const response = await fetch(
                `${this.BASE_URL}/${REPORT_SPREADSHEET_ID}/values/Servers!A2:B?key=${this.API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch server mappings: ${response.status}`);
            }

            const data = await response.json();
            const mappings = data.values || [];
            
            const mapping = mappings.find(row => row[0] === serverId);
            if (!mapping) {
                throw new Error('SERVER_NOT_REGISTERED');
            }

            console.log('Found spreadsheet ID:', mapping[1]);
            return mapping[1];
        } catch (error) {
            console.error('Error getting spreadsheet ID:', error);
            throw error;
        }
    }

    async getSheetData(serverId) {
        try {
            const spreadsheetId = await this.getSpreadsheetIdForServer(serverId);
            console.log('Fetching data for spreadsheet:', spreadsheetId);
            
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
            console.log('Fetching report data...'); // 디버깅
            const response = await fetch(
                `${this.BASE_URL}/${REPORT_SPREADSHEET_ID}/values/Reports!A2:M?key=${this.API_KEY}`
            );
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Raw report data:', data); // 디버깅
            
            return this.formatActiveData(data.values || []);
        } catch (error) {
            console.error('Error fetching report data:', error);
            // 임시 빈 데이터 반환
            return {
                meta: {
                    last_updated: null,
                    total_records: 0,
                    monthly_reports: 0,
                    status_summary: {
                        WARNING: 0,
                        DANGEROUS: 0,
                        NORMAL: 0
                    }
                },
                users: {}
            };
        }
    }

    formatActiveData(rows) {
        console.log('Formatting active data, rows:', rows); // 디버깅
        
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
            if (!row || row.length < 3) {
                console.warn('Invalid row:', row);
                return;
            }
    
            // Reports 시트의 구조에 맞게 인덱스 수정
            const userId = row[0];         // 유저 ID
            const reportType = row[1];     // 신고 유형
            const description = row[2];    // 신고 설명
            const reporterType = row[3];   // 신고자 타입 (SERVER/USER)
            const reporterId = row[4];     // 신고자 ID
            const reporterName = row[5];   // 신고자 이름
            const timestamp = row[6];      // 신고 시각
            const status = row[7] || 'WARNING'; // 상태
    
            activeData.users[userId] = {
                target: {
                    username: 'Unknown',  // 실제 유저 정보는 서버 데이터에서 가져옴
                    display_name: 'Unknown',
                    status: status
                },
                reporter: {
                    reporter_type: reporterType,
                    reporter_id: reporterId,
                    reporter_name: reporterName,
                    timestamp: timestamp,
                    type: reportType,
                    evidence: null,
                    description: description
                }
            };
    
            activeData.meta.status_summary[status] = 
                (activeData.meta.status_summary[status] || 0) + 1;
        });
    
        console.log('Formatted active data:', activeData); // 디버깅
        return activeData;
    }
}

// 전역으로 내보내기
window.API_KEY = API_KEY;
window.REPORT_SPREADSHEET_ID = REPORT_SPREADSHEET_ID;
window.SheetsAPI = SheetsAPI;
