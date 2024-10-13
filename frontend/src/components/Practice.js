import React, { useState, useEffect } from "react";
import "../css/Practice.css";
import { IconButton, Button } from "@radix-ui/themes";
import SideBar from "./SideBar";
import { Menu } from "lucide-react";
import { startSession, getQuestion, submitAnswer, askQuestion } from '../api';

const Practice = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleStartSession = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await startSession();
      setSessionStarted(true);
      console.log("Session started with ID:", data.session_id);
      await fetchNextQuestion();
    } catch (error) {
      console.error("Error starting session:", error);
      setError("Failed to start session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNextQuestion = async () => {
    if (!sessionStarted) {
      setError("Session not started. Please start a new session.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getQuestion();
      if (data.message === 'All questions completed') {
        setSessionStarted(false);
        setCurrentQuestion(null);
        setFeedback("Congratulations! You've completed all questions.");
      } else {
        setCurrentQuestion(data);
        setFeedback(""); // Clear any previous feedback
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setError("Failed to fetch question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentQuestion) return;
    setLoading(true);
    setError(null);
    try {
      const data = await submitAnswer(currentQuestion.id, userAnswer);
      if (data.correct) {
        setFeedback("Correct! Moving to the next question.");
        setUserAnswer("");
        await fetchNextQuestion();
      } else {
        setFeedback("Incorrect. Would you like an explanation?");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setError("Failed to submit answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplanationRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await askQuestion("Can you explain this question and how to solve it?");
      setFeedback(data.response);
    } catch (error) {
      console.error("Error fetching explanation:", error);
      setError("Failed to get explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="practice-container">
      <div className="flex-container">
        <div className="side-bar">
          <IconButton color="gray" variant="surface" onClick={toggleSidebar}>
            <Menu />
          </IconButton>
          {sidebarOpen && <SideBar />}
        </div>
        <div className="left-col">
          <section>
            <div className="top-row">
              {!sessionStarted && (
                <Button onClick={handleStartSession} disabled={loading}>
                  {loading ? 'Starting...' : 'Start Session'}
                </Button>
              )}
            </div>
            <div className="Lrow1">
              {error && <p className="error">{error}</p>}
              {loading && <p>Loading...</p>}
              {sessionStarted && currentQuestion && (
                <div>
                  <h2>Question:</h2>
                  <p>{currentQuestion.question}</p>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Your answer..."
                  />
                  <Button onClick={handleAnswerSubmit} disabled={loading}>
                    Submit Answer
                  </Button>
                </div>
              )}
            </div>
            <div className="Lrow2">
              {feedback && (
                <div>
                  <p>{feedback}</p>
                  {feedback === "Incorrect. Would you like an explanation?" && (
                    <Button onClick={handleExplanationRequest} disabled={loading}>
                      Get Explanation
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="Lrow3"></div>
          </section>
        </div>
        <div className="right-col">
          <section>
            <div className="Rrow1"></div>
            <div className="Rrow2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask Praxis..."
              />
              <button className="send-button" onClick={() => {/* Handle message send */}}>
                <img src="../../img/send.png" alt="send" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Practice;
