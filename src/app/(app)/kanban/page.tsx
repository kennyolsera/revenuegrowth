/**
 * Project Timeline: the Gr8r project-management template (source in /pm-app, built into
 * /public/project-timeline). Its data is shared by the team through /api/pm-workspace.
 */
export default function ProjectTimelinePage() {
  return (
    <iframe
      src="/project-timeline/index.html"
      title="Project Timeline"
      className="block h-full w-full border-0 bg-bg"
    />
  );
}
