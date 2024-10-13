import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'; // Adjust the path as necessary
import './index.css'; // Optional CSS file

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root') // Make sure this matches the ID in your index.html
);
