import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiExternalLink, FiLinkedin, FiTwitter, FiGithub, FiUser, FiPlus, FiX, FiTrash2, FiMove } from 'react-icons/fi';
import { networkPeople, centerNode } from '../../data/networkData';
import NodeModal from './NodeModal';

const IS_DEV = import.meta.env.DEV;

const BOARD_WIDTH = 1400;
const BOARD_HEIGHT = 900;

// Toolbar modes
const MODE = { VIEW: 'view', DELETE: 'delete', MOVE: 'move' };

// Auto-position new nodes on a ring around the center
const getAutoPosition = (index) => {
  const radius = 300;
  const baseAngle = -Math.PI / 6;
  const step = (2 * Math.PI) / 8;
  const angle = baseAngle + index * step;
  return {
    x: Math.round(centerNode.x + radius * Math.cos(angle)),
    y: Math.round(centerNode.y + radius * Math.sin(angle))
  };
};

export default function NetworkMap() {
  const viewportRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Unified State & Dev Save Status
  const [nodes, setNodes] = useState(networkPeople);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'
  const [modalMode, setModalMode] = useState(null); // null, 'add', 'edit'
  const [editingNode, setEditingNode] = useState(null);
  const [toolbarMode, setToolbarMode] = useState(MODE.VIEW);

  // Move-mode state
  const [movingNodeId, setMovingNodeId] = useState(null);
  const moveDragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  const allNodes = nodes;

  // Sync state if networkPeople updates via dev HMR
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNodes(networkPeople);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkPeople]);

  // Reset toolbar mode when exiting fullscreen
  useEffect(() => {
    if (!isFullScreen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToolbarMode(MODE.VIEW);
      setMovingNodeId(null);
    }
  }, [isFullScreen]);

  // API Call to save the nodes to file (dev only)
  const saveNodes = useCallback(async (nodesToSave) => {
    if (!IS_DEV) return;
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/save-network-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkPeople: nodesToSave, centerNode })
      });
      if (!response.ok) throw new Error('Failed to save network data');
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('');
      }, 2000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  }, []);

  const handleAddNodeSubmit = (formData) => {
    const pos = getAutoPosition(nodes.length);
    const newNode = {
      id: Date.now(),
      name: formData.name.trim(),
      role: formData.role.trim() || 'Connection',
      avatar: formData.avatar.trim() ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name.trim())}&background=2a2a2a&color=E0FF6F&size=256`,
      website: formData.website.trim() || '#',
      social: formData.social.trim() || '#',
      socialType: formData.socialType,
      ...pos
    };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    saveNodes(updatedNodes);
    setModalMode(null);
  };

  const handleDeleteNode = (id) => {
    const updatedNodes = nodes.filter(n => n.id !== id);
    setNodes(updatedNodes);
    saveNodes(updatedNodes);
    if (selectedNode?.id === id) setSelectedNode(null);
  };

  const handleStartEdit = (node) => {
    setEditingNode(node);
    setModalMode('edit');
  };

  const handleSaveEditSubmit = (formData) => {
    const updatedNodes = nodes.map(n => {
      if (n.id === editingNode.id) {
        return {
          ...n,
          name: formData.name.trim(),
          role: formData.role.trim() || 'Connection',
          avatar: formData.avatar.trim() ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name.trim())}&background=2a2a2a&color=E0FF6F&size=256`,
          website: formData.website.trim() || '#',
          social: formData.social.trim() || '#',
          socialType: formData.socialType
        };
      }
      return n;
    });
    setNodes(updatedNodes);
    saveNodes(updatedNodes);

    const updatedSelectedNode = updatedNodes.find(n => n.id === editingNode.id);
    if (updatedSelectedNode) {
      setSelectedNode(updatedSelectedNode);
    }

    setModalMode(null);
    setEditingNode(null);
  };

  const handleNodeClick = (node) => {
    if (toolbarMode === MODE.DELETE) {
      handleDeleteNode(node.id);
      return;
    }

    if (toolbarMode === MODE.MOVE) {
      // In move mode, selecting a node highlights it; actual moving is via drag
      return;
    }

    // Default: view profile card (toggle if clicking the already selected node)
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  };

  // --- Move-mode node dragging ---
  const handleNodeMoveStart = (e, node) => {
    if (toolbarMode !== MODE.MOVE) return;
    e.stopPropagation();
    e.preventDefault();
    setMovingNodeId(node.id);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    moveDragStart.current = { x: clientX, y: clientY, nodeX: node.x, nodeY: node.y };
  };

  const handleNodeMoveMove = useCallback((e) => {
    if (!movingNodeId) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const scale = isFullScreen ? 1 : 0.6;
    const dx = (clientX - moveDragStart.current.x) / scale;
    const dy = (clientY - moveDragStart.current.y) / scale;
    const newX = Math.round(Math.max(40, Math.min(BOARD_WIDTH - 40, moveDragStart.current.nodeX + dx)));
    const newY = Math.round(Math.max(40, Math.min(BOARD_HEIGHT - 40, moveDragStart.current.nodeY + dy)));
    setNodes(prev => prev.map(n => n.id === movingNodeId ? { ...n, x: newX, y: newY } : n));
  }, [movingNodeId, isFullScreen]);

  const handleNodeMoveEnd = useCallback(() => {
    setMovingNodeId(null);
    setNodes(prev => {
      saveNodes(prev);
      return prev;
    });
  }, [saveNodes]);

  useEffect(() => {
    if (movingNodeId) {
      window.addEventListener('mousemove', handleNodeMoveMove);
      window.addEventListener('mouseup', handleNodeMoveEnd);
      window.addEventListener('touchmove', handleNodeMoveMove);
      window.addEventListener('touchend', handleNodeMoveEnd);
      return () => {
        window.removeEventListener('mousemove', handleNodeMoveMove);
        window.removeEventListener('mouseup', handleNodeMoveEnd);
        window.removeEventListener('touchmove', handleNodeMoveMove);
        window.removeEventListener('touchend', handleNodeMoveEnd);
      };
    }
  }, [movingNodeId, handleNodeMoveMove, handleNodeMoveEnd]);

  // Recenter function based on active viewport bounds
  const recenterBoard = () => {
    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const initialX = (rect.width - BOARD_WIDTH) / 2;
      const initialY = (rect.height - BOARD_HEIGHT) / 2;
      setPan({ x: initialX, y: initialY });
    }
  };

  // Center on load
  useEffect(() => {
    recenterBoard();
  }, []);

  // Recenter when switching fullscreen viewports
  useEffect(() => {
    const timer = setTimeout(recenterBoard, 100);
    return () => clearTimeout(timer);
  }, [isFullScreen]);

  // Lock document scroll when fullscreen is active
  useEffect(() => {
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  // Prevent wheel scrolling when cursor is on the map
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    
    const preventWheelScroll = (e) => {
      e.preventDefault();
    };

    viewport.addEventListener('wheel', preventWheelScroll, { passive: false });
    return () => viewport.removeEventListener('wheel', preventWheelScroll);
  }, []);

  const handleMouseDown = (e) => {
    // Don't pan while moving a node
    if (movingNodeId) return;
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e) => {
    if (movingNodeId) return;
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const minX = rect.width - BOARD_WIDTH - 200;
      const maxX = 200;
      const minY = rect.height - BOARD_HEIGHT - 200;
      const maxY = 200;

      setPan({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY))
      });
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (movingNodeId) return;
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
  };

  const handleTouchMove = (e) => {
    if (movingNodeId) return;
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.current.x;
    const newY = touch.clientY - dragStart.current.y;

    if (viewportRef.current) {
      const rect = viewportRef.current.getBoundingClientRect();
      const minX = rect.width - BOARD_WIDTH - 200;
      const maxX = 200;
      const minY = rect.height - BOARD_HEIGHT - 200;
      const maxY = 200;

      setPan({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY))
      });
    }
  };

  const getSocialIcon = (type) => {
    switch (type) {
      case 'linkedin': return <FiLinkedin className="w-4 h-4" />;
      case 'twitter': return <FiTwitter className="w-4 h-4" />;
      case 'github': return <FiGithub className="w-4 h-4" />;
      default: return <FiUser className="w-4 h-4" />;
    }
  };

  const getCardStyle = (node) => {
    if (!node) return {};
    const cardWidth = 300;
    const cardHeight = 390;
    const gap = 40;

    let left = node.x + gap;
    if (node.x >= BOARD_WIDTH / 2) {
      left = node.x - cardWidth - gap;
    }

    let top = node.y - cardHeight / 2;
    top = Math.max(20, Math.min(BOARD_HEIGHT - cardHeight - 20, top));

    return { 
      left: `${left}px`, 
      top: `${top}px`,
      width: `${cardWidth}px`
    };
  };

  // Cursor for current mode
  const getCursorClass = () => {
    if (movingNodeId) return 'cursor-grabbing';
    if (toolbarMode === MODE.DELETE) return 'cursor-crosshair';
    if (toolbarMode === MODE.MOVE) return 'cursor-move';
    if (isDragging) return 'cursor-grabbing';
    return 'cursor-grab';
  };

  const mapContent = (
    <div 
      ref={viewportRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUpOrLeave}
      className={`bg-[#121212] select-none touch-none transition-all duration-300 ${
        isFullScreen 
          ? 'fixed inset-0 w-screen h-screen z-[2000] overflow-hidden' 
          : 'relative w-full max-w-[800px] h-[50vh] aspect-square mx-auto rounded-[30px] border border-border mt-10 overflow-hidden'
      } ${getCursorClass()}`}
      style={{
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '24px 24px'
      }}
    >
      {/* Draggable FigJam Board Canvas Container */}
      <div 
        className="absolute transition-transform duration-75 ease-out"
        style={{ 
          width: `${BOARD_WIDTH}px`, 
          height: `${BOARD_HEIGHT}px`,
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${isFullScreen ? 1 : 0.6})`,
          transformOrigin: 'center center'
        }}
      >
        {/* Connection SVG Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}>
          {allNodes.map((node) => {
            const isHighlighted = selectedNode?.id === node.id || hoveredNode?.id === node.id;
            const isMoving = movingNodeId === node.id;
            return (
              <line
                key={node.id}
                x1={centerNode.x}
                y1={centerNode.y}
                x2={node.x}
                y2={node.y}
                stroke={isMoving ? '#facc15' : isHighlighted ? '#E0FF6F' : 'rgba(234, 234, 234, 0.08)'}
                strokeWidth={isHighlighted || isMoving ? 2.5 : 1.5}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Center Node (Me) */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
          style={{ left: `${centerNode.x}px`, top: `${centerNode.y}px` }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-[66px] h-[66px] bg-[#E0FF6F] p-[3px] rounded-full shadow-[0_0_20px_rgba(224,255,111,0.4)]">
              <img
                src={centerNode.avatar}
                alt={centerNode.name}
                className="w-full h-full rounded-full object-cover border border-bg-dark"
                draggable={false}
              />
            </div>
            {/* Center label */}
            <span className="absolute top-[76px] whitespace-nowrap bg-bg-dark border border-border px-3 py-1 rounded-full text-[0.8rem] font-mono uppercase tracking-tight text-white font-medium">
              ME
            </span>
          </div>
        </div>

        {/* Peer/Client Nodes */}
        {allNodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isHovered = hoveredNode?.id === node.id;
          const isBeingMoved = movingNodeId === node.id;
          const inDeleteMode = toolbarMode === MODE.DELETE;
          const inMoveMode = toolbarMode === MODE.MOVE;

          return (
            <div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 ${isBeingMoved ? 'z-40' : ''}`}
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
            >
              <button
                onClick={() => handleNodeClick(node)}
                onMouseDown={(e) => inMoveMode && handleNodeMoveStart(e, node)}
                onTouchStart={(e) => inMoveMode && handleNodeMoveStart(e, node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`focus:outline-none block relative ${
                  inDeleteMode ? 'cursor-crosshair' : inMoveMode ? 'cursor-move' : 'cursor-pointer'
                }`}
              >
                <div
                  className={`w-[52px] h-[52px] rounded-full p-[2px] bg-bg-card border-2 transition-all duration-300 hover:scale-110 ${
                    isBeingMoved
                      ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-110'
                      : isSelected
                        ? 'border-accent shadow-[0_0_15px_rgba(224,255,111,0.5)] scale-105'
                        : isHovered
                          ? 'border-accent/60 scale-105'
                          : 'border-border'
                  }`}
                >
                  <img
                    src={node.avatar}
                    alt={node.name}
                    className="w-full h-full rounded-full object-cover"
                    draggable={false}
                  />
                </div>

                {/* Delete mode indicator on nodes */}
                {inDeleteMode && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white pointer-events-none animate-pulse">
                    <FiX className="w-3 h-3" />
                  </div>
                )}

                {/* Move mode indicator on nodes */}
                {inMoveMode && !isBeingMoved && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-black pointer-events-none">
                    <FiMove className="w-2.5 h-2.5" />
                  </div>
                )}
              </button>
            </div>
          );
        })}

        {/* Absolute Detail Profile Card Overlay next to node on canvas */}
        {selectedNode && toolbarMode === MODE.VIEW && (
          <div 
            className="absolute bg-bg-dark border border-border rounded-[24px] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 transition-all duration-300 animate-fade-in"
            style={getCardStyle(selectedNode)}
          >
            {/* Avatar & Top Section */}
            <div className="relative w-full h-[240px]">
              <img
                src={selectedNode.avatar}
                alt={selectedNode.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              {/* Fade Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-bg-dark via-bg-dark/80 to-transparent pointer-events-none" />

              {/* Dev Edit Button */}
              {IS_DEV && (
                <button
                  onClick={() => handleStartEdit(selectedNode)}
                  className="absolute top-4 left-4 w-8 h-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-accent hover:bg-black/60 cursor-pointer select-none focus:outline-none transition-colors z-10"
                  title="Edit Node Info"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 cursor-pointer select-none focus:outline-none transition-colors z-10"
                aria-label="Close Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Text overlay at the bottom of the avatar */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-2 flex flex-col gap-1 z-10">
                <h3 className="text-[1.4rem] font-semibold text-white tracking-tight leading-none text-left">
                  {selectedNode.name}
                </h3>
                <p className="text-[0.85rem] text-[#E0FF6F] font-mono uppercase tracking-wide text-left">
                  {selectedNode.role}
                </p>
              </div>
            </div>

            {/* Information & Action buttons */}
            <div className="flex flex-col px-5 pb-5 pt-3 bg-bg-dark w-full">
              <p className="text-[0.85rem] text-text-secondary leading-relaxed mb-4 text-left">
                Part of my professional network. Connected on collaborative projects and design workflows.
              </p>

              <div className="flex flex-row gap-2.5 w-full mt-auto">
                <a
                  href={selectedNode.social}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#2a2a2a] text-white border border-border py-2.5 rounded-[12px] font-sans font-medium text-[0.9rem] hover:bg-[#333333] transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {getSocialIcon(selectedNode.socialType)}
                  <span>Follow</span>
                </a>
                <a
                  href={selectedNode.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[44px] h-[44px] bg-[#E0FF6F] text-bg-dark rounded-[12px] flex items-center justify-center hover:opacity-90 transition-opacity duration-200 flex-shrink-0"
                  title="Visit Portfolio"
                >
                  <FiExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Instructions HUD */}
      <div className="absolute top-4 left-4 z-40 bg-bg-dark/80 backdrop-blur border border-border/80 px-4 py-2 rounded-full text-[0.8rem] text-text-secondary font-mono uppercase tracking-wider max-md:hidden pointer-events-none">
        {toolbarMode === MODE.DELETE
          ? 'Click a node to delete it'
          : toolbarMode === MODE.MOVE
            ? 'Drag a node to reposition it'
            : 'Drag to Pan • Click nodes to view'
        }
      </div>

      {/* Dev-only: Floating Toolbar Bar — only in fullscreen */}
      {IS_DEV && isFullScreen && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 bg-[#1a1a1a]/90 backdrop-blur-xl border border-border/60 rounded-2xl p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
          {/* Add */}
          <button
            onClick={() => { setModalMode('add'); setToolbarMode(MODE.VIEW); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.78rem] font-mono uppercase tracking-wider cursor-pointer select-none focus:outline-none transition-all duration-200 bg-accent text-bg-dark font-semibold hover:opacity-90"
            title="Add a new node"
          >
            <FiPlus className="w-4 h-4" />
            <span className="max-sm:hidden">Add</span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-border/40 mx-1" />

          {/* Delete toggle */}
          <button
            onClick={() => {
              setToolbarMode(prev => prev === MODE.DELETE ? MODE.VIEW : MODE.DELETE);
              setSelectedNode(null);
              setMovingNodeId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.78rem] font-mono uppercase tracking-wider cursor-pointer select-none focus:outline-none transition-all duration-200 ${
              toolbarMode === MODE.DELETE
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
            title="Delete mode — click nodes to remove"
          >
            <FiTrash2 className="w-4 h-4" />
            <span className="max-sm:hidden">Delete</span>
          </button>

          {/* Move toggle */}
          <button
            onClick={() => {
              setToolbarMode(prev => prev === MODE.MOVE ? MODE.VIEW : MODE.MOVE);
              setSelectedNode(null);
              setMovingNodeId(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.78rem] font-mono uppercase tracking-wider cursor-pointer select-none focus:outline-none transition-all duration-200 ${
              toolbarMode === MODE.MOVE
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
            title="Move mode — drag nodes to reposition"
          >
            <FiMove className="w-4 h-4" />
            <span className="max-sm:hidden">Move</span>
          </button>
        </div>
      )}

      {/* Reusable Node Modal (Add / Edit) */}
      {IS_DEV && (
        <NodeModal
          isOpen={modalMode !== null}
          onClose={() => { setModalMode(null); setEditingNode(null); }}
          onSubmit={modalMode === 'add' ? handleAddNodeSubmit : handleSaveEditSubmit}
          title={modalMode === 'add' ? 'Add Network Node' : 'Edit Network Node'}
          submitLabel={modalMode === 'add' ? 'Add Node' : 'Save Changes'}
          initialData={modalMode === 'edit' ? editingNode : null}
        />
      )}


      {/* Save Status Indicator */}
      {saveStatus && (
        <div className={`absolute top-4 right-16 z-[60] px-4 py-2 h-[42px] rounded-full text-[0.8rem] font-mono border transition-all duration-300 flex items-center gap-2 ${
          saveStatus === 'saving'
            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
            : saveStatus === 'saved'
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            saveStatus === 'saving'
              ? 'bg-yellow-400 animate-pulse'
              : saveStatus === 'saved'
                ? 'bg-green-400'
                : 'bg-red-400'
          }`} />
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'saved' && 'Saved'}
          {saveStatus === 'error' && 'Save failed'}
        </div>
      )}

      {/* Fullscreen Toggle Button */}
      <button
        onClick={() => setIsFullScreen(!isFullScreen)}
        className="absolute top-4 right-4 z-[60] bg-bg-dark/80 hover:bg-bg-dark hover:text-accent border border-border/80 p-2.5 rounded-full text-text-secondary cursor-pointer select-none transition-colors duration-200 focus:outline-none"
        title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullScreen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
          </svg>
        )}
      </button>
    </div>
  );

  if (isFullScreen) {
    return createPortal(mapContent, document.body);
  }

  return mapContent;
}
