const backendURL = process.env.REACT_APP_BACKEND_URL;
console.log("Backend URL:", backendURL);
export async function InvokeLLM({ prompt }) {
  try {
    const response = await fetch(`${backendURL}/api/invoke-llm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", response.status, errorText);
      return `Server error (${response.status}): ${errorText}`;
    }

    
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("InvokeLLM error:", error);
    return "I'm sorry, I encountered an error. Please try again!";
  }
}
