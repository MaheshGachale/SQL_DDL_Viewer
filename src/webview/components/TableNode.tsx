import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface Column {
    name: string;
    type: string;
    isPk?: boolean;
    isFk?: boolean;
}

interface TableNodeData {
    label: string;
    columns: Column[];
}

const TableNode = ({ data }: { data: TableNodeData }) => {
    return (
        <div className="table-node">
            {/* Input Handle (Target) */}
            <Handle type="target" position={Position.Left} style={{ background: '#94a3b8' }} />

            <div className="table-header">
                <div className="table-title">{data.label}</div>
            </div>
            <div className="table-columns">
                {data.columns.map((col, index) => (
                    <div key={index} className="table-column" style={{ position: 'relative' }}>
                        {/* Target Handle for incoming column links (Left) */}
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={`tgt-${col.name}`}
                            style={{ top: '50%', left: '-10px', background: '#555', width: '8px', height: '8px' }}
                        />

                        <div className="column-name">
                            {col.isPk && <span className="icon-pk" title="Primary Key">PK</span>}
                            {col.isFk && <span className="icon-fk" title="Foreign Key">FK</span>}
                            <span>{col.name}</span>
                        </div>
                        <span className="column-type">{col.type}</span>

                        {/* Source Handle for outgoing column links (Right) */}
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={`src-${col.name}`}
                            style={{ top: '50%', right: '-10px', background: '#555', width: '8px', height: '8px' }}
                        />
                    </div>
                ))}
            </div>

            {/* Output Handle (Source) */}
            <Handle type="source" position={Position.Right} style={{ background: '#94a3b8' }} />
        </div>
    );
};

export default memo(TableNode);
