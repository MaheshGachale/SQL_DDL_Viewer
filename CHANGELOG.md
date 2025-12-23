# Change Log

All notable changes to the "DDL Viewer" extension will be documented in this file.

## [0.0.1] - 2025-12-21

### 🎉 Initial Release

#### Features
- ✅ Visual schema generation from SQL DDL statements
- ✅ Support for `CREATE TABLE`, `CREATE VIEW`, and `CREATE MATERIALIZED VIEW`
- ✅ Interactive diagram with zoom, pan, and minimap
- ✅ Foreign key relationship visualization
- ✅ Column-level lineage tracking
- ✅ Full CTE (Common Table Expression) support
- ✅ Color-coded data flow visualization
- ✅ Formula/calculation detection with ƒx indicator
- ✅ Smart node styling (Tables, Views, CTEs, Stubs)
- ✅ Syntax-highlighted SQL editor
- ✅ Auto-layout using Dagre algorithm
- ✅ Primary key and foreign key indicators
- ✅ Stub table generation for undefined references

#### Supported SQL Features
- CREATE TABLE with columns, primary keys, foreign keys
- CREATE VIEW with complex SELECT statements
- CREATE MATERIALIZED VIEW
- Common Table Expressions (WITH ... AS)
- Nested CTEs
- Column aliases and calculations
- Multi-table JOINs
- Aggregate functions in views

#### Visual Elements
- 🔵 Blue lines: Base Table → CTE
- 🟣 Purple lines: CTE → CTE  
- 🟢 Green lines: CTE → Final View
- 🟠 Orange dashed lines: Calculated columns
- 🔑 Primary key indicators
- 🔗 Foreign key indicators

---

## Future Releases

### Planned for v0.1.0
- Export diagrams as PNG/SVG
- Dark/Light theme support
- Custom color schemes
- Performance optimizations for large schemas

### Planned for v0.2.0
- Database reverse engineering
- Live database connection
- ALTER TABLE support
- Schema comparison

### Planned for v0.3.0
- Collaborative editing
- Cloud sync
- AI-powered schema suggestions
- Auto-documentation generation
