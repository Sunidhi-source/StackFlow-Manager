import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentWorkspace } from "../features/workspaceSlice";
import { useNavigate } from "react-router-dom";
import CreateWorkspaceModal from "./CreateWorkspaceModel";

function WorkspaceDropdown() {
    const { workspaces, currentWorkspace } = useSelector((state) => state.workspace);
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onSelectWorkspace = (workspace) => {
        dispatch(setCurrentWorkspace(workspace));
        setIsOpen(false);
        navigate('/');
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative m-4" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="w-full flex items-center justify-between p-3 h-auto text-left rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-zinc-700">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                        {currentWorkspace?.name?.charAt(0) || "W"}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-800 dark:text-white text-sm truncate">
                            {currentWorkspace?.name || "Select Workspace"}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-zinc-400 uppercase tracking-widest font-medium">
                            {workspaces?.length || 0} Available
                        </p>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl top-full left-0 mt-2 py-2">
                    <p className="text-[10px] text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-2 px-4 font-bold">
                        Switch Workspace
                    </p>
                    
                    <div className="max-h-60 overflow-y-auto px-2">
                        {workspaces?.map((ws) => (
                            <div 
                                key={ws._id} 
                                onClick={() => onSelectWorkspace(ws)} 
                                className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg mb-1 transition-all ${
                                    currentWorkspace?._id === ws._id 
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800' 
                                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800 border border-transparent'
                                }`} 
                            >
                                <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-blue-600">
                                    {ws.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                                        {ws.name}
                                    </p>
                                    <p className="text-[10px] text-gray-500 dark:text-zinc-500">
                                        {ws.projects?.length || 0} Projects
                                    </p>
                                </div>
                                {currentWorkspace?._id === ws._id && (
                                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </div>

                    <hr className="my-2 border-gray-100 dark:border-zinc-800" />

                    <div className="px-2">
                        <button 
                            onClick={() => {
                                setIsModalOpen(true); // Open modal
                                setIsOpen(false);      // Close dropdown
                            }}
                            className="flex items-center text-xs gap-2 py-2 px-3 w-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-bold"
                        >
                            <Plus className="w-4 h-4" /> Create Workspace
                        </button>
                    </div>
                </div>
            )}

            {/* Render the Modal component outside the dropdown list */}
            <CreateWorkspaceModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
}

export default WorkspaceDropdown;