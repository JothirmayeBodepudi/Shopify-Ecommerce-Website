// WorkFromHomeQuiz.jsx
import React, { useState } from "react";
import "../styles/WorkFromHomeQuiz.css";

import Navbar from "../Navbar";   // adjust the path based on your folder structure
import Footer from "../Footer";   // adjust the path based on your folder structure

export default function WorkFromHomeQuiz() {
  const questions = [
    {
      question: "What is the best way to stay productive while working from home?",
      options: [
        "Work without breaks all day",
        "Set a routine and take short breaks",
        "Keep TV on for background noise",
        "Work only when you feel like it",
      ],
      answer: 1,
    },
    {
      question: "Which of these helps maintain work-life balance?",
      options: [
        "Working from bed",
        "Having a dedicated workspace",
        "Checking emails late at night",
        "Skipping lunch",
      ],
      answer: 1,
    },
    {
      question: "What is the most important tool for remote collaboration?",
      options: [
        "Video conferencing & chat apps",
        "A personal diary",
        "Offline sticky notes",
        "Radio communication",
      ],
      answer: 0,
    },
  ];

  const [userAnswers, setUserAnswers] = useState(Array(questions.length).fill(null));
  const [score, setScore] = useState(null);

  const handleOptionChange = (qIndex, optionIndex) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[qIndex] = optionIndex;
    setUserAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    let newScore = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        newScore++;
      }
    });
    setScore(newScore);
  };

  return (
    <>
      {/* ✅ Navbar at the top */}
      <Navbar />

      <main className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-8 mb-8">
        <h1 className="text-2xl font-bold mb-6 text-center">📋 Work From Home Quiz</h1>
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="mb-6">
            <h2 className="text-lg font-semibold mb-2">
              {qIndex + 1}. {q.question}
            </h2>
            {q.options.map((option, oIndex) => (
              <label
                key={oIndex}
                className={`block p-2 rounded cursor-pointer border mb-2 ${
                  userAnswers[qIndex] === oIndex
                    ? "bg-blue-100 border-blue-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  value={oIndex}
                  checked={userAnswers[qIndex] === oIndex}
                  onChange={() => handleOptionChange(qIndex, oIndex)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        ))}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Submit Quiz
        </button>

        {score !== null && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-xl text-center font-bold">
            🎉 You scored {score} out of {questions.length}
          </div>
        )}
      </main>

      {/* ✅ Footer at the bottom */}
      <Footer />
    </>
  );
}
