import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
} from "react";
import { Conversation, ApiHealthResponse } from "@/types";
import { chatService } from "@/services/chatService";

interface ChatContextType {
    conversations: Conversation[];
    conversationsLoading: boolean;
    apiStatus: ApiHealthResponse | null;
    loadConversations: () => Promise<void>;
    refreshConversations: () => Promise<void>;
    addConversation: (conversation: Conversation) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
    console.log("🔗 useChatContext called");
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
};

interface ChatProviderProps {
    children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    console.log("🏗️ ChatProvider: Component created");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [conversationsLoading, setConversationsLoading] =
        useState<boolean>(true);
    const [apiStatus, setApiStatus] = useState<ApiHealthResponse | null>(null);
    const initializedRef = useRef(false);

    const loadConversations = useCallback(async () => {
        console.log("🔄 ChatContext: loadConversations called");
        try {
            setConversationsLoading(true);
            const response = await chatService.getAllConversations();
            console.log("📋 ChatContext: Loaded conversations:", response.conversations.length);
            setConversations(response.conversations);
        } catch (err) {
            console.error("Failed to load conversations:", err);
        } finally {
            setConversationsLoading(false);
        }
    }, []);

    const refreshConversations = useCallback(async () => {
        console.log("🔄 ChatContext: refreshConversations called");
        await loadConversations();
    }, [loadConversations]);

    const addConversation = useCallback((conversation: Conversation) => {
        console.log("➕ ChatContext: addConversation called for:", conversation.id);
        setConversations(prev => {
            // Check if conversation already exists
            const exists = prev.some(conv => conv.id === conversation.id);
            if (exists) {
                console.log("⚠️ ChatContext: Conversation already exists, skipping");
                return prev;
            }
            // Add new conversation at the beginning of the list
            console.log("✅ ChatContext: Adding new conversation to list");
            return [conversation, ...prev];
        });
    }, []);

    // Load conversations and check API status on mount
    useEffect(() => {
        if (initializedRef.current) {
            console.log("⚠️ ChatContext: Already initialized, skipping");
            return;
        }

        console.log("🚀 ChatContext: useEffect triggered - initializing chat");
        initializedRef.current = true;

        const initializeChat = async () => {
            try {
                console.log("🔍 ChatContext: Checking API health...");
                // Check API status
                const status = await chatService.checkHealth();
                console.log("✅ ChatContext: API health check completed:", status);
                setApiStatus(status);

                console.log("📋 ChatContext: Loading conversations...");
                // Load conversations
                await loadConversations();
                console.log("✅ ChatContext: Conversations loaded successfully");
            } catch (err) {
                console.error("❌ ChatContext: Error during initialization:", err);
                setApiStatus({
                    status: "error",
                    timestamp: new Date().toISOString(),
                    message: "API not reachable",
                });
            }
        };

        initializeChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    const value: ChatContextType = {
        conversations,
        conversationsLoading,
        apiStatus,
        loadConversations,
        refreshConversations,
        addConversation,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
