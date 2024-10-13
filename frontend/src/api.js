const API_URL = "http://127.0.0.1:5000"

export const startSession = async () => {
  const response = await fetch(`${API_URL}/api/start_session`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Failed to start session');
  }
  const data = await response.json();
  localStorage.setItem('sessionId', data.session_id);
  return data;
};

export const getQuestion = async () => {
  const response = await fetch(`${API_URL}/api/get_question`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'X-Session-ID': localStorage.getItem('sessionId'),
    },
  });
  if (!response.ok) {
    throw new Error('Failed to get question');
  }
  return response.json();
};

export const submitAnswer = async (questionId, answer) => {
  const response = await fetch(`${API_URL}/api/submit_answer`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': localStorage.getItem('sessionId'),
    },
    body: JSON.stringify({ question_id: questionId, answer }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit answer');
  }
  return response.json();
};

export const askQuestion = async (question) => {
  const response = await fetch(`${API_URL}/api/ask_question`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': localStorage.getItem('sessionId'),
    },
    body: JSON.stringify({ question }),
  });
  if (!response.ok) {
    throw new Error('Failed to ask question');
  }
  return response.json();
};