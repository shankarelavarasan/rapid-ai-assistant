import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ModernUIDemo from './pages/ModernUIDemo';
import './App.css';
function App() {
    return (<Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/demo" replace/>}/>
          <Route path="/demo" element={<ModernUIDemo />}/>
          <Route path="*" element={<Navigate to="/demo" replace/>}/>
        </Routes>
      </div>
    </Router>);
}
export default App;
//# sourceMappingURL=App.js.map