import { Octopus } from "./index";

export const qrScannerInstance = new Octopus({
    host: 'web-uat.cosmic.trade',
    path: '/ws/v1/qr',
})

qrScannerInstance._sendHeartbeat = function () {
    console.log("Starting QR WebSocket heartbeat");

    if (this._heartbeatInterval) {
        clearInterval(this._heartbeatInterval);
    }

    this._heartbeatInterval = setInterval(() => {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            console.log("Sending heartbeat...");
            this._socket.send('{"a":"h"}');
        } else {
            console.warn("WebSocket is not open. Heartbeat skipped.");
        }
    }, 15000);

    return this._heartbeatInterval;
};

qrScannerInstance.connect = function () {
    const protocol = (window.location.protocol === 'https:') ? 'wss' : 'ws';
    const URL = `wss://zyro.basanonline.com/ws/v1/qr?device=web`;

    return new Promise((resolve, reject) => {
        this._socket = new WebSocket(URL);
        this._socket.binaryType = 'arraybuffer';

        this._socket.onopen = () => {
            resolve("QR WebSocket connected");
        };

        this._socket.onclose = () => {
            console.warn("QR WebSocket closed");
            clearInterval(this._heartbeatInterval);
            this._heartbeatInterval = null;
            reject(new Error("QR WebSocket connection closed"));
        };

        this._socket.onerror = (err) => {
            console.error("QR WebSocket error:", err.message);
            reject(err);
        };
    });
};

qrScannerInstance.requestQrCode = function () {
    if (this._socket && this._socket.readyState === WebSocket.OPEN) {
        this._socket.send('{"a":"qr_request"}');
    } else {
        console.error("QR WebSocket is not open");
    }
};

qrScannerInstance.onMessage = function (callback, onAuthToken) {
    this._socket.onmessage = (event) => {
        const decoder = new TextDecoder("utf-8");
        try {
            const jsonString = decoder.decode(event.data);
            const json = JSON.parse(jsonString);            
            if (json.qr_code) {
                callback(json.qr_code);
            } else if (json.auth_token && json.login_id) {
                onAuthToken(json.auth_token, json.login_id);
            } else {
                console.warn("Received unexpected message format:", json);
            }
        } catch (error) {
            console.error("Error decoding message:", error);
            return;
        }
    };
};

export const useQrScannerInstance = {
    connect: () => qrScannerInstance.connect(),
    sendQrRequest: () => qrScannerInstance.requestQrCode(),
    sendHeartbeat: () => qrScannerInstance._sendHeartbeat(),
    listen: (callback, onAuthToken) => qrScannerInstance.onMessage(callback, onAuthToken),
};