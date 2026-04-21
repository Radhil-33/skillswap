import { useEffect, useRef, useState } from 'react';
import { PenTool, Eraser, Trash2 } from 'lucide-react';

export default function Whiteboard({ socket, userId }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const contextRef = useRef(null);

  // Initialize canvas and socket listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to fill the container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    if (!socket) return;

    // Listen for remote drawing events
    const handleRemoteDraw = ({ x0, y0, x1, y1, lineWidth: width, tool: remoteType, color: remoteColor }) => {
      if (!context) return;

      const scaleX = canvas.width / canvas.offsetWidth;
      const scaleY = canvas.height / canvas.offsetHeight;

      if (remoteType === 'eraser') {
        context.clearRect(x0 * scaleX, y0 * scaleY, width * 2, width * 2);
        context.clearRect(x1 * scaleX, y1 * scaleY, width * 2, width * 2);
      } else {
        context.strokeStyle = remoteColor;
        context.lineWidth = width;
        context.beginPath();
        context.moveTo(x0 * scaleX, y0 * scaleY);
        context.lineTo(x1 * scaleX, y1 * scaleY);
        context.stroke();
      }
    };

    const handleClearWhiteboard = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('whiteboard-draw', handleRemoteDraw);
    socket.on('whiteboard-clear', handleClearWhiteboard);

    return () => {
      socket.off('whiteboard-draw', handleRemoteDraw);
      socket.off('whiteboard-clear', handleClearWhiteboard);
    };
  }, [socket]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const { offsetX, offsetY } = e.nativeEvent;
    const scaleX = canvas.width / canvas.offsetWidth;
    const scaleY = canvas.height / canvas.offsetHeight;

    const x = offsetX * scaleX;
    const y = offsetY * scaleY;

    const context = contextRef.current;

    if (tool === 'eraser') {
      context.clearRect(x - lineWidth, y - lineWidth, lineWidth * 2, lineWidth * 2);
    } else {
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.lineTo(x, y);
      context.stroke();
    }

    // Emit drawing event to other user
    if (socket) {
      socket.emit('whiteboard-draw', {
        x0: e.nativeEvent.movementX || offsetX,
        y0: e.nativeEvent.movementY || offsetY,
        x1: offsetX,
        y1: offsetY,
        lineWidth,
        tool,
        color,
      });
    }
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    if (socket) {
      socket.emit('whiteboard-clear');
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="bg-gray-900 text-white p-4 flex items-center gap-4 flex-wrap">
        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded flex items-center gap-2 transition ${
            tool === 'pen' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <PenTool className="h-5 w-5" />
          Pen
        </button>

        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded flex items-center gap-2 transition ${
            tool === 'eraser' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Eraser className="h-5 w-5" />
          Eraser
        </button>

        <button
          onClick={clearCanvas}
          className="p-2 rounded flex items-center gap-2 bg-red-600 hover:bg-red-700 transition"
        >
          <Trash2 className="h-5 w-5" />
          Clear
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <label className="flex items-center gap-2">
            <span className="text-sm">Color:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
              disabled={tool === 'eraser'}
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="text-sm">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm w-6">{lineWidth}</span>
          </label>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="flex-1 bg-white cursor-crosshair"
      />
    </div>
  );
}
