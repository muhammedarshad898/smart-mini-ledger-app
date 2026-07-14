import { useEffect, useState } from 'react';
import { Alert, Button, Card, Collapse, Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getSettings, updateSettings } from '../../services/api.js';

export function NotificationSettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [savedEmail, setSavedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await getSettings();

        if (response.success) {
          const currentEmail = response.data?.notifyEmail || '';
          setNotifyEmail(currentEmail);
          setSavedEmail(currentEmail);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError(null);

      const response = await updateSettings({ notifyEmail });

      if (response.success) {
        const currentEmail = response.data?.notifyEmail || '';
        setNotifyEmail(currentEmail);
        setSavedEmail(currentEmail);
        toast.success('Notification settings saved');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Header className="bg-white py-3">
        <div className="d-flex justify-content-between align-items-center gap-3">
          <div>
            <h3 className="h6 mb-1">Alert Settings</h3>
            <small className="text-muted">
              {savedEmail ? `Sending alerts to ${savedEmail}` : 'No notification email configured'}
            </small>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setIsOpen((current) => !current)}
            aria-controls="notification-settings"
            aria-expanded={isOpen}
          >
            {isOpen ? 'Hide' : 'Configure'}
          </Button>
        </div>
      </Card.Header>

      <Collapse in={isOpen}>
        <div id="notification-settings">
          <Card.Body>
            {error && <Alert variant="danger">Error: {error}</Alert>}

            {isLoading ? (
              <div className="d-flex align-items-center gap-2 text-muted">
                <Spinner animation="border" size="sm" />
                <span>Loading notification settings...</span>
              </div>
            ) : (
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="notificationEmail">
                  <Form.Label>Notification Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={notifyEmail}
                    onChange={(event) => setNotifyEmail(event.target.value)}
                  />
                </Form.Group>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </Form>
            )}
          </Card.Body>
        </div>
      </Collapse>
    </Card>
  );
}
