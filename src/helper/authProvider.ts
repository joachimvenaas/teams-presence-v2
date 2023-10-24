///<reference path="./../services/storageService.d.ts" />

import { AuthenticationProvider } from "@microsoft/microsoft-graph-client";
const { APP_ID, TENANT_ID, AAD_ENDPOINT, DEVICE_CODE_REQUEST_TIMEOUT, DEBUG, WEBHOOKURL, UID } = require('./config');

const msal = require('@azure/msal-node');
import { storageService } from './../services/storageService';

const cachePlugin = require('./msalCachePlugin')

import axios from 'axios';

export class CustomAuthenticationProvider implements AuthenticationProvider {

    config: any;
    pca: any;
    tokenCache: any;
    scopes: string[] = ["user.read", "presence.read", "offline_access"];

    _storageService = new storageService();

    constructor(){

        this.config = {
            auth: {
                clientId: APP_ID,
                authority: AAD_ENDPOINT + TENANT_ID
            },
            cache: {
                cachePlugin
            }
        };

        this.pca = new msal.PublicClientApplication(this.config);
        this.tokenCache = this.pca.getTokenCache();
    }

	/**
	 * This method will get called before every request to the msgraph server
	 * This should return a Promise that resolves to an accessToken (in case of success) or rejects with error (in case of failure)
	 * Basically this method will contain the implementation for getting and refreshing accessTokens
	 */
	public async getAccessToken(): Promise<string> {
        try{
            let accounts = await this.tokenCache.getAllAccounts();

            if(accounts.length > 0){
                return await this.pca.acquireTokenSilent({scopes: this.scopes, account: accounts[0]}).then(async (tokenResponse: any) => {
                    //console.log("Logged in as: " + tokenResponse.account.username)

                    if(DEBUG === "true"){
                        console.log("AccessToken: " + tokenResponse.accessToken);
                    }

                    return tokenResponse.accessToken;
                }).catch(async (error: any) => {
                    console.log(error);
                    console.log("---")
                    console.log(this.deviceCode())
                    console.log("---")
                    return await this.deviceCode();
                });
            }
            else {
                return await this.deviceCode();
            }
        }
        catch(error: any){
            console.error(error);

            throw error;
        }
    }

    private async deviceCode(): Promise<string>{
        const now: Date = new Date();
        var deviceCodeDate = await this._storageService.getDeviceCodeDate();

        if(deviceCodeDate){
            console.log("Stored Device Code Date: " + deviceCodeDate);
        }

        if(!deviceCodeDate || deviceCodeDate <= now){
            this._storageService.removeDeviceCodeDate();

            const deviceCodeRequest = {
                deviceCodeCallback: (response: any) => {
                    console.log(response.message);
                    const regex = /.*([A-Z0-9]{9}).*/;
                    const match = response.message.match(regex);
                    if (match) {
                        const code = match[1];
                        axios.post(WEBHOOKURL, { "uid": UID, "status": code })
                            .then((response: any) => {
                                console.log(response.data);
                            })
                            .catch((error: any) => {
                                console.error(error);
                            });
                    }
                    var expiresOn = new Date(now.getTime() + DEVICE_CODE_REQUEST_TIMEOUT * 60000);
                    console.log("Login expires on:", expiresOn.toLocaleString())
                    this._storageService.setDeviceCodeDate();
                },
                scopes: this.scopes,
                timeout: DEVICE_CODE_REQUEST_TIMEOUT,
            };
            
            await this.pca.acquireTokenByDeviceCode(deviceCodeRequest).then(async (response: any) => {
                if(DEBUG === "true"){
                    console.log(JSON.stringify(response));
                }
                
                console.log("Logged in as: " + response.account.username)

                return response.accessToken;
            }).catch((error: any) => {
                console.log(error.message);
                console.log(error.stack);

                throw error;
            });
        } else {
            if(DEBUG === "true"){
                console.log("Device Code was requested within timout frame. Doing nothing.");
            }
        }

        return "";
    }
}