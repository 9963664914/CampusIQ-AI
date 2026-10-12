import React from 'react';
import { X } from 'lucide-react';
import { UserLoginForm, UserLoginFormProps } from './UserLoginForm';

interface LoginModalProps extends UserLoginFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'student',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-lg w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 shadow-xl transition-transform hover:scale-110 cursor-pointer"
          title="Close Login Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Embedded User Login Form */}
        <UserLoginForm
          onSuccess={(role, user, target) => {
            onSuccess(role, user, target);
            onClose();
          }}
          onCancel={onClose}
          initialRole={initialRole}
        />
      </div>
    </div>
  );
};

export default LoginModal;
