window.CAPIWS = {
  ws: null,
  connect(callback) {
    this.ws = new WebSocket("wss://127.0.0.1:64443/");
    this.ws.onopen = () => callback();
    this.ws.onerror = (e) => console.error("E-IMZO agent ulanmagan:", e);
  },
  callFunction(request, onSuccess, onError) {
    if (!this.ws || this.ws.readyState !== 1) {
      onError("WebSocket ulanmagan");
      return;
    }
    this.ws.send(JSON.stringify(request));
    this.ws.onmessage = (msg) => {x
      const data = JSON.parse(msg.data);
      if (data.success) onSuccess(null, data);
      else onError(data.error || "Xatolik");
    };
  }
};
