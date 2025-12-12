import URL from './url';

let eventSource: EventSource | null = null;
const SSE_URL = `${URL}/notify?stream=article`;

// Changed any to unknown
export const connectSocket = (
    onMessage: (data: unknown) => void,
    onStatusChange: (isConnected: boolean) => void
) => {
    if (eventSource) {
        console.log("♻️ Restarting SSE to bind new listeners...");
        eventSource.close();
        eventSource = null;
    }

    console.log("🔌 Connecting to SSE:", SSE_URL);
    eventSource = new EventSource(SSE_URL);

    const handleEvent = (event: MessageEvent) => {
        console.log(`📩 SSE Event [${event.type}]:`, event.data); 
        try {
            const parsed = JSON.parse(event.data);
            onMessage(parsed);
        } catch {
            onMessage(event.data);
        }
    };

    eventSource.onopen = () => {
        console.log("✅ SSE Connected");
        onStatusChange(true);
    };

    eventSource.onerror = (err) => {
        console.error("⚠️ SSE Error:", err);
        onStatusChange(false);
    };

    // Listeners
    eventSource.onmessage = handleEvent;
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