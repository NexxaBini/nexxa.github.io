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
            if (!row || row.length < 13) {
                console.warn('Invalid row:', row);
                return;
            }
    
            try {
                // 정확한 컬럼 매핑
                const userId = row[0];          // User ID
                const username = row[1];        // Username
                const displayName = row[2];     // Display Name
                const joinDate = row[3];        // Join Date
                const lastActive = row[4];      // Last Active
                const knownServers = row[5];    // Known Servers
                const reporterType = row[6];    // Reporter Type
                const reporterId = row[7];      // Reporter ID
                const reporterName = row[8];    // Reporter Name
                const timestamp = row[9];       // Report Timestamp
                const reportType = row[10];     // Report Type
                const evidence = row[11];       // Evidence
                const description = row[12];    // Description
                
                // 기본 상태 설정 (신고된 유저는 WARNING으로 간주)
                const status = 'WARNING';
    
                activeData.users[userId] = {
                    target: {
                        username: username,
                        display_name: displayName,
                        join_date: joinDate,
                        last_active: lastActive,
                        known_servers: knownServers ? knownServers.split(',') : [],
                        status: status
                    },
                    reporter: {
                        reporter_type: reporterType,
                        reporter_id: reporterId,
                        reporter_name: reporterName,
                        timestamp: timestamp,
                        type: reportType,
                        evidence: evidence || null,
                        description: description
                    }
                };
    
                // 상태 요약 업데이트
                activeData.meta.status_summary[status] = 
                    (activeData.meta.status_summary[status] || 0) + 1;
    
            } catch (error) {
                console.error('Error processing row:', row, error);
            }
        });
    
        console.log('Processed active data:', activeData);
        return activeData;
    }
}

function formatActiveData(rows) {
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
        if (!row || row.length < 13) {
            console.warn('Invalid row:', row);
            return;
        }

        try {
            const userId = row[0];          // User ID
            const username = row[1];        // Username
            const displayName = row[2];     // Display Name
            const joinDate = row[3];        // Join Date
            const avatarUrl = row[4];       // Avatar URL (previously last_active)
            const knownServers = row[5];    // Known Servers
            const reporterType = row[6];    // Reporter Type
            const reporterId = row[7];      // Reporter ID
            const reporterName = row[8];    // Reporter Name
            const timestamp = row[9];       // Report Timestamp
            const reportType = row[10];     // Report Type
            const evidence = row[11];       // Evidence
            const description = row[12];    // Description

            // 기본 상태 설정 (신고된 유저는 WARNING으로 간주)
            const status = 'WARNING';

            activeData.users[userId] = {
                target: {
                    username: username,
                    display_name: displayName,
                    join_date: joinDate,
                    avatar_url: avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png',
                    known_servers: knownServers ? knownServers.split(',') : [],
                    status: status
                },
                reporter: {
                    reporter_type: reporterType,
                    reporter_id: reporterId,
                    reporter_name: reporterName,
                    timestamp: timestamp,
                    type: reportType,
                    evidence: evidence || null,
                    description: description
                }
            };

            // 상태 요약 업데이트
            activeData.meta.status_summary[status] = 
                (activeData.meta.status_summary[status] || 0) + 1;

        } catch (error) {
            console.error('Error processing row:', row, error);
        }
    });

    return activeData;
}

// 전역으로 내보내기
window.API_KEY = API_KEY;
window.REPORT_SPREADSHEET_ID = REPORT_SPREADSHEET_ID;
window.SheetsAPI = SheetsAPI;
