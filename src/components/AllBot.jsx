import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import erpData from '../data/erpData.json';
import './AllBot.css';

const API_KEY = 'AIzaSyC-Mb6fH8gHNMP4iYSb6NBzym60jnD_lrc';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const AllBot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [activeFeature, setActiveFeature] = useState('chat');
    const [quickActions, setQuickActions] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [analysisMode, setAnalysisMode] = useState('general');
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const features = [
        { id: 'chat', label: 'General Chat', icon: '💬' },
        { id: 'image', label: 'Image Analysis', icon: '🖼️' },
        { id: 'sales', label: 'Sales Insights', icon: '📊' },
        { id: 'inventory', label: 'Inventory Check', icon: '📦' },
        { id: 'finance', label: 'Financial Analysis', icon: '💰' },
        { id: 'hr', label: 'HR Assistant', icon: '👥' },
        { id: 'reports', label: 'Report Generator', icon: '📄' },
        { id: 'trends', label: 'Trend Analysis', icon: '📈' }
    ];

    const analysisModes = [
        { id: 'general', label: 'General Analysis' },
        { id: 'product', label: 'Product Detection' },
        { id: 'document', label: 'Document Scan' },
        { id: 'quality', label: 'Quality Check' }
    ];

    useEffect(() => {
        scrollToBottom();
        generateQuickActions();
    }, [messages, activeFeature]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const generateQuickActions = () => {
        switch (activeFeature) {
            case 'sales':
                setQuickActions([
                    'Show top selling products',
                    'Analyze sales trends',
                    'Customer insights',
                    'Revenue forecast'
                ]);
                break;
            case 'inventory':
                setQuickActions([
                    'Low stock alerts',
                    'Inventory valuation',
                    'Stock movement analysis',
                    'Reorder suggestions'
                ]);
                break;
            case 'finance':
                setQuickActions([
                    'Cash flow analysis',
                    'Expense breakdown',
                    'Profit margins',
                    'Budget planning'
                ]);
                break;
            case 'hr':
                setQuickActions([
                    'Employee performance',
                    'Leave management',
                    'Payroll insights',
                    'Team analytics'
                ]);
                break;
            default:
                setQuickActions([
                    'How can I help you?',
                    'Show recent updates',
                    'Generate report',
                    'Analyze trends'
                ]);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(file);
                setImagePreview(reader.result);
                analyzeImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async (imageData) => {
        setLoading(true);
        try {
            const base64Image = imageData.split(',')[1];
            
            const prompt = `Analyze this image based on ${analysisMode} mode. 
            If it's a product, compare it with our inventory: ${JSON.stringify(erpData.Sales_Inventory.Products)}.
            If it's a document, extract key information.
            If it's a quality check, provide detailed assessment.
            
            Provide analysis in the following JSON format:
            {
                "analysis_type": "product/document/quality/general",
                "description": "Detailed description",
                "key_findings": ["Finding 1", "Finding 2"],
                "recommendations": ["Recommendation 1", "Recommendation 2"],
                "matches": ["Any matches from our inventory/database"],
                "confidence_score": "0-100%"
            }`;

            const response = await axios.post(API_URL, {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                    ]
                }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                }
            });

            const analysis = JSON.parse(response.data.candidates[0].content.parts[0].text);
            
            addMessage('bot', {
                type: 'image_analysis',
                content: analysis
            });
        } catch (error) {
            console.error('Error analyzing image:', error);
            addMessage('bot', {
                type: 'error',
                content: 'Sorry, I had trouble analyzing that image. Please try again.'
            });
        }
        setLoading(false);
    };

    const handleQuickAction = async (action) => {
        setInput(action);
        await handleSubmit(null, action);
    };

    const addMessage = (sender, content) => {
        setMessages(prev => [...prev, { sender, content, timestamp: new Date() }]);
    };

    const generateResponse = async (userInput) => {
        try {
            let prompt = '';
            let contextData = {};

            switch (activeFeature) {
                case 'sales':
                    contextData = {
                        sales: erpData.Sales_Inventory.Sales_Transactions,
                        products: erpData.Sales_Inventory.Products
                    };
                    break;
                case 'inventory':
                    contextData = {
                        inventory: erpData.Sales_Inventory.Products
                    };
                    break;
                case 'finance':
                    contextData = {
                        sales: erpData.Sales_Inventory.Sales_Transactions,
                        employees: erpData.HR_Payroll.Employees
                    };
                    break;
                case 'hr':
                    contextData = {
                        employees: erpData.HR_Payroll.Employees
                    };
                    break;
                default:
                    contextData = erpData;
            }

            prompt = `You are an AI assistant for our ERP system. Current feature: ${activeFeature}.
            User Query: ${userInput}
            Context Data: ${JSON.stringify(contextData)}
            
            Generate a response in JSON format:
            {
                "response_type": "text/chart/table/alert",
                "message": "Main response message",
                "data": {}, // Any relevant data for visualization
                "suggestions": ["Suggestion 1", "Suggestion 2"],
                "actions": ["Action 1", "Action 2"]
            }`;

            const response = await axios.post(API_URL, {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                }
            });

            const parsedResponse = JSON.parse(response.data.candidates[0].content.parts[0].text);
            addMessage('bot', parsedResponse);
            setSuggestions(parsedResponse.suggestions || []);

        } catch (error) {
            console.error('Error generating response:', error);
            addMessage('bot', {
                type: 'error',
                content: 'I encountered an error. Please try again.'
            });
        }
    };

    const handleSubmit = async (e, quickAction = null) => {
        e?.preventDefault();
        const userInput = quickAction || input;
        if (!userInput.trim()) return;

        setLoading(true);
        addMessage('user', { type: 'text', content: userInput });
        setInput('');

        await generateResponse(userInput);
        setLoading(false);
    };

    const renderMessage = (message) => {
        if (message.sender === 'user') {
            return (
                <div className="user-message">
                    <div className="message-content">
                        {message.content.content}
                    </div>
                    <div className="message-timestamp">
                        {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                </div>
            );
        }

        switch (message.content.response_type || message.content.type) {
            case 'image_analysis':
                return (
                    <div className="bot-message analysis-message">
                        <h4>{message.content.analysis_type} Analysis</h4>
                        <p>{message.content.description}</p>
                        <div className="findings-section">
                            <h5>Key Findings:</h5>
                            <ul>
                                {message.content.key_findings.map((finding, idx) => (
                                    <li key={idx}>{finding}</li>
                                ))}
                            </ul>
                        </div>
                        {message.content.matches?.length > 0 && (
                            <div className="matches-section">
                                <h5>Matches Found:</h5>
                                <ul>
                                    {message.content.matches.map((match, idx) => (
                                        <li key={idx}>{match}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="confidence-score">
                            Confidence: {message.content.confidence_score}
                        </div>
                    </div>
                );
            case 'chart':
                return (
                    <div className="bot-message chart-message">
                        <div className="chart-container">
                            {/* Chart visualization would go here */}
                            {message.content.message}
                        </div>
                    </div>
                );
            case 'table':
                return (
                    <div className="bot-message table-message">
                        <div className="table-container">
                            {/* Table visualization would go here */}
                            {message.content.message}
                        </div>
                    </div>
                );
            case 'error':
                return (
                    <div className="bot-message error-message">
                        {message.content.content}
                    </div>
                );
            default:
                return (
                    <div className="bot-message">
                        <div className="message-content">
                            {message.content.message}
                            {message.content.actions?.length > 0 && (
                                <div className="message-actions">
                                    {message.content.actions.map((action, idx) => (
                                        <button 
                                            key={idx}
                                            className="action-button"
                                            onClick={() => handleQuickAction(action)}
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="message-timestamp">
                            {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="allbot-container">
            <div className="features-sidebar">
                {features.map(feature => (
                    <button
                        key={feature.id}
                        className={`feature-button ${activeFeature === feature.id ? 'active' : ''}`}
                        onClick={() => setActiveFeature(feature.id)}
                    >
                        <span className="feature-icon">{feature.icon}</span>
                        {feature.label}
                    </button>
                ))}
            </div>

            <div className="main-content">
                <div className="chat-header">
                    <h2>{features.find(f => f.id === activeFeature)?.label}</h2>
                    {activeFeature === 'image' && (
                        <div className="analysis-modes">
                            {analysisModes.map(mode => (
                                <button
                                    key={mode.id}
                                    className={`mode-button ${analysisMode === mode.id ? 'active' : ''}`}
                                    onClick={() => setAnalysisMode(mode.id)}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="chat-messages">
                    {messages.map((message, index) => (
                        <div key={index} className="message-wrapper">
                            {renderMessage(message)}
                        </div>
                    ))}
                    {loading && (
                        <div className="bot-message loading">
                            <div className="loading-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {activeFeature === 'image' && (
                    <div className="image-upload-section">
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                                <button 
                                    className="remove-image"
                                    onClick={() => {
                                        setSelectedImage(null);
                                        setImagePreview(null);
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <button 
                            className="upload-button"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {imagePreview ? 'Upload Another Image' : 'Upload Image for Analysis'}
                        </button>
                    </div>
                )}

                <div className="quick-actions">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            className="quick-action-button"
                            onClick={() => handleQuickAction(action)}
                        >
                            {action}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="chat-input">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message here..."
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !input.trim()}>
                        Send
                    </button>
                </form>

                {suggestions.length > 0 && (
                    <div className="suggestions">
                        <p>Suggested queries:</p>
                        <div className="suggestion-buttons">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllBot; 