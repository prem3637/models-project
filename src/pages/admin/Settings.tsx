import React from 'react';
import Button from '../../components/ui/Button';

export const Settings: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 max-w-4xl text-slate-800">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 mb-1">System Permissions Matrix</h2>
        <p className="text-xs text-slate-500 mb-6">Overview of role abilities managed dynamically by CASL</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 font-bold">Feature / Action</th>
                <th className="py-3.5 px-4 text-center font-bold">Viewer</th>
                <th className="py-3.5 px-4 text-center font-bold">Editor</th>
                <th className="py-3.5 px-4 text-center font-bold">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-800">View Dashboard & Statistics</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-800">Browse & Filter Models</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-800">Edit Model Details</td>
                <td className="py-4 px-4 text-center text-red-500 font-bold text-sm">✕</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-800">Create New Models</td>
                <td className="py-4 px-4 text-center text-red-500 font-bold text-sm">✕</td>
                <td className="py-4 px-4 text-center text-red-500 font-bold text-sm">✕</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-800">Delete Model Profiles</td>
                <td className="py-4 px-4 text-center text-red-500 font-bold text-sm">✕</td>
                <td className="py-4 px-4 text-center text-red-500 font-bold text-sm">✕</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
              </tr>
              <tr className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 font-bold text-slate-800">Access Global Settings</td>
                <td className="py-4 px-4 text-center text-red-500 font-bold text-sm">✕</td>
                <td className="py-4 px-4 text-center text-red-500 font-bold text-sm">✕</td>
                <td className="py-4 px-4 text-center text-green-600 font-bold text-sm">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-base font-extrabold text-slate-900">Global Portal Configurations</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agency Identification Code</span>
            <input
              type="text"
              disabled
              value="RBC-AGENCY-EAST-99X"
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 select-none outline-none text-xs font-medium"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Synchronization Frequency</span>
            <select
              disabled
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 select-none outline-none text-xs font-medium"
            >
              <option>Every 5 minutes (Real-time)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
          <Button variant="secondary" size="sm">Reset System Defaults</Button>
          <Button variant="primary" size="sm">Save Config</Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
