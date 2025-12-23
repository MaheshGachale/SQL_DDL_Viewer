import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    addEdge,
    Connection,
    Edge,
    Node,
    applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange
} from 'reactflow';
import 'reactflow/dist/style.css';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-sql';
import './App.css';

import { parseSqlToElements } from './utils/sqlParser';
import TableNode from './components/TableNode';

// VS Code API type declaration
declare function acquireVsCodeApi(): {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
};

const nodeTypes = {
    table: TableNode,
};

const initialSql = `CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(100)
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  user_id INT,
  title VARCHAR(200),
  content TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`;

const App: React.FC = () => {
    const [sql, setSql] = useState(initialSql);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    // Initial generation
    React.useEffect(() => {
        handleGenerate();
    }, []);

    // Listen for messages from VS Code extension
    React.useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data;
            if (message.type === 'loadSql' && message.sql) {
                setSql(message.sql);
                // Auto-generate after loading SQL
                setTimeout(() => {
                    try {
                        const { nodes: newNodes, edges: newEdges } = parseSqlToElements(message.sql);
                        setNodes(newNodes);
                        setEdges(newEdges);
                    } catch (e) {
                        console.error(e);
                    }
                }, 50);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const handleGenerate = () => {
        try {
            const { nodes: newNodes, edges: newEdges } = parseSqlToElements(sql);
            setNodes(newNodes);
            setEdges(newEdges);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="app-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>SQL INPUT</h2>
                    <button className="generate-btn" onClick={handleGenerate}>Generate Diagram</button>
                </div>
                <div className="editor-wrapper">
                    <Editor
                        value={sql}
                        onValueChange={code => setSql(code)}
                        highlight={code => Prism.highlight(code, Prism.languages.sql, 'sql')}
                        padding={10}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 14,
                            backgroundColor: '#1e1e1e',
                            color: '#d4d4d4',
                            minHeight: '100%',
                        }}
                    />
                </div>
            </div>
            <div className="diagram-area">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background />
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </div>
        </div>
    );
};

export default App;
