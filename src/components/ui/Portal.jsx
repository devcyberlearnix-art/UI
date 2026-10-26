import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const portalContainers = new Map();

function acquirePortalContainer(containerId) {
  let entry = portalContainers.get(containerId);

  if (!entry) {
    let container = document.getElementById(containerId);
    const owned = !container;

    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      document.body.appendChild(container);
    }

    entry = { container, owned, references: 0 };
    portalContainers.set(containerId, entry);
  }

  entry.references += 1;
  return entry;
}

function releasePortalContainer(containerId, entry) {
  entry.references -= 1;

  if (entry.references === 0 && entry.owned && entry.container.childNodes.length === 0) {
    entry.container.remove();
    portalContainers.delete(containerId);
  }
}

const Portal = ({ children, containerId = "portal-root" }) => {
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    const entry = acquirePortalContainer(containerId);
    setPortalContainer(entry.container);

    return () => {
      releasePortalContainer(containerId, entry);
    };
  }, [containerId]);

  return portalContainer ? createPortal(children, portalContainer) : null;
};

export default Portal;
