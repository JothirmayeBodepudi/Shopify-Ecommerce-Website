import React, { useState } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import "../styles/FAQs.css";

export default function FAQs() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is MyShop?",
      answer:
        "MyShop is an e-commerce platform that offers a wide range of products, from electronics to clothing, and provides a seamless shopping experience.",
    },
    {
      question: "How to place an order?",
      answer:
        "To place an order, simply add the desired items to your cart, proceed to checkout, and follow the instructions to complete your purchase.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept a variety of payment methods, including credit cards (Visa, Mastercard, American Express), PayPal, and other secure payment options.",
    },
    {
      question: "What is the return policy?",
      answer:
        "We offer a 30-day return policy for most items. Please refer to our Returns & Refunds page for more details.",
    },
    {
      question: "How can I track my order?",
      answer:
        "You can track your order by logging into your account and visiting the Order History page. A tracking number will be provided once your order has shipped.",
    },
  ];

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div className="faqs-container">
        <h1>Frequently Asked Questions</h1>
        <p className="faqs-description">
          Find answers to common questions about our products and services.
        </p>
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <button onClick={() => toggle(index)} className="faq-question">
              {faq.question}
            </button>
            {openIndex === index && <p className="faq-answer">{faq.answer}</p>}
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
}
