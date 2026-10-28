/* ---------- empty workspace ----------
   The Gr8r sample data (demo members, projects, tasks, comments, files, invoices) was removed.
   This is only the shape of a new, empty workspace; real data comes from the shared Supabase
   document (core/remote.js) and members from User Management. */
export function seed() {
  return {
    ws: { name: 'Olsera VAS', url: 'olsera-vas', c: '#1468B3', brand: false },
    workspaces: [{ id: 'w1', name: 'Olsera VAS', c: '#1468B3', plan: 'Team' }],
    me: null,
    members: [],
    projects: [],
    tasks: [],
    comments: [],
    activity: [],
    notifs: [],
    files: [],
    events: [],
    projOrder: [],
    savedViews: [],
    recentSearches: [],
    sessions: [],
    invoices: [],
    tfa: false,
    notifPrefs: {
      email_mention: true,
      email_assign: true,
      email_digest: true,
      email_comment: false,
      push_mention: true,
      push_assign: true,
      push_comment: true,
      push_due: true,
      mention_all: true,
      assign_self: true,
    },
  };
}
