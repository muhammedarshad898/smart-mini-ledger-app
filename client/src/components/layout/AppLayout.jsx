import { Container, Navbar } from 'react-bootstrap';

export function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar expand="md" className="app-navbar shadow-sm mb-4">
        <Container fluid="lg">
          <Navbar.Brand className="d-flex align-items-center gap-2">
            <span className="app-navbar__logo" aria-hidden="true">
              ₿
            </span>
            <div>
              <small className="app-navbar__eyebrow d-block">Bytex Challenge</small>
              <span className="fw-semibold">Smart Mini-Ledger</span>
            </div>
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Container fluid="lg" className="app-main pb-4">
        {children}
      </Container>

      <footer className="app-footer text-center py-3">
        <Container fluid="lg">
          <small className="text-muted">
            Smart Mini-Ledger — track income, expenses, and summaries
          </small>
        </Container>
      </footer>
    </div>
  );
}
