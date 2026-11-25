import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ApplicationModal } from './components/ApplicationModal';
import { InterviewModal } from './components/InterviewModal';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SmartJobImporterModal } from './components/SmartJobImporterModal';
import { Dashboard } from './pages/Dashboard';
import { ApplicationsList } from './pages/ApplicationsList';
import { Interviews } from './pages/Interviews';
import { Analytics } from './pages/Analytics';
import { Deadlines } from './pages/Deadlines';
import { AiResumeScanner } from './pages/AiResumeScanner';
import { InterviewPrepCopilot } from './pages/InterviewPrepCopilot';
import { EmailSyncHub } from './pages/EmailSyncHub';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { applicationsApi } from './api/client';

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appModalOpen, setAppModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [smartImporterOpen, setSmartImporterOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useNavigate();

  const handleOpenAddModal = () => {
    setSelectedApp(null);
    setAppModalOpen(true);
  };

  const handleSelectApplication = (app) => {
    setSelectedApp(app);
    setAppModalOpen(true);
  };

  const handleScheduleInterviewForApp = (app) => {
    setSelectedApp(app);
    setSelectedInterview(null);
    setInterviewModalOpen(true);
  };

  const handleOpenInterviewModal = (interview = null) => {
    setSelectedInterview(interview);
    setSelectedApp(null);
    setInterviewModalOpen(true);
  };

  const handleSelectAppById = async (id) => {
    try {
      const res = await applicationsApi.getById(id);
      setSelectedApp(res.data);
      setAppModalOpen(true);
    } catch (err) {
      console.error('Failed to load application', err);
    }
  };

  const handleApplicationSaved = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleInterviewSaved = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
              <Navbar
                onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                onOpenSmartImport={() => setSmartImporterOpen(true)}
              />

              <div className="flex flex-1 relative">
                <Sidebar
                  isOpen={sidebarOpen}
                  onCloseMobile={() => setSidebarOpen(false)}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenSmartImport={() => setSmartImporterOpen(true)}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Dashboard
                          key={refreshKey}
                          onOpenAddModal={handleOpenAddModal}
                          onSelectApplication={handleSelectApplication}
                          onScheduleInterview={handleScheduleInterviewForApp}
                        />
                      }
                    />
                    <Route
                      path="/applications"
                      element={
                        <ApplicationsList
                          key={refreshKey}
                          defaultView="table"
                          onOpenAddModal={handleOpenAddModal}
                          onSelectApplication={handleSelectApplication}
                          onScheduleInterview={handleScheduleInterviewForApp}
                        />
                      }
                    />
                    <Route
                      path="/kanban"
                      element={
                        <ApplicationsList
                          key={refreshKey}
                          defaultView="kanban"
                          onOpenAddModal={handleOpenAddModal}
                          onSelectApplication={handleSelectApplication}
                          onScheduleInterview={handleScheduleInterviewForApp}
                        />
                      }
                    />
                    <Route
                      path="/interviews"
                      element={
                        <Interviews
                          key={refreshKey}
                          onOpenInterviewModal={handleOpenInterviewModal}
                          onEditInterview={(interview) => {
                            setSelectedInterview(interview);
                            setInterviewModalOpen(true);
                          }}
                        />
                      }
                    />
                    <Route path="/analytics" element={<Analytics key={refreshKey} />} />
                    <Route
                      path="/deadlines"
                      element={
                        <Deadlines
                          key={refreshKey}
                          onSelectApplicationId={handleSelectAppById}
                        />
                      }
                    />
                    <Route
                      path="/resume-scanner"
                      element={<AiResumeScanner key={refreshKey} />}
                    />
                    <Route
                      path="/interview-copilot"
                      element={<InterviewPrepCopilot key={refreshKey} />}
                    />
                    <Route
                      path="/email-sync"
                      element={<EmailSyncHub key={refreshKey} />}
                    />
                  </Routes>
                </main>
              </div>

              {/* Modals */}
              <ApplicationModal
                isOpen={appModalOpen}
                onClose={() => setAppModalOpen(false)}
                application={selectedApp}
                onSaved={handleApplicationSaved}
                onScheduleInterview={handleScheduleInterviewForApp}
              />

              <InterviewModal
                isOpen={interviewModalOpen}
                onClose={() => setInterviewModalOpen(false)}
                interview={selectedInterview}
                initialApplication={selectedApp}
                onSaved={handleInterviewSaved}
              />

              <SmartJobImporterModal
                isOpen={smartImporterOpen}
                onClose={() => setSmartImporterOpen(false)}
                onImportSuccess={handleApplicationSaved}
              />
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
