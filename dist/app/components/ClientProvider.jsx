"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
const react_query_1 = require("@tanstack/react-query");
const ClientProvider = ({ children }) => {
    const queryClient = new react_query_1.QueryClient();
    return (<react_query_1.QueryClientProvider client={queryClient}>
            {children}
        </react_query_1.QueryClientProvider>);
};
exports.default = ClientProvider;
