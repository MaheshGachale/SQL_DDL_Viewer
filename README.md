# DDL Viewer - SQL Schema Visualizer

[![Visual Studio Marketplace](https://img.shields.io/badge/VS%20Code-Marketplace-blue)](https://marketplace.visualstudio.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Transform your SQL DDL statements into beautiful, interactive diagrams instantly. DDL Viewer is a powerful Visual Studio Code extension that helps you visualize database schemas, understand table relationships, and trace data lineage through complex views and CTEs.

## 🎥 Demo Video

[📺 Watch Demo Video](https://drive.google.com/file/d/14hdl77aOXvL5CvQx6XAwahx_uQND23HL/view?usp=drive_link)

*Click above to see DDL Viewer in action!*

## ✨ Features

### 🎯 **Instant Schema Visualization**
- Paste your SQL DDL and see an interactive diagram in seconds
- Support for `CREATE TABLE`, `CREATE VIEW`, and `CREATE MATERIALIZED VIEW`
- Automatic layout with smart positioning using Dagre algorithm

### 🔗 **Relationship Mapping**
- Visualize foreign key relationships with animated arrows
- Clear distinction between different relationship types
- Interactive diagram with zoom, pan, and minimap controls

### 📊 **Advanced View & CTE Support**
- **Full CTE (Common Table Expression) visualization**
- See intermediate CTE nodes in your data pipeline
- Color-coded data flow:
  - 🔵 **Blue lines**: Base Table → CTE
  - 🟣 **Purple lines**: CTE → CTE
  - 🟢 **Green lines**: CTE → Final View
  - 🟠 **Orange lines**: Calculated columns (formulas)

### 🎨 **Column-Level Lineage**
- Trace individual columns from source to destination
- Visual indicators for:
  - Direct column mappings (solid green lines)
  - Calculated/derived columns (dashed orange lines with ƒx symbol)
  - Primary keys (🔑 icon)
  - Foreign keys (🔗 icon)

### 🏷️ **Smart Node Styling**
- **Base Tables**: Standard white background
- **Views**: Blue border with light blue background
- **CTEs**: Purple dashed border with lavender background
- **Stub Tables**: Gray dashed border (auto-generated for undefined references)

### 🚀 **Developer-Friendly**
- Syntax highlighting for SQL editor
- Real-time diagram updates
- Export-ready visualizations
- Works offline - no external dependencies

## 📸 Screenshots

### Extension Overview
![DDL Viewer Overview](https://raw.githubusercontent.com/YOUR_USERNAME/DDL_Viewer/main/media/Overview.png)

*The complete DDL Viewer interface with SQL editor and interactive diagram*

### Complex CTE Pipeline Visualization
![CTE Pipeline](https://raw.githubusercontent.com/YOUR_USERNAME/DDL_Viewer/main/media/CTE_Views.png)

*Visualize complex data flows through multiple CTEs with color-coded lineage*

## 🚀 Getting Started

### Installation

1. Open Visual Studio Code
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
3. Type `ext install ddl-viewer`
4. Press Enter

### Usage

1. **Open DDL Viewer**
   - Click the DDL Viewer icon in the Activity Bar (left sidebar)
   - Or press `Ctrl+Shift+P` and type "DDL Viewer"

2. **Paste Your SQL**
   - Enter your DDL statements in the SQL editor
   - Supports multiple tables, views, and CTEs

3. **Generate Diagram**
   - Click "Generate Diagram" button
   - Or the diagram auto-updates as you type

4. **Interact with the Diagram**
   - Zoom in/out with mouse wheel
   - Pan by dragging
   - Use minimap for navigation
   - Click nodes to inspect details

## 📝 Example SQL

```sql
-- Base Tables
CREATE TABLE customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    customer_id INT,
    order_date DATE,
    status VARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
    item_id INT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT,
    unit_price DECIMAL(10,2),
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- View with CTEs
CREATE VIEW vw_customer_sales AS
WITH order_base AS (
    SELECT
        o.order_id,
        o.customer_id,
        o.order_date,
        oi.quantity,
        oi.unit_price,
        (oi.quantity * oi.unit_price) AS line_amount
    FROM orders o
    JOIN order_items oi ON o.order_id = oi.order_id
),
customer_totals AS (
    SELECT
        c.customer_id,
        c.name,
        c.email,
        COUNT(DISTINCT ob.order_id) AS total_orders,
        SUM(ob.line_amount) AS total_revenue
    FROM customers c
    JOIN order_base ob ON c.customer_id = ob.customer_id
    GROUP BY c.customer_id, c.name, c.email
)
SELECT
    customer_id,
    name,
    email,
    total_orders,
    total_revenue,
    ROUND(total_revenue / total_orders, 2) AS avg_order_value
FROM customer_totals
WHERE total_orders > 0;
```

## 🎨 Visual Legend

| Element | Meaning |
|---------|---------|
| 🔑 | Primary Key |
| 🔗 | Foreign Key |
| 🟦 Blue Border | View/Materialized View |
| 🟪 Purple Dashed | Common Table Expression (CTE) |
| ⚪ Gray Dashed | Stub Table (undefined reference) |
| ━━ Solid Line | Direct column mapping |
| ┈┈ Dashed Line | Calculated/formula column |
| ƒx | Formula indicator |

## 🛠️ Supported SQL Dialects

DDL Viewer supports standard SQL DDL syntax and has been tested with:
- PostgreSQL
- MySQL
- SQL Server
- Oracle
- SQLite

## ⚙️ Configuration

Currently, DDL Viewer works out-of-the-box with no configuration needed. Future versions will include customization options for:
- Color schemes
- Layout algorithms
- Auto-generation settings
- Export formats

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Export diagrams as PNG/SVG
- [ ] Support for ALTER TABLE statements
- [ ] Database reverse engineering (connect to live DB)
- [ ] Custom color themes
- [ ] Collaborative editing
- [ ] AI-powered schema suggestions

## 🐛 Known Issues

- Very large schemas (100+ tables) may experience performance issues
- Some complex nested CTEs might not parse correctly
- Circular foreign key references are not yet handled

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Feedback & Support

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/DDL_Viewer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/DDL_Viewer/discussions)
- **Email**: your.email@example.com

## 🌟 Show Your Support

If you find DDL Viewer helpful, please consider:
- ⭐ Starring the repository
- 📢 Sharing with your team
- 💬 Leaving a review on the VS Code Marketplace
- ☕ [Buy me a coffee](https://buymeacoffee.com/yourname)

---

**Made with ❤️ by [Your Name]**

*Visualize your data, understand your schema, build better databases.*
