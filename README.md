# StatusIndicator
NodeJs implementation for a Teams status indidicator for webhooks

```
npm install
npm run build
```

example of .env:
```
# Credentials
TENANT_ID=XXX
APP_ID=YYY
# Endpoints
AAD_ENDPOINT=https://login.microsoftonline.com/
GRAPH_ENDPOINT=https://graph.microsoft.com/
# Webhook config
WEBHOOKURL=ZZZ
UID=XYZ
# General Config
POLL_INTERVAL=1
POLL_WEEKENDS=false
START_TIME="5:00"
END_TIME="23:00"
DEBUG=false
BRIGHTNESS=0.05
DEVICE_CODE_REQUEST_TIMEOUT=5
```
