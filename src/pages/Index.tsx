import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { initializeStore } from "@/lib/store";

const Index = () => {
  useEffect(() => {
    initializeStore();
  }, []);

  return <Navigate to="/event-types" replace />;
};

export default Index;
