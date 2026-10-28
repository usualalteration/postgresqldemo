# Unico prompt con cui ho realizzato l'app su Trustant

# Build a PostgreSQL Task Manager

Create a complete, working **Task Manager** application to demonstrate PostgreSQL integration with React and Nuvolaris OpenServerless.

Build and configure everything automatically, using the available tools. Do not ask for confirmation between steps.

**Application features**

- Create, view, edit and delete tasks.
- Each task has a title, description, status (To Do, In Progress, Done), priority (Low, Medium, High), and creation date.
- Filter tasks by status and search by title.
- Show dashboard counters for total tasks, completed tasks and pending tasks.
- Populate the database with 6 realistic sample tasks.

**PostgreSQL database**

- Use the available PostgreSQL integration to connect to the database.
- Create a `tasks` table with appropriate column types, constraints, an auto-generated primary key and timestamps.
- Implement all CRUD operations using parameterized SQL queries.
- Use PostgreSQL for all persistent data. Do not use mock data, localStorage or an in-memory database.
- Ensure the database schema and sample data are initialized safely without creating duplicates.

**OpenServerless backend**

- Implement the backend using Python actions on Nuvolaris OpenServerless.
- Use the available OpenServerless tools to create the actions and connect them to PostgreSQL, including `action_add_postgresql`.
- Provide endpoints for listing, creating, updating and deleting tasks, plus retrieving dashboard statistics.
- Return JSON responses with appropriate HTTP status codes and error handling.
- Validate inputs and prevent SQL injection.
- Verify the actions by invoking them with test data.

**React frontend and UI style**

Build a polished, responsive React application using Tailwind CSS.

Combine the following visual styles:

- **Modern SaaS dashboard:** clean layout, sidebar navigation, summary cards and generous spacing.
- **Minimalist design:** light neutral background, white cards, subtle shadows and rounded corners.
- **Indigo and violet accents:** primary buttons, active navigation and selected elements.
- **Kanban-inspired task management:** attractive task cards with colored priority and status badges.
- **Professional typography:** clear hierarchy, readable labels and consistent spacing.

The main screen should include a header, three statistic cards, a searchable task list, status filters and an Add Task button. Use a modal or drawer for creating and editing tasks.

Include loading states, empty states, error feedback and success notifications.

**Integration and verification**

- Connect the React frontend to the real OpenServerless API.
- Ensure all changes are immediately reflected in the interface.
- Demonstrate that tasks remain stored in PostgreSQL after refreshing the page.
- Make the application fully functional, not just a visual prototype.
- Run the available frontend and backend validation tools, fix any detected issues, and report the final result.

Keep the implementation simple and focused on demonstrating **React → OpenServerless Python actions → PostgreSQL**.
