import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

export default function JoinWorkspace() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user); // Get logged in user

    const workspaceId = searchParams.get("workspaceId");
    const role = searchParams.get("role");

    useEffect(() => {
        const join = async () => {
            if (!user) {
                toast.error("Please login first to join!");
                navigate("/login");
                return;
            }

            const response = await fetch("http://localhost:5000/api/workspaces/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workspaceId, role, userId: user._id }),
            });

            if (response.ok) {
                toast.success("Joined workspace successfully!");
                navigate("/dashboard"); // Take them to the projects
            }
        };

        if (workspaceId && user) join();
    }, [workspaceId, user]);

    return <div className="p-10 text-center">Joining workspace... please wait.</div>;
}