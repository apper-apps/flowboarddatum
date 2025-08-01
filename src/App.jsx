import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Layout from "@/components/organisms/Layout";
import ProjectsDashboard from "@/components/pages/ProjectsDashboard";
import ProjectBoard from "@/components/pages/ProjectBoard";
import MyTasks from "@/components/pages/MyTasks";
import Team from "@/components/pages/Team";
import Reports from "@/components/pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ProjectsDashboard />} />
            <Route path="projects" element={<ProjectsDashboard />} />
            <Route path="projects/:projectId" element={<ProjectBoard />} />
            <Route path="my-tasks" element={<MyTasks />} />
            <Route path="team" element={<Team />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;