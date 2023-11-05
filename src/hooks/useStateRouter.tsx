import ChatBot from "@/components/ChatBot";
import TaskRoom from "@/components/TaskRoom";
import React, { useCallback, useEffect, useMemo, useState } from "react";

function useStateRouter({ currentState }) {
  const CurrentComponent = useMemo(() => {
    if (!currentState) return;
    const parentState = Object.keys(currentState.state_tree)[0];

    switch (parentState) {
      case "chatbot":
        return ChatBot;
      case "taskroom":
        return TaskRoom;
      default:
        return;
    }
  }, [currentState]);

  return { CurrentComponent };
}

export default useStateRouter;
