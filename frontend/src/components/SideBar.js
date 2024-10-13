import Timer from "./Timer";
import { BookOpen } from "lucide-react";
import { Card, Button } from "@radix-ui/themes";
import React, { useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";

const SideBar = ({onQuestionData}) => {
  // States for the user's selection
  const [selectedAssessmentIndex, setSelectedAssessmentIndex] = useState(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [questionData, setQuestionData] = useState(null);

  const styles = {
    collapsibleContentContainer: {
      paddingTop: "8px",
      flexDirection: "column",
      display: "flex",
      gap: "8px",
      paddingRight: "20px",
    },
    sectionItemButton: {
      justifyContent: "left",
      textAlign: "left",
      paddingTop: "6px",
      paddingBottom: "6px",
      height: "fit-content",
    },
  };

  const assessments = ["SAT", "ACT", "PSAT"];

  const assessmentSections = [
    ["SAT Math", "SAT Reading and Writing"],
    ["ACT Math", "ACT Reading and Writing", "ACT Science"],
    ["PSAT Math", "PSAT Reading and Writing"],
  ];

  const assessmentQuestions = [
    ["Algebra", "Advanced Math", "Problem Solving", "Geometry"],
    [
      "Information and Ideas",
      "Craft and Structure",
      "Expression of Ideas",
      "Standard English Conventions",
    ],
    ["Data Analysis", "Research Analysis", "Conflicting Viewpoints"],
  ];

  // Handlers for button clicks
  const handleAssessmentClick = (index) => {
    setSelectedAssessmentIndex(index);
  };

  const handleSectionClick = (index) => {
    
    setSelectedSectionIndex(index);
    fetch('http://127.0.0.1:5000/api/start_session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('Session started:', data);
        // Handle the response data as needed
      })
      .catch(error => {
        console.error('Error starting session:', error);
      });
      fetch('http://127.0.0.1:5000/api/get_question', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          //console.log('Questions:', data);
          setQuestionData(data);
          onQuestionData(data);
          // Handle the response data as needed
        })
        .catch(error => {
          console.error('Error starting session:', error);
        });
  };

  const handleQuestionClick = (index) => {
    setSelectedQuestionIndex(index);
  };

  return (
    <div className="accordion" style={{ height: "100%" }}>
      {/* Assessment Section */}
      <Card
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "12px",
        }}>
        <div
          style={{
            flex: 1,
            flexDirection: "column",
            gap: "8px",
            display: "flex",
          }}>
          <Collapsible.Root defaultOpen>
            <Collapsible.Trigger asChild>
              <Button style={{ width: "100%" }}>
                <BookOpen size={16} />
                Assessment
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content style={styles.collapsibleContentContainer}>
              {assessments.map((assessment, i) => (
                <Button
                  key={assessment}
                  variant={selectedAssessmentIndex === i ? "soft" : "ghost"}
                  onClick={() => handleAssessmentClick(i)}
                  style={{
                    ...styles.sectionItemButton,
                    ...(selectedAssessmentIndex !== i && {
                      paddingLeft: "12px",
                      paddingRight: "12px",
                      margin: 0,
                    }),
                  }}>
                  {assessment}
                </Button>
              ))}
            </Collapsible.Content>
          </Collapsible.Root>

          {/* Section Section (only shown after assessment is selected) */}
          {selectedAssessmentIndex !== null && (
            <>
              <hr style={{ marginTop: "4px", marginBottom: "4px" }} />
              <Collapsible.Root defaultOpen>
                <Collapsible.Trigger asChild>
                  <Button style={{ width: "100%" }}>
                    <BookOpen size={16} />
                    Section
                  </Button>
                </Collapsible.Trigger>
                <Collapsible.Content style={styles.collapsibleContentContainer}>
                  {assessmentSections[selectedAssessmentIndex].map(
                    (section, i) => (
                      <Button
                        key={section}
                        variant={selectedSectionIndex === i ? "soft" : "ghost"}
                        onClick={() => handleSectionClick(i)}
                        style={{
                          ...styles.sectionItemButton,
                          ...(selectedSectionIndex !== i && {
                            paddingLeft: "12px",
                            paddingRight: "12px",
                            margin: 0,
                          }),
                        }}>
                        {section}
                      </Button>
                    )
                  )}
                </Collapsible.Content>
              </Collapsible.Root>
            </>
          )}

          {/* Questions Section (only shown after section is selected) */}
          {selectedSectionIndex !== null && (
            <>
              <hr style={{ marginTop: "4px", marginBottom: "4px" }} />
              <Collapsible.Root defaultOpen>
                <Collapsible.Trigger asChild>
                  <Button style={{ width: "100%" }}>
                    <BookOpen size={16} />
                    Questions
                  </Button>
                </Collapsible.Trigger>
                <Collapsible.Content style={styles.collapsibleContentContainer}>
                  {assessmentQuestions[selectedSectionIndex].map(
                    (question, i) => (
                      <Button
                        key={question}
                        variant={selectedQuestionIndex === i ? "soft" : "ghost"}
                        onClick={() => handleQuestionClick(i)}
                        style={{
                          ...styles.sectionItemButton,
                          ...(selectedQuestionIndex !== i && {
                            paddingLeft: "12px",
                            paddingRight: "12px",
                            margin: 0,
                          }),
                        }}>
                        {question}
                      </Button>
                    )
                  )}
                </Collapsible.Content>
              </Collapsible.Root>
            </>
          )}
        </div>

        <Timer />
      </Card>
    </div>
  );
};

export default SideBar;
