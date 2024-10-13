import React, { useState, useEffect } from "react";
import "../css/Practice.css";
import { IconButton } from "@radix-ui/themes";
import SideBar from "./SideBar";
import { Menu } from "lucide-react";
import ReactPlayer from "react-player";
import videoFile1 from '../1.mp4';
import videoFile2 from '../2.mp4';
import videoFile3 from '../3.mp4';
import videoFile4 from '../4.mp4';
import videoFile5 from '../5.mp4';

const Practice = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState(""); // State to store the message
  const [questionData, setQuestionData] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [userInput, setUserInput] = useState(null);
  const [response, setResponse] = useState(null);

  const videoFiles = [videoFile1, videoFile2, videoFile3, videoFile4, videoFile5];

  const handleUserAnswer = (data) => {
    setUserAnswer(data)
    if (data === currentQuestion.answer.toString()) {
      console.log("correct");
      setQuestionIndex(questionIndex + 1);
      setResponse("");
    } else {
      console.log("wrong", currentQuestion.answer.toString(), data);
    }
  }

  useEffect(() => {
    if (questionData && questionData.length > questionIndex) {
      setCurrentQuestion(questionData[questionIndex]);
    }
  }, [questionIndex, questionData]);

  const handleQuestionData = (data) => {
    setQuestionData(data);
    setCurrentQuestion(data[questionIndex]);
    console.log(data);
  };

  useEffect(() => {
    console.log(currentQuestion);
  }, [currentQuestion]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Function to handle input change
  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleUserInputChange = (event) => {
    setUserInput(event.target.value);
  };


  // Function to handle message submission (sending message)
  const handleMessageSubmit = () => {
    console.log("Message sent to Perplexity:", message);
    fetch('http://127.0.0.1:5000/api/ask_question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "question": currentQuestion.question + "help me answer this question:\n" + message
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok', response.error);
        }
        return response.json();
      })
      .then(data => {
        console.log('LLM Response:', data);
        setResponse(data.response);
        // Handle the response data as needed
      })
      .catch(error => {
        console.error('Error starting session:', error);
      });
    // You can replace the console log with your desired functionality
    setMessage(""); // Clear the input field after sending
  };

  return (
    <div className="practice-container">
      <div className="flex-container">
        <div className="side-bar">
          <IconButton color="gray" variant="surface" onClick={toggleSidebar}>
            <Menu />
          </IconButton>
          {sidebarOpen && <SideBar onQuestionData={handleQuestionData}/>}
        </div>
        <div className="left-col">
          <section>
            <div className="top-row"> 
            <p>{currentQuestion?.question}</p>
            </div>
            <div className="Lrow1">
            <div>
      <ReactPlayer
        url={videoFiles[questionIndex]}
        width="800px"
        height="450px"
        controls={true}
      />
    </div>
            </div>
            <div className="Lrow2"></div>
            <div className="Lrow3">
              <input
                type="text"
                value={userInput}
                onChange={handleUserInputChange}
                placeholder="Ask Praxis..."
              />
              <button class="send-button" onClick={() => handleUserAnswer(userInput)}>
              <img src="../../img/send.png" alt="send" />
              </button>
            </div>
          </section>
        </div>
        <div className="right-col">
          <section>
            {/* perplexity chat here */}
            <div className="Rrow1">
              <p>{response}</p>
            </div>
            {/* send message to perplexity */}
            <div className="Rrow2">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                placeholder="Ask Praxis..."
              />
              <button class="send-button" onClick={handleMessageSubmit}>
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
