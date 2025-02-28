import React, { useState } from 'react';

const Ai: React.FC = () => {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchOpenAIResponse = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setResponse("");

        try {
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`, // Use VITE_ for environment variables in React
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: input }],
                    max_tokens: 100,
                }),
            });

            const data = await res.json();
            setResponse(data.choices[0].message.content);
        } catch (error) {
            setResponse("Error fetching response. Check your API Key.");
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-2xl font-bold mb-4">Chat with OpenAI</h1>
            <div className="w-full max-w-md">
                <textarea
                    className="w-full p-3 rounded bg-gray-800 text-white border border-gray-600"
                    rows={3}
                    placeholder="Type your question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-500 p-3 rounded text-white font-bold disabled:bg-gray-600"
                    onClick={fetchOpenAIResponse}
                    disabled={loading}
                >
                    {loading ? "Consulting..." : "Send"}
                </button>
            </div>
            {response && (
                <div className="mt-6 w-full max-w-md bg-gray-800 p-4 rounded border border-gray-700">
                    <p className="text-green-400">Response:</p>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
}

export default Ai;