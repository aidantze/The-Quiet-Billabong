import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import './App.css';

// SVG Icons for buttons for better styling and accessibility
const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3.47826 21L21.5217 12L3.47826 3V10.1304L15.6522 12L3.47826 13.8696V21Z" fill="currentColor" />
  </svg>
);

const ClearIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.94 20 19.23 17.15 19.83 13.5H17.75C17.18 16.05 14.83 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor" />
  </svg>
);

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor" />
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor" />
  </svg>
);

function App() {
  const [conversation, setConversation] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasStarted = conversation.length > 0;
  const yarnEndRef = useRef(null);

  useEffect(() => {
    yarnEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isLoading]);

  const handleClear = () => {
    setConversation([]);
    setError(null);
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userPrompt = inputValue.trim();
    if (!userPrompt) return;

    const newUserMessage = { sender: 'user', text: userPrompt };
    setConversation(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const encodedPrompt = encodeURIComponent(userPrompt);
      const backendUrl = process.env.REACT_APP_BACKEND_URL;

      const response = await fetch(`${ backendUrl }/query?prompt=${ encodedPrompt }`);

      if (!response.ok) {
        throw new Error(`Sorry, we couldn't connect. The server responded with status: ${ response.status }`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage = { sender: 'ai', text: data.response };
      setConversation(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleModalClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      handleModalToggle();
    }
  };

  const handleEscapeKey = (e) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]);


  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <img
            src="https://res.cloudinary.com/dg6nuqapw/image/upload/v1757554392/yarnlink-logo_goiaoz.png"
            alt="Yarn Link Logo"
            className="app-logo"
          />
          <span className="app-title">Yarn Link</span>
        </div>
        <div className="header-buttons">
          <button className="header-button info-button" aria-label="Help and information" onClick={ handleModalToggle }>
            <InfoIcon />
          </button>
          { hasStarted && (
            <button className="header-button clear-button" onClick={ handleClear } aria-label="Clear conversation and start over">
              <ClearIcon /> Clear
            </button>
          ) }
        </div>
      </header>

      <main className={ `yarn-container ${ hasStarted ? 'conversation-view' : 'initial-view' }` }>
        { !hasStarted && (
          <div className="welcome-message">
            <h1>G'Day Mate!</h1>
            <p>This is a safe place to sit and yarn, no matter what's on your mind. Here, we'll listen with an open heart and help you find your way back to your own songline.</p>
          </div>
        ) }

        <div className="message-list-wrapper">
          <div className="message-list">
            { conversation.map((msg, index) => (
              <div key={ index } className={ `message-bubble ${ msg.sender }` }>
                { msg.sender === 'ai' ? (
                  <ReactMarkdown remarkPlugins={ [remarkBreaks] }>{ msg.text.replace(/\n\n+/g, '\n').replace(/\n/gi, "&nbsp; \n") }</ReactMarkdown>
                ) : (
                  <p>{ msg.text }</p>
                ) }
              </div>
            )) }
            { isLoading && (
              <div className="message-bubble ai loading-indicator">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </div>
            ) }
            { error && (
              <div className="message-bubble error-message">
                <p><strong>An error occurred:</strong> { error }</p>
              </div>
            ) }
            <div ref={ yarnEndRef } className="bottom-spacer" />
          </div>
        </div>
      </main>

      <footer className="prompt-container">
        <form onSubmit={ handleSubmit } className="prompt-form">
          <input
            type="text"
            className="prompt-input"
            value={ inputValue }
            onChange={ (e) => setInputValue(e.target.value) }
            placeholder="Start your yarn here. What's on your mind today?"
            aria-label="Your message"
            disabled={ isLoading }
          />
          <button type="submit" className="prompt-button send-button" disabled={ isLoading || !inputValue.trim() } aria-label="Send message">
            <SendIcon /> Send
          </button>
        </form>
      </footer>

      { isModalOpen && (
        <div className="modal-backdrop" onClick={ handleModalClick }>
          <div className="modal-content">
            <button className="modal-close-button" aria-label="Close modal" onClick={ handleModalToggle }>
              <XIcon />
            </button>
            <h2 className="modal-title">Our purpose</h2>
            <p className="modal-description">
              Yarn Link was developed by Algonova to provide a friendly, safe and accessible mental health support tool to regional Australians, which includes Aboriginal and Torres Strait Islander peoples. We aim to bridge the accessibility, affordability and effectiveness gap of mental health support in rural communities across Australia.
              <br /><br />
              The service uses generative AI to analyse each and every prompt, tailoring its response in a respectful, gentle and calm manner to assist with any basic mental needs. The intelligence is trained on data across regional Australia, and responds with a storytelling mindset to give you a safe, calm experience that understands your culture. Even if you ask it to do something it cannot do, it will recommend other mental health services near you to contact.
              <br /><br />
              Yarn Link acknowledges the Traditional Owners and Custodians of the lands that this platform serves and was built upon. We pay our respects to Elders past and present, and emerging leaders, and we extend that respect to all other Aboriginal and Torres Strait Islander peoples. This always is, was and will be, Aboriginal land.
            </p>
          </div>
        </div>
      ) }
    </div>
  );
}

export default App;