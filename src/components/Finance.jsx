import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import erpData from '../data/erpData.json';
import './Finance.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const API_KEY = 'AIzaSyC-Mb6fH8gHNMP4iYSb6NBzym60jnD_lrc';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const Finance = () => {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState(null);
    const [revenueData, setRevenueData] = useState(null);
    const [expenseData, setExpenseData] = useState(null);
    const [cashflowData, setCashflowData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [insights, setInsights] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [transactionFilter, setTransactionFilter] = useState('all');

    useEffect(() => {
        calculateMetrics();
        generateChartData();
        processTransactions();
        generateInsights();
    }, []);

    const calculateMetrics = () => {
        // Calculate total revenue
        const totalRevenue = erpData.Sales_Inventory.Sales_Transactions.reduce(
            (sum, sale) => sum + sale.Net_Amount,
            0
        );

        // Calculate total expenses (example calculation)
        const totalExpenses = erpData.HR_Payroll.Employees.reduce(
            (sum, emp) => sum + emp.Net_Salary,
            0
        );

        // Calculate profit
        const profit = totalRevenue - totalExpenses;

        // Calculate current balance (example)
        const currentBalance = profit * 0.7; // Assuming 30% goes to other expenses

        setMetrics({
            revenue: {
                value: totalRevenue,
                change: +12.5,
                trend: 'up'
            },
            expenses: {
                value: totalExpenses,
                change: -3.2,
                trend: 'down'
            },
            profit: {
                value: profit,
                change: +15.8,
                trend: 'up'
            },
            balance: {
                value: currentBalance,
                change: +8.4,
                trend: 'up'
            }
        });
    };

    const generateChartData = () => {
        // Generate revenue data
        const revenueByMonth = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue',
                data: [65000, 72000, 68000, 85000, 91000, 89000],
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                fill: true,
                tension: 0.4
            }]
        };
        setRevenueData(revenueByMonth);

        // Generate expense data
        const expenseCategories = {
            labels: ['Salaries', 'Operations', 'Marketing', 'Equipment', 'Others'],
            datasets: [{
                label: 'Expenses by Category',
                data: [45000, 28000, 15000, 12000, 8000],
                backgroundColor: [
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(149, 165, 166, 0.8)'
                ]
            }]
        };
        setExpenseData(expenseCategories);

        // Generate cashflow data
        const cashflowByMonth = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Income',
                data: [65000, 72000, 68000, 85000, 91000, 89000],
                backgroundColor: 'rgba(46, 204, 113, 0.8)'
            }, {
                label: 'Expenses',
                data: [45000, 48000, 51000, 53000, 49000, 52000],
                backgroundColor: 'rgba(231, 76, 60, 0.8)'
            }]
        };
        setCashflowData(cashflowByMonth);
    };

    const processTransactions = () => {
        // Process sales transactions
        const salesTransactions = erpData.Sales_Inventory.Sales_Transactions.map(sale => ({
            id: sale.Transaction_ID,
            date: sale.Date,
            type: 'Income',
            description: `Sale - Invoice #${sale.Invoice_Number}`,
            amount: sale.Net_Amount,
            status: 'completed'
        }));

        // Process salary transactions
        const salaryTransactions = erpData.HR_Payroll.Employees.map(emp => ({
            id: `SAL-${emp.Employee_ID}`,
            date: new Date().toISOString().split('T')[0], // Current date for example
            type: 'Expense',
            description: `Salary - ${emp.Name}`,
            amount: -emp.Net_Salary,
            status: 'pending'
        }));

        // Combine and sort transactions
        const allTransactions = [...salesTransactions, ...salaryTransactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(allTransactions);
    };

    const generateInsights = async () => {
        try {
            const prompt = `Analyze this financial data and provide comprehensive business insights:
            Revenue: ${metrics?.revenue.value}
            Revenue Change: ${metrics?.revenue.change}%
            Expenses: ${metrics?.expenses.value}
            Expense Change: ${metrics?.expenses.change}%
            Profit: ${metrics?.profit.value}
            Profit Change: ${metrics?.profit.change}%
            Current Balance: ${metrics?.balance.value}
            
            Generate detailed insights covering:
            1. Performance Analysis
            2. Risk Assessment
            3. Growth Opportunities
            4. Cost Management
            5. Cash Flow Health
            
            Format as JSON with structure:
            {
                "insights": [
                    {
                        "title": "Insight title",
                        "description": "Detailed explanation",
                        "type": "positive/negative/neutral/warning",
                        "category": "Performance/Risk/Growth/Cost/Cash Flow",
                        "impact": "high/medium/low",
                        "metrics": [
                            {"label": "Key Metric 1", "value": "Value 1"},
                            {"label": "Key Metric 2", "value": "Value 2"}
                        ],
                        "recommendations": ["Action item 1", "Action item 2"]
                    }
                ]
            }`;

            const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            });

            const responseText = response.data.candidates[0].content.parts[0].text;
            const jsonStart = responseText.indexOf('{');
            const jsonEnd = responseText.lastIndexOf('}') + 1;
            const jsonStr = responseText.slice(jsonStart, jsonEnd);
            const parsedResponse = JSON.parse(jsonStr);
            
            setInsights(parsedResponse.insights);
        } catch (error) {
            console.error('Error generating insights:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="finance-dashboard">
            <div className="dashboard-header">
                <h1>Financial Overview</h1>
                <p className="header-subtitle">Track, analyze, and optimize your business finances</p>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card revenue">
                    <div className="metric-header">
                        <span className="metric-title">Total Revenue</span>
                        <div className="metric-icon">💰</div>
                    </div>
                    <div className="metric-value">₹{metrics.revenue.value.toLocaleString()}</div>
                    <div className={`metric-change ${metrics.revenue.change > 0 ? 'positive' : 'negative'}`}>
                        {metrics.revenue.change > 0 ? '↑' : '↓'} {Math.abs(metrics.revenue.change)}%
                    </div>
                </div>

                <div className="metric-card expenses">
                    <div className="metric-header">
                        <span className="metric-title">Total Expenses</span>
                        <div className="metric-icon">📊</div>
                    </div>
                    <div className="metric-value">₹{metrics.expenses.value.toLocaleString()}</div>
                    <div className={`metric-change ${metrics.expenses.change < 0 ? 'positive' : 'negative'}`}>
                        {metrics.expenses.change > 0 ? '↑' : '↓'} {Math.abs(metrics.expenses.change)}%
                    </div>
                </div>

                <div className="metric-card profit">
                    <div className="metric-header">
                        <span className="metric-title">Net Profit</span>
                        <div className="metric-icon">📈</div>
                    </div>
                    <div className="metric-value">₹{metrics.profit.value.toLocaleString()}</div>
                    <div className={`metric-change ${metrics.profit.change > 0 ? 'positive' : 'negative'}`}>
                        {metrics.profit.change > 0 ? '↑' : '↓'} {Math.abs(metrics.profit.change)}%
                    </div>
                </div>

                <div className="metric-card balance">
                    <div className="metric-header">
                        <span className="metric-title">Current Balance</span>
                        <div className="metric-icon">💵</div>
                    </div>
                    <div className="metric-value">₹{metrics.balance.value.toLocaleString()}</div>
                    <div className={`metric-change ${metrics.balance.change > 0 ? 'positive' : 'negative'}`}>
                        {metrics.balance.change > 0 ? '↑' : '↓'} {Math.abs(metrics.balance.change)}%
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Revenue Trend</h3>
                        <div className="chart-actions">
                            <button 
                                className={`chart-period ${selectedPeriod === 'month' ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod('month')}
                            >
                                Monthly
                            </button>
                            <button 
                                className={`chart-period ${selectedPeriod === 'quarter' ? 'active' : ''}`}
                                onClick={() => setSelectedPeriod('quarter')}
                            >
                                Quarterly
                            </button>
                        </div>
                    </div>
                    <div className="chart-container">
                        <Line 
                            data={revenueData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        display: false
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: {
                                            color: 'rgba(0, 0, 0, 0.1)'
                                        },
                                        ticks: {
                                            color: '#666'
                                        }
                                    },
                                    x: {
                                        grid: {
                                            display: false
                                        },
                                        ticks: {
                                            color: '#666'
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Expense Distribution</h3>
                    </div>
                    <div className="chart-container">
                        <Doughnut 
                            data={expenseData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            color: '#666'
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Income vs Expenses</h3>
                    </div>
                    <div className="chart-container">
                        <Bar 
                            data={cashflowData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                        labels: {
                                            color: '#666'
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: {
                                            color: 'rgba(0, 0, 0, 0.1)'
                                        },
                                        ticks: {
                                            color: '#666'
                                        }
                                    },
                                    x: {
                                        grid: {
                                            display: false
                                        },
                                        ticks: {
                                            color: '#666'
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="transactions-section">
                <div className="transactions-header">
                    <h3 className="transactions-title">Recent Transactions</h3>
                    <div className="transaction-filters">
                        <button 
                            className={`filter-btn ${transactionFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setTransactionFilter('all')}
                        >
                            All
                        </button>
                        <button 
                            className={`filter-btn ${transactionFilter === 'income' ? 'active' : ''}`}
                            onClick={() => setTransactionFilter('income')}
                        >
                            Income
                        </button>
                        <button 
                            className={`filter-btn ${transactionFilter === 'expense' ? 'active' : ''}`}
                            onClick={() => setTransactionFilter('expense')}
                        >
                            Expenses
                        </button>
                    </div>
                </div>

                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions
                            .filter(t => {
                                if (transactionFilter === 'income') return t.type === 'Income';
                                if (transactionFilter === 'expense') return t.type === 'Expense';
                                return true;
                            })
                            .slice(0, 10)
                            .map(transaction => (
                                <tr key={transaction.id}>
                                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                                    <td>{transaction.description}</td>
                                    <td className={`transaction-amount ${transaction.amount > 0 ? 'amount-positive' : 'amount-negative'}`}>
                                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                                    </td>
                                    <td>
                                        <span className={`transaction-status status-${transaction.status}`}>
                                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* AI Insights */}
            {insights && (
                <div className="insights-section">
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3 className="chart-title">AI-Powered Financial Insights</h3>
                        </div>
                        <div className="insights-grid">
                            {insights.map((insight, index) => (
                                <div key={index} className={`insight-card ${insight.type}`}>
                                    <span className="insight-category">{insight.category}</span>
                                    <h4>{insight.title}</h4>
                                    <p>{insight.description}</p>
                                    
                                    <div className="insight-impact">
                                        <span className={`impact-indicator impact-${insight.impact}`}></span>
                                        <span className="impact-text">
                                            {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                                        </span>
                                    </div>
                                    
                                    {insight.metrics && insight.metrics.length > 0 && (
                                        <div className="insight-metrics">
                                            {insight.metrics.map((metric, idx) => (
                                                <div key={idx} className="insight-metric">
                                                    <span className="insight-metric-label">{metric.label}:</span>
                                                    <span className="insight-metric-value">{metric.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {insight.recommendations && insight.recommendations.length > 0 && (
                                        <div className="insight-actions">
                                            {insight.recommendations.map((rec, idx) => (
                                                <button key={idx} className="insight-action-btn">
                                                    {rec.includes("Increase") || rec.includes("Improve") ? "📈" : "⚡"} {rec}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance; 