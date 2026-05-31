const STATE_CLASS = {
  Running: 'state-running',
  Ready: 'state-ready',
  Waiting: 'state-waiting',
  Suspended: 'state-suspended',
};

export default function TaskStateTable({ tasks, highlight }) {
  return (
    <table className="task-table">
      <thead>
        <tr>
          <th>Task</th>
          <th>Priority</th>
          <th>LED Pin</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((t) => (
          <tr
            key={t.id}
            className={highlight === t.id ? 'row-active' : ''}
          >
            <td>{t.id}</td>
            <td>{t.priority}</td>
            <td>
              <code>{t.pin}</code>
            </td>
            <td>
              <span className={`state-badge ${STATE_CLASS[t.state]}`}>
                {t.state}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
