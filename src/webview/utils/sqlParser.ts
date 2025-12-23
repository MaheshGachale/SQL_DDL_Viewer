import { Node, Edge, MarkerType, Position } from 'reactflow';
import * as dagre from 'dagre';

interface Column {
    name: string;
    type: string;
    isPk: boolean;
    isFk: boolean;
}

interface TableData {
    name: string;
    columns: Column[];
    fks: { col: string, refTable: string, refCol: string }[];
    isView?: boolean;
    isCte?: boolean;
    lineage?: { sourceTable: string, sourceCol: string, targetCol: string, formula?: string }[];
}

const cleanSql = (sql: string) => {
    return sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
};

const splitByCommas = (str: string): string[] => {
    const tokens: string[] = [];
    let currentToken = '';
    let parenLevel = 0;
    for (let char of str) {
        if (char === '(') parenLevel++;
        if (char === ')') parenLevel--;
        if (char === ',' && parenLevel === 0) {
            tokens.push(currentToken.trim());
            currentToken = '';
        } else {
            currentToken += char;
        }
    }
    if (currentToken.trim()) tokens.push(currentToken.trim());
    return tokens;
};

const cleanIdentifier = (id: string) => id.replace(/["`\[\]]/g, '').trim();

// --- HELPER: Extracts logic for ANY Select body (Used for Views and CTEs) ---
const parseSelectBody = (
    name: string,
    body: string,
    isView: boolean,
    isCte: boolean,
    discoveredTableColumns: Map<string, Set<string>>,
    cteNames: Set<string>
): TableData => {
    const viewColumns: Column[] = [];
    const columnLineage: { sourceTable: string, sourceCol: string, targetCol: string, formula?: string }[] = [];
    const fks: { col: string, refTable: string, refCol: string }[] = [];

    const cleanIdentifier = (id: string) => id.replace(/["`\[\]]/g, '').trim();

    // 1. Identify Aliases and Referenced Tables
    const aliasMap = new Map<string, string>();
    const referencedTables = new Set<string>();

    // Broadened regex to handle JOIN, APPLY (T-SQL), and UNNEST (BigQuery)
    const tableRefRegex = /(?:FROM|JOIN|APPLY|UNNEST)\s+((?:["`\[][^"`\]]+["`\]]|[\w.]+))(?:\s+(?:AS\s+)?(["`\[][^"`\]]+["`\]]|[\w]+))?/gmi;

    let tMatch;
    while ((tMatch = tableRefRegex.exec(body)) !== null) {
        const fullTableName = cleanIdentifier(tMatch[1]);
        const alias = tMatch[2] ? cleanIdentifier(tMatch[2]) : null;

        const upperAlias = alias ? alias.toUpperCase() : '';
        if (alias && !['ON', 'USING', 'WHERE', 'GROUP', 'ORDER', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'LATERAL', 'LIMIT', 'OFFSET', 'WINDOW', 'QUALIFY', 'OVER'].includes(upperAlias)) {
            aliasMap.set(alias, fullTableName);
            referencedTables.add(fullTableName);
        } else {
            referencedTables.add(fullTableName);
            const parts = fullTableName.split('.');
            aliasMap.set(parts[parts.length - 1], fullTableName);
        }
    }

    // Comma Join Discovery (e.g., FROM T1, T2)
    const fromPartsMatch = body.match(/FROM\s+([\s\S]+?)(?:WHERE|GROUP|ORDER|JOIN|APPLY|UNNEST|LIMIT|OFFSET|FETCH|FOR|QUALIFY|WINDOW|$)/i);
    if (fromPartsMatch) {
        const potentialTables = splitByCommas(fromPartsMatch[1]);
        potentialTables.forEach(pt => {
            const parts = pt.trim().split(/\s+/);
            if (parts.length > 0) {
                const tName = cleanIdentifier(parts[0]);
                if (tName && !['SELECT', '(', 'CASE', 'WHEN'].includes(tName.toUpperCase())) {
                    referencedTables.add(tName);
                    const alias = parts.length > 1 ? cleanIdentifier(parts[parts.length - 1]) : null;
                    if (alias && !['AS', 'ON', 'WHERE', 'JOIN'].includes(alias.toUpperCase())) aliasMap.set(alias, tName);
                    else {
                        const bits = tName.split('.');
                        aliasMap.set(bits[bits.length - 1], tName);
                    }
                }
            }
        });
    }

    // Secondary scan for subqueries and nested joins
    const deepTableMatch = body.matchAll(/(?:FROM|JOIN|APPLY)\s+((?:["`\[][^"`\]]+["`\]]|[\w.]+))/gmi);
    for (const m of deepTableMatch) {
        referencedTables.add(cleanIdentifier(m[1]));
    }

    // 2. Extract Columns (Balance-aware extraction to handle subqueries in select list)
    const selectKeywordRegex = /SELECT\s+(?:DISTINCT\s+|ALL\s+|TOP\s+\d+\s+)?/i;
    const selectKeywordMatch = body.match(selectKeywordRegex);

    if (selectKeywordMatch) {
        const selectStart = selectKeywordMatch.index! + selectKeywordMatch[0].length;
        let balance = 0;
        let mainFromIdx = -1;
        for (let i = selectStart; i < body.length; i++) {
            if (body[i] === '(') balance++;
            else if (body[i] === ')') balance--;
            else if (balance === 0) {
                if (body.substring(i).toUpperCase().startsWith('FROM')) {
                    mainFromIdx = i;
                    break;
                }
            }
        }
        const selectList = mainFromIdx !== -1 ? body.substring(selectStart, mainFromIdx) : body.substring(selectStart);
        const columnDefs = splitByCommas(selectList);

        columnDefs.forEach(colDef => {
            colDef = colDef.trim();
            const asMatch = colDef.match(/AS\s+(["`\[][^"`\]]+["`\]]|[\w]+)$/i);
            const simpleSpaceMatch = colDef.match(/\s+(["`\[][^"`\]]+["`\]]|[\w]+)$/);

            let colName = '';
            if (asMatch) colName = cleanIdentifier(asMatch[1]);
            else if (simpleSpaceMatch) {
                const candidate = cleanIdentifier(simpleSpaceMatch[1]);
                if (!['DISTINCT', '*', 'ALL', 'TOP'].includes(candidate.toUpperCase())) colName = candidate;
            }

            const isCalculation = /[\(\)\*\+\/\-]|CASE|OVER|RANK|NTILE|ROW_NUMBER|SUM|COUNT|AVG|MIN|MAX|QUALIFY|ARRAY|UNNEST|QUALIFY/i.test(colDef.replace(/AS\s+[\s\S]+$/i, ''));
            let formula = '';

            const lineageUsageRegex = /(?:(["`\[][^"`\]]+["`\]]|[\w]+)\.)?(["`\[][^"`\]]+["`\]]|[\w]+)/g;

            if (isCalculation) {
                formula = colDef.replace(/AS\s+[\s\S]+$/i, '').trim();
                let usage;
                while ((usage = lineageUsageRegex.exec(formula)) !== null) {
                    const al = usage[1] ? cleanIdentifier(usage[1]) : null;
                    const col = cleanIdentifier(usage[2]);
                    if (al && aliasMap.has(al)) {
                        const tName = aliasMap.get(al)!;
                        if (!colName) colName = col;
                        columnLineage.push({ sourceTable: tName, sourceCol: col, targetCol: colName || col, formula: 'ƒx' });
                        if (!cteNames.has(tName)) {
                            if (!discoveredTableColumns.has(tName)) discoveredTableColumns.set(tName, new Set());
                            discoveredTableColumns.get(tName)!.add(col);
                        }
                    } else if (!al && referencedTables.size === 1) {
                        const tName = Array.from(referencedTables)[0];
                        if (!colName) colName = col;
                        columnLineage.push({ sourceTable: tName, sourceCol: col, targetCol: colName || col, formula: 'ƒx' });
                    }
                }
            } else {
                // Direct mapping
                const parts = colDef.split('.');
                if (parts.length >= 2) {
                    const al = cleanIdentifier(parts[parts.length - 2]);
                    const col = cleanIdentifier(parts[parts.length - 1]);
                    if (aliasMap.has(al)) {
                        const tName = aliasMap.get(al)!;
                        if (!colName) colName = col;
                        columnLineage.push({ sourceTable: tName, sourceCol: col, targetCol: colName, formula: '' });
                        if (!cteNames.has(tName)) {
                            if (!discoveredTableColumns.has(tName)) discoveredTableColumns.set(tName, new Set());
                            discoveredTableColumns.get(tName)!.add(col);
                        }
                    }
                } else if (referencedTables.size === 1) {
                    const col = cleanIdentifier(colDef.split(/\s+/)[0]);
                    const tName = Array.from(referencedTables)[0];
                    if (!colName) colName = col;
                    columnLineage.push({ sourceTable: tName, sourceCol: col, targetCol: colName, formula: '' });
                }
            }

            if (!colName) {
                const parts = colDef.split(/[.\s]+/);
                colName = cleanIdentifier(parts[parts.length - 1]);
            }

            viewColumns.push({
                name: colName,
                type: isCte ? 'Start' : (isCalculation ? 'Calculated' : 'Mapped'),
                isPk: false,
                isFk: false
            });
        });

        // --- GLOBAL COLUMN DISCOVERY ---
        // Scan the entire body (Subqueries, WHERE, JOIN, ON clauses) to find columns for stub discovery
        const globalLineageRegex = /(?:(["`\[][^"`\]]+["`\]]|[\w]+)\.)?(["`\[][^"`\]]+["`\]]|[\w]+)/g;
        let globalMatch;
        while ((globalMatch = globalLineageRegex.exec(body)) !== null) {
            const al = globalMatch[1] ? cleanIdentifier(globalMatch[1]) : null;
            const col = cleanIdentifier(globalMatch[2]);
            if (al && aliasMap.has(al)) {
                const tName = aliasMap.get(al)!;
                if (!cteNames.has(tName)) {
                    if (!discoveredTableColumns.has(tName)) discoveredTableColumns.set(tName, new Set());
                    discoveredTableColumns.get(tName)!.add(col);
                }
            } else if (!al && referencedTables.size === 1) {
                const tName = Array.from(referencedTables)[0];
                if (!discoveredTableColumns.has(tName)) discoveredTableColumns.set(tName, new Set());
                discoveredTableColumns.get(tName)!.add(col);
            }
        }
    } else {
        viewColumns.push({ name: 'Unknown Cols', type: 'SQL', isPk: false, isFk: false });
    }

    referencedTables.forEach(ref => {
        if (ref.toUpperCase() !== 'UNNEST') {
            fks.push({ col: '', refTable: ref, refCol: '' });
        }
    });

    return {
        name: cleanIdentifier(name),
        columns: viewColumns,
        fks,
        isView,
        isCte,
        lineage: columnLineage
    };
};

