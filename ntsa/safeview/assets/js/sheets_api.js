class SheetsAPI {
    constructor() {
        this.tokenClient = null;
        this.gapiInited = false;
        this.gisInited = false;
        this.isAuthenticated = false;
        
        // 초기화
        this.initializeAPI();
    }

    async initializeAPI() {
        // Load the Google API client
        await new Promise((resolve) => {
            gapi.load('client', resolve);
        });

        // Initialize the Google API client
        await gapi.client.init({
            apiKey: OAUTH_CONFIG.API_KEY,
            discoveryDocs: OAUTH_CONFIG.DISCOVERY_DOCS
        });

        this.gapiInited = true;

        // Initialize token client
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: OAUTH_CONFIG.CLIENT_ID,
            scope: OAUTH_CONFIG.SCOPES,
            callback: (response) => {
                if (response.error) {
                    throw response;
                }
                this.isAuthenticated = true;
            },
        });
    }

    async authenticate() {
        if (!this.isAuthenticated) {
            return new Promise((resolve, reject) => {
                try {
                    this.tokenClient.callback = async (response) => {
                        if (response.error) {
                            reject(response);
                        }
                        this.isAuthenticated = true;
                        resolve();
                    };
                    this.tokenClient.requestAccessToken({prompt: 'consent'});
                } catch (err) {
                    reject(err);
                }
            });
        }
    }

    async getSheetData(spreadsheetId) {
        try {
            if (!this.isAuthenticated) {
                await this.authenticate();
            }

            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: spreadsheetId,
                range: 'Sheet1!A2:K',
            });

            return response.result.values || [];
        } catch (error) {
            console.error('Error fetching sheet data:', error);
            throw error;
        }
    }
}
