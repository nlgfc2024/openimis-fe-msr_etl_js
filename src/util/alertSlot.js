import { createPortal } from "react-dom";

export const renderInAlertSlot = (slot, content) => (slot ? createPortal(content, slot) : content);
