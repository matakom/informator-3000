import URL from './url';

let eventSource: EventSource | null = null;
const SSE_URL = `${URL}/notify?stream=article`;

export const connectSocket = (
    onMessage: (data: any) => void,
    onStatusChange: (isConnected: boolean) => void
) => {
    // 1. Force close existing to ensure clean state (Fixes "silent" sockets)
    if (eventSource) {
        console.log("♻️ Restarting SSE to bind new listeners...");
        eventSource.close();
        eventSource = null;
    }

    console.log("🔌 Connecting to SSE:", SSE_URL);
    eventSource = new EventSource(SSE_URL);

    // 2. Central Handler
    const handleEvent = (event: MessageEvent) => {
        console.log(`📩 SSE Event [${event.type}]:`, event.data); // DEBUG LOG
        try {
            const parsed = JSON.parse(event.data);
            onMessage(parsed);
        } catch {
            onMessage(event.data);
        }
    };

    // 3. Status Handlers
    eventSource.onopen = () => {
        console.log("✅ SSE Connected");
        onStatusChange(true);
    };

    eventSource.onerror = (err) => {
        console.error("⚠️ SSE Error:", err);
        onStatusChange(false);
        // Do not close manually here, let browser retry
    };

    // 4. LISTEN TO EVERYTHING
    // Standard message
    eventSource.onmessage = handleEvent;
    
    // Custom named events (Common culprits for "silent" sockets)
    eventSource.addEventListener("article", handleEvent);
    eventSource.addEventListener("create", handleEvent);
    eventSource.addEventListener("update", handleEvent);
    eventSource.addEventListener("delete", handleEvent);
    eventSource.addEventListener("ping", handleEvent);
};

export const disconnectSocket = () => {
    if (eventSource) {
        console.log("🛑 Closing Socket");
        eventSource.close();
        eventSource = null;
    }
};