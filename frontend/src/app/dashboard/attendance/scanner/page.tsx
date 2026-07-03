'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../../../../lib/api';
import { Scan, ShieldAlert, CheckCircle, Search, Smartphone, UserCheck } from 'lucide-react';

export default function QRScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Manual checkin ID
  const [manualId, setManualId] = useState('');

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize html5-qrcode scanner
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    const onScanSuccess = async (decodedText: string) => {
      // Avoid double scans
      if (loading) return;
      
      try {
        setLoading(true);
        setScanResult(decodedText);
        setSuccessMsg(null);
        setErrorMsg(null);

        // Pause scanning while request executes
        scanner.pause(true);

        const res = await API.post('/attendance/checkin', {
          memberId: decodedText,
          method: 'QR'
        });

        setSuccessMsg(res.data.message || 'Check-in successful!');
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.response?.data?.error || 'Failed to check-in member.');
      } finally {
        setLoading(false);
        // Resume scanning after 3 seconds
        setTimeout(() => {
          if (scannerRef.current) {
            scannerRef.current.resume();
            setScanResult(null);
          }
        }, 3000);
      }
    };

    const onScanFailure = (error: any) => {
      // Console error can be very verbose, skip log to prevent clutter
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      // Clear scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Error clearing scanner: ', err));
      }
    };
  }, []);

  const handleManualCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId) return;

    try {
      setLoading(true);
      setSuccessMsg(null);
      setErrorMsg(null);

      const res = await API.post('/attendance/checkin', {
        memberId: manualId.trim(),
        method: 'Manual'
      });

      setSuccessMsg(res.data.message || 'Check-in successful!');
      setManualId('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to check-in member.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Attendance QR Scanner</h2>
        <p className="text-zinc-500 text-xs mt-1">Scan a member&apos;s personal entry code or enter details manually</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* QR Scanner Container */}
        <div className="glass-card p-6 rounded-3xl flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Scan className="w-5 h-5 text-[#ff6b35] animate-pulse" />
            <span className="font-bold text-xs uppercase text-zinc-300 tracking-wider">Webcam Scanner Active</span>
          </div>

          {/* HTML5 QR Code element */}
          <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-zinc-800 bg-black p-2">
            <div id="reader" className="w-full text-white"></div>
          </div>

          <p className="text-[10px] text-zinc-500 mt-4 text-center leading-relaxed">
            Align the member&apos;s digital QR code inside the bounding box. The camera will auto-detect and register check-ins.
          </p>
        </div>

        {/* Scan Log & Manual Input */}
        <div className="space-y-6">
          {/* Result Alert overlay */}
          {(successMsg || errorMsg || loading) && (
            <div className="glass-card p-6 rounded-3xl border border-zinc-800 space-y-4">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Scanner Response</span>

              {loading && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs py-2">
                  <span className="w-4 h-4 border-2 border-[#ff6b35]/20 border-t-[#ff6b35] rounded-full animate-spin"></span>
                  <span>Executing credentials database search...</span>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-[#39ff14] text-xs flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 shrink-0 text-[#39ff14]" />
                  <div>
                    <h4 className="font-bold mb-1">Check-in Confirmed</h4>
                    <p className="text-zinc-400">{successMsg}</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
                  <div>
                    <h4 className="font-bold mb-1">Check-in Rejected</h4>
                    <p className="text-zinc-400">{errorMsg}</p>
                  </div>
                </div>
              )}

              {scanResult && (
                <div className="text-[10px] text-zinc-600 font-mono select-all break-all bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-900">
                  Scanned String: {scanResult}
                </div>
              )}
            </div>
          )}

          {/* Manual Input form */}
          <div className="glass-card p-6 rounded-3xl border border-zinc-800 space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-xs uppercase text-zinc-300 tracking-wider">Manual Member Entry</span>
            </div>

            <form onSubmit={handleManualCheckin} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1.5 ml-1">
                  Member MongoDB User ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="e.g. 646a78b9c20..."
                    className="flex-1 h-11 px-4 text-xs glass-input rounded-xl text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary rounded-xl px-5 h-11 text-xs font-semibold shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    Enter
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