export const parseSqlToElements = (sql: string) => {
    const cleaned = cleanSql(sql);
    const statements = cleaned.split(/;\s*|(?:\r?\n|^)\s*GO\s*(?:\r?\n|$)/mi).map(s => s.trim()).filter(s => s);
    const tables: TableData[] = [];
    const edges: Edge[] = [];
    const existingTableNames = new Set<string>();
    const discoveredTableColumns = new Map<string, Set<string>>();

    const parseWithCtes = (body: string, finalName: string, isView: boolean): void => {
        const localCteNames = new Set<string>();
        let currentOffset = 0;
        const strippedBody = body.trim();

        if (strippedBody.toUpperCase().startsWith('WITH')) {
            currentOffset = 4;
            if (strippedBody.substring(currentOffset).trim().toUpperCase().startsWith('RECURSIVE')) {
                const recMatch = strippedBody.substring(currentOffset).match(/\s*RECURSIVE/i);
                currentOffset += recMatch ? recMatch[0].length : 0;
            }

            let parsingCtes = true;
            while (parsingCtes) {
                const remainder = strippedBody.substring(currentOffset);
                const nameMatch = remainder.match(/^\s*([\w.]+)\s+AS\s*\(/i);

                if (nameMatch) {
                    const cteName = nameMatch[1];
                    const openParenIndex = remainder.indexOf('(');
                    const startBody = currentOffset + openParenIndex + 1;
                    let balance = 1;
                    let i = startBody;
                    for (; i < strippedBody.length; i++) {
                        if (strippedBody[i] === '(') balance++;
                        else if (strippedBody[i] === ')') balance--;
                        if (balance === 0) break;
                    }
                    const endBody = i;
                    const cteBody = strippedBody.substring(startBody, endBody);
                    localCteNames.add(cteName);
                    const cteTable = parseSelectBody(cteName, cteBody, true, true, discoveredTableColumns, localCteNames);
                    tables.push(cteTable);
                    existingTableNames.add(cleanIdentifier(cteName));

                    currentOffset = endBody + 1;
                    const nextCharMatch = strippedBody.substring(currentOffset).match(/^\s*(,)/);
                    if (nextCharMatch) {
                        currentOffset += strippedBody.substring(currentOffset).indexOf(',') + 1;
                    } else {
                        parsingCtes = false;
                    }
                } else {
                    parsingCtes = false;
                }
            }
            const mainBody = strippedBody.substring(currentOffset);
            const mainTable = parseSelectBody(finalName, mainBody, isView, false, discoveredTableColumns, localCteNames);
            tables.push(mainTable);
        } else {
            const mainTable = parseSelectBody(finalName, body, isView, false, discoveredTableColumns, localCteNames);
            tables.push(mainTable);
        }
    };

    statements.forEach(stmt => {
        const createTableMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?((?:["`\[][^"`\]]+["`\]]|[\w.]+))\s*(?:\(([\s\S]*)\)|AS\s+([\s\S]*))/i);
        const createViewMatch = stmt.match(/CREATE\s+(?:OR\s+(?:REPLACE|ALTER)\s+)?(?:MATERIALIZED\s+)?VIEW\s+(?:IF\s+NOT\s+EXISTS\s+)?((?:["`\[][^"`\]]+["`\]]|[\w.]+))\s+AS\s+([\s\S]*)/i);

        if (createTableMatch) {
            const fullTableName = cleanIdentifier(createTableMatch[1]);
            existingTableNames.add(fullTableName);
            const columnsBody = createTableMatch[2];
            const asSelectBody = createTableMatch[3];

            if (columnsBody) {
                const definitions = splitByCommas(columnsBody);
                const columns: Column[] = [];
                const fks: { col: string, refTable: string, refCol: string }[] = [];

                definitions.forEach(def => {
                    def = def.trim();
                    const fkMatch = def.match(/FOREIGN\s+KEY\s*\(["`\[]?(\w+)["`\]]?\)\s*REFERENCES\s+((?:["`\[][^"`\]]+["`\]]|[\w.]+))\s*\(["`\[]?(\w+)["`\]]?\)/i);
                    const pkMatch = def.match(/PRIMARY\s+KEY\s*\(["`\[]?(\w+)["`\]]?\)/i);
                    if (fkMatch) {
                        fks.push({ col: fkMatch[1], refTable: cleanIdentifier(fkMatch[2]), refCol: fkMatch[3] });
                    } else if (pkMatch) {
                        const pkCol = pkMatch[1];
                        const col = columns.find(c => c.name === pkCol);
                        if (col) col.isPk = true;
                    } else if (!def.toUpperCase().startsWith('CONSTRAINT') && !def.toUpperCase().startsWith('KEY') && !def.toUpperCase().startsWith('INDEX') && !def.toUpperCase().startsWith('CHECK')) {
                        const parts = def.split(/\s+/);
                        const colName = cleanIdentifier(parts[0]);
                        const colType = parts.slice(1).join(' ').split(/(\s|,\s|\))/)[0];
                        const isPk = /PRIMARY\s+KEY/i.test(def);
                        const isFk = /REFERENCES/i.test(def);
                        if (isFk) {
                            const refMatch = def.match(/REFERENCES\s+((?:["`\[][^"`\]]+["`\]]|[\w.]+))\s*\(["`\[]?(\w+)["`\]]?\)/i);
                            if (refMatch) fks.push({ col: colName, refTable: cleanIdentifier(refMatch[1]), refCol: refMatch[2] });
                        }
                        columns.push({ name: colName, type: colType || 'TEXT', isPk, isFk });
                    }
                });
                tables.push({ name: fullTableName, columns, fks });
            } else if (asSelectBody) {
                parseWithCtes(asSelectBody, fullTableName, false);
            }
        } else if (createViewMatch) {
            const fullViewName = cleanIdentifier(createViewMatch[1]);
            existingTableNames.add(fullViewName);
            const body = createViewMatch[2];
            parseWithCtes(body, fullViewName, true);
        } else if (stmt.toUpperCase().startsWith('WITH') || stmt.toUpperCase().startsWith('SELECT')) {
            parseWithCtes(stmt, "Query Result", true);
        }
    });

    const definedNames = new Set(tables.map(t => t.name));
    const stubTables: TableData[] = [];

    tables.forEach(t => {
        if (t.isView || t.isCte) {
            t.fks.forEach(fk => {
                const ref = fk.refTable;
                if (!definedNames.has(ref) && !existingTableNames.has(ref)) {
                    let stubCols: Column[] = [];
                    if (discoveredTableColumns.has(ref)) {
                        stubCols = Array.from(discoveredTableColumns.get(ref)!).map(c => ({
                            name: c, type: 'Source', isPk: false, isFk: false
                        }));
                    }
                    if (stubCols.length === 0) stubCols = [{ name: 'Unknown Schema', type: 'Stub', isPk: false, isFk: false }];
                    stubTables.push({ name: ref, columns: stubCols, fks: [] });
                    existingTableNames.add(ref);
                    definedNames.add(ref);
                }
            });
        }
    });
    tables.push(...stubTables);

    const nodes: Node[] = [];
    tables.forEach(table => {
        const isStub = table.columns[0]?.type === 'Stub' || table.columns[0]?.type === 'Source';
        let style = {};
        if (table.isCte) style = { border: '2px dashed #8b5cf6', backgroundColor: '#f5f3ff' };
        else if (table.isView) style = { border: '2px solid #007acc', backgroundColor: '#eef9ff' };
        else if (isStub) style = { border: '2px dashed #999', opacity: 0.9, backgroundColor: '#fdfbf7' };

        nodes.push({
            id: table.name,
            type: 'table',
            data: { label: table.name, columns: table.columns, isView: table.isView },
            position: { x: 0, y: 0 },
            style
        });
    });

    tables.forEach(table => {
        if (table.lineage) {
            table.lineage.forEach((lin, i) => {
                let stroke = '#3b82f6';
                const sourceIsCte = tables.find(t => t.name === lin.sourceTable)?.isCte;
                const targetIsCte = table.isCte;
                const targetIsView = table.isView && !table.isCte;

                if (sourceIsCte && targetIsCte) stroke = '#8b5cf6';
                if (sourceIsCte && targetIsView) stroke = '#10b981';
                if (lin.formula) stroke = '#f59e0b';

                edges.push({
                    id: `e-lin-${lin.sourceTable}.${lin.sourceCol}-${table.name}.${lin.targetCol}-${i}`,
                    source: lin.sourceTable,
                    target: table.name,
                    sourceHandle: `src-${lin.sourceCol}`,
                    targetHandle: `tgt-${lin.targetCol}`,
                    label: lin.formula || '',
                    type: 'default',
                    style: { stroke, strokeWidth: 2 },
                    markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
                    animated: true
                });
            });
        }

        const hasLineage = table.lineage && table.lineage.length > 0;
        table.fks.forEach((fk, i) => {
            if ((table.isView || table.isCte) && !hasLineage) {
                edges.push({
                    id: `e-struc-${fk.refTable}-${table.name}`,
                    source: fk.refTable,
                    target: table.name,
                    label: 'uses',
                    type: 'smoothstep',
                    style: { stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5,5' },
                    markerEnd: { type: MarkerType.ArrowClosed }
                });
            } else if (!table.isView && !table.isCte) {
                edges.push({
                    id: `e-${table.name}-${fk.refTable}-${i}`,
                    source: table.name,
                    target: fk.refTable,
                    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
                    markerEnd: { type: MarkerType.ArrowClosed }
                });
            }
        });
    });

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 250 });
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    nodes.forEach(node => {
        const nodeHeight = 60 + (node.data.columns.length * 32);
        dagreGraph.setNode(node.id, { width: 240, height: nodeHeight });
    });
    edges.forEach(edge => dagreGraph.setEdge(edge.source, edge.target));
    dagre.layout(dagreGraph);

    return {
        nodes: nodes.map(node => {
            const pos = dagreGraph.node(node.id);
            return {
                ...node,
                position: { x: pos.x - 120, y: pos.y - (60 + node.data.columns.length * 32) / 2 },
                targetPosition: Position.Left,
                sourcePosition: Position.Right
            };
        }),
        edges
    };
};
