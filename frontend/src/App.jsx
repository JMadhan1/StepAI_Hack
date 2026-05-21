import React, { createContext, useContext, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import TopNav from './components/TopNav'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import StudyPlan from './components/StudyPlan'
import QuizArena from './components/QuizArena'
import WeakAreaTracker from './components/WeakAreaTracker'
import DoubtSolver from './components/DoubtSolver'
import ResourceFeed from './components/ResourceFeed'
import Flashcards from './components/Flashcards'
import StudyNotes from './components/StudyNotes'
import ExamMode from './components/ExamMode'
import Analytics from './components/Analytics'
import TutorChat from './components/TutorChat'
import XPToast from './components/XPToast'
import PomodoroWidget from './components/PomodoroWidget'
import useGamification from './hooks/useGamification'

export const AppContext = createContext(null)
export function useApp() { return useContext(AppContext) }

export default function App() {
  const [uploadedTopics, setUploadedTopics] = useState([])
  const [weakAreas, setWeakAreas] = useState([])
  const [performanceHistory, setPerformanceHistory] = useState([])
  const [currentStudyPlan, setCurrentStudyPlan] = useState(null)
  const [agentStatus, setAgentStatus] = useState({
    research: 'idle', quiz: 'idle', planner: 'idle', tracker: 'idle', doubt: 'idle',
  })

  const setAgent = (name, status) =>
    setAgentStatus((prev) => ({ ...prev, [name]: status }))

  const gamification = useGamification()

  return (
    <AppContext.Provider value={{
      uploadedTopics, setUploadedTopics,
      weakAreas, setWeakAreas,
      performanceHistory, setPerformanceHistory,
      currentStudyPlan, setCurrentStudyPlan,
      agentStatus, setAgent,
      ...gamification,
    }}>
      <BrowserRouter>
        <Routes>
          {/* Landing page — no sidebar */}
          <Route path="/" element={<Landing />} />

          {/* App — with sidebar + topnav */}
          <Route path="/*" element={
            <div className="flex min-h-screen bg-bg">
              <Sidebar />
              <main className="flex-1 ml-64 min-h-screen overflow-y-auto flex flex-col">
                <TopNav />
                <div className="flex-1">
                  <Routes>
                    <Route path="/dashboard"  element={<Dashboard />} />
                    <Route path="/study-plan" element={<StudyPlan />} />
                    <Route path="/quiz"       element={<QuizArena />} />
                    <Route path="/tracker"    element={<WeakAreaTracker />} />
                    <Route path="/doubt"      element={<DoubtSolver />} />
                    <Route path="/resources"  element={<ResourceFeed />} />
                    <Route path="/flashcards" element={<Flashcards />} />
                    <Route path="/notes"      element={<StudyNotes />} />
                    <Route path="/exam"       element={<ExamMode />} />
                    <Route path="/chat"       element={<TutorChat />} />
                    <Route path="/analytics"  element={<Analytics />} />
                    <Route path="*"           element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </main>
              <XPToast toast={gamification.toast} />
              <PomodoroWidget />
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  )
}
