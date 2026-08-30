import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute";
import { AdminLayout } from "./components/AdminLayout";
import { PublicLayout } from "./components/PublicLayout";
import { AdminContentPage } from "./pages/admin/AdminContentPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminIndexingPage } from "./pages/admin/AdminIndexingPage";
import { AdminJournalManagePage } from "./pages/admin/AdminJournalManagePage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminSubmissionsPage } from "./pages/admin/AdminSubmissionsPage";
import { AdminTestimonialsPage } from "./pages/admin/AdminTestimonialsPage";
import { AboutPage } from "./pages/public/AboutPage";
import { ArticleDetailPage } from "./pages/public/ArticleDetailPage";
import { AuthorGuidelinesPage } from "./pages/public/AuthorGuidelinesPage";
import { EbooksPage } from "./pages/public/EbooksPage";
import { HomePage } from "./pages/public/HomePage";
import { JournalDetailPage } from "./pages/public/JournalDetailPage";
import { ArchiveVolumePage } from "./pages/public/ArchiveVolumePage";
import { JournalsPage } from "./pages/public/JournalsPage";
import { MembershipPage } from "./pages/public/MembershipPage";
import { OpenAccessPage } from "./pages/public/OpenAccessPage";
import { PeerReviewPage } from "./pages/public/PeerReviewPage";
import { PptsPage } from "./pages/public/PptsPage";
import { ReprintsPage } from "./pages/public/ReprintsPage";
import { SubmissionPage } from "./pages/public/SubmissionPage";
import { VideosPage } from "./pages/public/VideosPage";

const JournalRedirect = () => {
  const { slug } = useParams();

  return <Navigate to={`/journals/${slug}/about`} replace />;
};

const App = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/open-access" element={<OpenAccessPage />} />
        <Route path="/journals" element={<JournalsPage />} />
        <Route path="/journals/:slug" element={<JournalRedirect />} />
        <Route path="/journals/:slug/:section" element={<JournalDetailPage />} />
        <Route path="/journals/:slug/archive/:volumeId" element={<ArchiveVolumePage />} />
        <Route path="/article/:articleId" element={<ArticleDetailPage />} />
        <Route path="/journal-details" element={<Navigate to="/journals" replace />} />
        <Route path="/journal-details/:slug" element={<JournalRedirect />} />
        <Route path="/peer-review" element={<PeerReviewPage />} />
        <Route path="/author-guidelines" element={<AuthorGuidelinesPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/ebooks" element={<EbooksPage />} />
        <Route path="/reprints" element={<ReprintsPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/ppts" element={<PptsPage />} />
        <Route path="/submit" element={<SubmissionPage />} />
        <Route path="/onlinesubmission" element={<Navigate to="/submit" replace />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/journals" replace />} />
        <Route path="journals" element={<AdminDashboardPage />} />
        <Route path="journals/:journalId/manage" element={<AdminJournalManagePage />} />
        <Route path="submissions" element={<AdminSubmissionsPage />} />
        <Route path="testimonials" element={<AdminTestimonialsPage />} />
        <Route
          path="videos"
          element={
            <AdminContentPage
              initialTab="videos"
              showTabs={false}
              contentScope="global"
              title="Global videos"
              description="Manage videos shown in the public navigation."
            />
          }
        />
        <Route
          path="ppts"
          element={
            <AdminContentPage
              initialTab="ppts"
              showTabs={false}
              contentScope="global"
              title="Global PPTs"
              description="Manage slide decks shown in the public navigation."
            />
          }
        />
        <Route path="indexing" element={<AdminIndexingPage />} />
        <Route path="content" element={<AdminContentPage />} />
      </Route>
    </Routes>
  );
};

export default App;
