import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import MyTasksSidebar from './MyTasksSidebar'
import ProjectSidebar from './ProjectsSidebar'
import WorkspaceDropdown from './WorkspaceDropdown'
import WorkspaceSettings from '../pages/WSettings'
import { FolderOpenIcon, LayoutDashboardIcon, SettingsIcon, UsersIcon } from 'lucide-react'

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
    // 🔹 Core Menu Items
    const menuItems = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboardIcon },
        { name: 'Projects', href: '/projects', icon: FolderOpenIcon },
        { name: 'Team', href: '/team', icon: UsersIcon },
    ]

    const sidebarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsSidebarOpen]);

    return (
        <div ref={sidebarRef} className={`z-10 bg-white dark:bg-zinc-900 min-w-68 flex flex-col h-screen border-r border-gray-200 dark:border-zinc-800 max-sm:absolute transition-all ${isSidebarOpen ? 'left-0' : '-left-full'} `} >
            <WorkspaceDropdown />
            <hr className='border-gray-200 dark:border-zinc-800' />
            
            <div className='flex-1 overflow-y-scroll no-scrollbar flex flex-col'>
                <div className='p-4 space-y-1'>
                    {/* Main Navigation */}
                    {menuItems.map((item) => (
                        <NavLink 
                            to={item.href} 
                            key={item.name} 
                            end={item.href === '/'} 
                            className={({ isActive }) => 
                                `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all ${
                                    isActive 
                                    ? 'bg-gray-100 dark:bg-zinc-800' 
                                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                                }`
                            }
                        >
                            <item.icon size={16} />
                            <p className='text-sm truncate'>{item.name}</p>
                        </NavLink>
                    ))}

                    {/* 🔹 UPDATED: Professional Workspace Settings Link */}
                    <NavLink 
                        to="/settings/workspace" 
                        className={({ isActive }) => 
                            `flex items-center gap-3 py-2 px-4 text-gray-800 dark:text-zinc-100 cursor-pointer rounded transition-all ${
                                isActive 
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                                : 'hover:bg-gray-50 dark:hover:bg-zinc-800/60'
                            }`
                        }
                    >
                        <SettingsIcon size={16} />
                        <p className='text-sm truncate'>Workspace Settings</p>
                    </NavLink>
                </div>

                <hr className='mx-4 border-gray-100 dark:border-zinc-800' />

                {/* Sub-sidebars for Tasks and Projects */}
                <MyTasksSidebar />
                <ProjectSidebar />
            </div>
        </div>
    )
}

export default Sidebar