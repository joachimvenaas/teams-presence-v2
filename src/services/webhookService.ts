const { DEBUG, WEBHOOKURL, UID } = require('./../helper/config');
import axios from 'axios';

let lastStatus = "";


export class webhookService{
    async setAvailable(): Promise<void> {
        await this.postStatus("Available");
        if(lastStatus === "Available"){
            return;
        }

        console.log("Send status update to webhook: Available");
        
        lastStatus = "Available";
    };

    async setAway(): Promise<void>{
        await this.postStatus("Away");
        if(lastStatus === "Away"){
            return;
        }

        console.log("Send status update to webhook: Away");

        lastStatus = "Away";
    }

    async setBusy(): Promise<void> {
        await this.postStatus("Busy");
        if(lastStatus === "Busy"){
            return;
        }
        console.log("Send status update to webhook: Busy");

        lastStatus = "Busy";
    };

    async clearStatus(): Promise<void> {
        await this.postStatus("");
        console.log("Clearing status");
    };

    async postStatus(status: string): Promise<void> {
        try {
            const payload = { "uid": UID, "status": status }
            const response = await axios.post(WEBHOOKURL, payload, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
        } catch (error) {
            console.error(`Error sending status ${status} to webhook: ${error}`);
        }
    }
}

function sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   
