import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader } from './components/SiteHeader'
import { ArticlePage } from './pages/ArticlePage'
import { ExchangesPage } from './pages/ExchangesPage'
import { HomePage } from './pages/HomePage'
import { NewsDetailPage } from './pages/NewsDetailPage'

function Shell() {
  return (
    <div className="min-h-full">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 md:px-6 md:pt-7">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<HomePage />} />
          <Route path="/news" element={<NewsDetailPage />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/exchanges" element={<ExchangesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

function NotFoundPage() {
  return (
    <div className="mx-auto max-w-[900px] py-12">
      <div className="mono text-[11px] font-semibold tracking-widest text-[rgb(var(--c-accent))]">404</div>
      <div className="headline mt-2 text-[34px] font-semibold text-white md:text-[44px]">Page not found</div>
      <div className="mt-3 text-[16px] leading-relaxed text-white/65">
        This route does not exist in the UI prototype.
      </div>
    </div>
  )
}
