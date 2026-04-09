import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { ArtifactViewerPage } from './pages/ArtifactViewerPage'
import { PromptWorkbenchPage } from './pages/PromptWorkbenchPage'
import { ProjectDetailPage } from './pages/ProjectDetailPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { UploadPage } from './pages/UploadPage'

function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">legacy modernization workspace</p>
          <h1>legacyDoc</h1>
        </div>
        <nav className="top-nav" aria-label="Main navigation">
          <NavLink
            className={({ isActive }) =>
              `top-nav__link${isActive ? ' top-nav__link--active' : ''}`
            }
            to="/projects"
          >
            Projects
          </NavLink>
        </nav>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/projects/:projectId/upload" element={<UploadPage />} />
          <Route path="/projects/:projectId/prompts" element={<PromptWorkbenchPage />} />
          <Route
            path="/projects/:projectId/artifacts/:artifactId"
            element={<ArtifactViewerPage />}
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
