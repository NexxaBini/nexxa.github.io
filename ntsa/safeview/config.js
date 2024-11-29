// config.js 파일 생성
const config = {
    SHEETS_API_KEY: process.env.SHEETS_API_KEY || 'YOUR_API_KEY',
    SPREADSHEET_ID: process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID'
};

export default config;
