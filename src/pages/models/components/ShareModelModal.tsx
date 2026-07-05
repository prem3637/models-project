import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../../components/ui/Button';
import { useShareModelProfileMutation } from '../../../redux/services/models';
import { getErrorMessage } from '../../../utils/errorHelper';

interface ShareModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelId: string;
}

export const ShareModelModal: React.FC<ShareModelModalProps> = ({
  isOpen,
  onClose,
  modelId,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [shareModelProfile, { isLoading: isSharing }] = useShareModelProfileMutation();

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    const loadingToast = toast.loading("Sending share email...");
    try {
      await shareModelProfile({ id: modelId, email: recipientEmail.trim() }).unwrap();
      toast.dismiss(loadingToast);
      toast.success("Profile shared successfully via email");
      setRecipientEmail('');
      onClose();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errMsg = getErrorMessage(err, "Failed to share model profile");
      toast.error(errMsg);
    }
  };

  const handleClose = () => {
    if (!isSharing) {
      setRecipientEmail('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-navy-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-navy-border relative z-50 transition-all duration-200">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
          Share Model Profile
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Send a secure, temporary link to view this model's details. The recipient will be able to access the full portfolio and intro video for 24 hours without a login.
        </p>

        <form onSubmit={handleShare} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Recipient Email Address
            </label>
            <input
              type="email"
              required
              placeholder="client@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 dark:focus:ring-accent-500/50 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClose}
              disabled={isSharing}
              className="dark:bg-[#0f1422] dark:border-navy-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSharing}
            >
              Send Email
            </Button>
          </div>
        </form>
      </div>
      <div className="absolute inset-0 cursor-default" onClick={handleClose} />
    </div>
  );
};

export default ShareModelModal;
