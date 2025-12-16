import URL from './url';

// Keeping this at module level so we can kill it from anywhere
let eventSource: EventSource | null = null;
const SSE_URL = `${URL}/notify?stream=article`;

// Using 'unknown' requires the consumer to validate the data structure
export const connectSocket = (
    onMessage: (data: unknown) => void,
    onStatusChange: (isConnected: boolean) => void
) => {
    // If a connection already exists, we close it first to avoid 
    // duplicate listeners or memory leaks when the component re-mounts.
    if (eventSource) {
        console.log("♻️ Restarting SSE to bind new listeners...");
        eventSource.close();
        eventSource = null;
    }

    console.log("🔌 Connecting to SSE:", SSE_URL);
    eventSource = new EventSource(SSE_URL);

    // -- Handlers --

    // Generic handler for all event types
    const handleEvent = (event: MessageEvent) => {
        console.log(`📩 SSE Event [${event.type}]:`, event.data); 
        try {
            // Most messages are JSON, but sometimes we might get a raw string
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
        // SSE automatically tries to reconnect, but we want to let the UI know
        console.error("⚠️ SSE Error:", err);
        onStatusChange(false);
    };

    // -- Event Bindings --
    
    // We explicitly listen to all these specific events because the backend 
    // emits named events (e.g. event: "create") rather than just generic messages.
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