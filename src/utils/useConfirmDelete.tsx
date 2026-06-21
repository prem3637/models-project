import toast from "react-hot-toast";
import * as React from "react";

type DeleteCallback<T> = (item: T) => Promise<void> | void;

export const useConfirmDelete = <T extends { id: string | number }>(
  deleteCallback: DeleteCallback<T>
) => {
  const confirmDelete = (item: T, name: string, children?: React.ReactNode) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-slate-800">
            Are you sure you want to delete <b>{name}</b>?
          </p>
          {children && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              {children}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1.5 text-sm bg-slate-200 rounded hover:bg-slate-300 cursor-pointer"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
              onClick={async () => {
                toast.dismiss(t.id);
                const loadingToast = toast.loading(`Deleting ${name}...`);
                try {
                  await deleteCallback(item);
                  toast.dismiss(loadingToast);
                  toast.success(`${name} deleted successfully`);
                } catch (error: any) {
                  const errorMessage = error?.data?.message || `Failed to delete ${name}`;
                  toast.dismiss(loadingToast);
                  toast.error(errorMessage);
                  console.error("Error deleting:", error);
                }
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: 8000,
        style: children ? { maxWidth: "500px" } : undefined,
      }
    );
  };

  return { confirmDelete };
};
export default useConfirmDelete;
