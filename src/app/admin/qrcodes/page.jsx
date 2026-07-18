'use client';

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { generateQrPdf, buildQrImageUrl } from '@/lib/qrPdf';
import { QrCode, RefreshCw, Copy, FileDown, Download } from 'lucide-react';

const QR_API = (data, size = 200) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;

function buildRestaurantUrl(baseUrl, slug) {
  if (!baseUrl || !slug) return '';
  return `${baseUrl}/?slug=${slug}`;
}

export default function QrCodesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [baseUrl] = useState(() =>
    typeof window !== 'undefined' ? window.location.origin : ''
  );
  const pdfLockRef = useRef(false);

  const slug = user?.tenantSlug || '';
  const menuUrl = buildRestaurantUrl(baseUrl, slug);

  const fetchQrCode = async () => {
    try {
      const data = await apiFetch('/qrcodes');
      if (data) setQrCode(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrCode();
  }, []);

  const handleGenerate = async () => {
    if (!menuUrl) return;
    setGenerating(true);
    try {
      const data = await apiFetch('/qrcodes', {
        method: 'POST',
        body: JSON.stringify({
          url: menuUrl,
          label: user?.tenantName ? `${user.tenantName} Menu` : 'Restaurant Menu',
        }),
      });
      if (data) setQrCode(data);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (pdfLockRef.current) return;
    const url = qrCode?.url || menuUrl;
    if (!url) return;

    pdfLockRef.current = true;
    setDownloadingPdf(true);
    try {
      await generateQrPdf({
        menuUrl: url,
        tenantName: user?.tenantName || 'Restaurant',
        imageSrc: buildQrImageUrl(url, 600),
        filename: `${slug || 'restaurant'}-qr-code.pdf`,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Could not generate PDF. Try downloading the PNG instead.');
    } finally {
      pdfLockRef.current = false;
      setDownloadingPdf(false);
    }
  };

  const copyUrl = () => navigator.clipboard.writeText(qrCode?.url || menuUrl);

  if (loading) return <div className="view-loader-container"><div className="spinner" /></div>;

  const displayUrl = qrCode?.url || menuUrl;

  return (
    <div className="data-page fade-in">
      <div className="page-header">
        <h1><QrCode size={22} /> Restaurant QR Code</h1>
        <div className="page-header-right">
          {qrCode && (
            <button className="btn-secondary" onClick={handleDownloadPdf} disabled={downloadingPdf}>
              <FileDown size={16} /> {downloadingPdf ? 'Generating PDF…' : 'Download PDF'}
            </button>
          )}
          <button className="btn-primary" onClick={handleGenerate} disabled={generating || !menuUrl}>
            <RefreshCw size={16} /> {qrCode ? 'Regenerate' : 'Generate QR Code'}
          </button>
        </div>
      </div>

      <div className="qrcode-grid" style={{ maxWidth: '480px' }}>
        {!qrCode ? (
          <div className="data-card glass" style={{ gridColumn: '1 / -1' }}>
            <p className="empty-text">
              No restaurant QR code yet. Generate one so customers can scan and view your menu.
              Customers enter their table number at checkout — the QR identifies your restaurant only.
            </p>
            {menuUrl && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                Preview URL: <code>{menuUrl}</code>
              </p>
            )}
          </div>
        ) : (
          <div className="qrcode-card glass">
            <div className="qrcode-header">
              <QrCode size={24} />
              <span>{user?.tenantName || 'Restaurant Menu'}</span>
            </div>
            <img
              src={QR_API(displayUrl, 220)}
              alt="Restaurant menu QR code"
              className="qrcode-image"
            />
            <div className="qrcode-destination">
              <span className="qrcode-dest-label">Redirects to:</span>
              <span className="qrcode-dest-url">{displayUrl}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
              One QR code for your entire restaurant. Customers choose their table when ordering.
            </p>
            <div className="qrcode-actions">
              <button className="btn-sm btn-primary" onClick={copyUrl}>
                <Copy size={13} /> Copy URL
              </button>
              <a
                href={QR_API(displayUrl, 400)}
                download={`${slug || 'restaurant'}-menu-qr.png`}
                className="btn-sm btn-secondary"
              >
                <Download size={13} /> PNG
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
