'use client';

import React from 'react';
import { useAuthStore } from '../../../../lib/store';
import { BASE_URL } from '../../../../lib/api';
import { Scan, Smartphone, Calendar, AlertCircle } from 'lucide-react';

export default function MyQRPage() {
  const { user, profile } = useAuthStore();

  const qrUrl = profile?.qrCodeUrl ? `${BASE_URL}/${profile.qrCodeUrl}` : null;
  const isActive = profile?.subscriptionStatus === 'active';

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-white">My Entry QR Code</h2>
        <p className="text-zinc-500 text-xs mt-1">Scan this code at the reception counter scanner to check in</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl text-center space-y-6 flex flex-col items-center">
        {/* Pulsing Scan Header */}
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-[#ff6b35] animate-pulse" />
          <span className="text-xs uppercase font-bold text-zinc-300 tracking-wider">
            Ready to Scan
          </span>
        </div>

        {/* QR Wrapper */}
        <div className="p-4 bg-white rounded-2xl border border-zinc-800 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          {qrUrl ? (
            <img 
              src={qrUrl} 
              alt="My Check-in QR" 
              className="w-48 h-48 select-none"
              draggable="false"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-zinc-500 text-xs bg-zinc-900 rounded-xl">
              Generating Code...
            </div>
          )}
        </div>

        {/* Info card */}
        <div className="w-full text-left bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500">Member Status:</span>
            <span className={`font-bold uppercase ${isActive ? 'text-[#39ff14]' : 'text-red-500'}`}>
              {isActive ? 'Active Member' : 'Inactive'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500">Plan End Date:</span>
            <span className="text-zinc-300">
              {profile?.subscriptionEnd ? new Date(profile.subscriptionEnd).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs border-t border-zinc-900 pt-2.5">
            <span className="text-zinc-500">Emergency Contact:</span>
            <span className="text-zinc-300 text-right">
              {profile?.emergencyContact?.name 
                ? `${profile.emergencyContact.name} (${profile.emergencyContact.relationship})` 
                : 'Not Set'}
            </span>
          </div>
        </div>

        {/* Security Warning */}
        <div className="flex items-start gap-2.5 text-[10px] text-zinc-500 text-left leading-normal">
          <AlertCircle className="w-4.5 h-4.5 text-zinc-600 shrink-0 mt-0.5" />
          <p>
            This code is unique to your membership account. Sharing this code with others for check-in is strictly prohibited and can result in membership suspension.
          </p>
        </div>
      </div>
    </div>
  );
}
