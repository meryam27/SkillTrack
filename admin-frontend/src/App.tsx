import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CompetencePage from './pages/CompetencePage';
import StudentPage from './pages/StudentPage';
import Layout from './components/Layout';

const App: React.FC = () => {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/students" element={<StudentPage />} />
                    <Route path="/competences" element={<CompetencePage />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;
