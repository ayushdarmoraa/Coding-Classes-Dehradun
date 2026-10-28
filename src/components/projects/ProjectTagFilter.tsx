type Props = {
  tags: string[];
  selectedTag?: string;
};

export default function ProjectTagFilter({ tags, selectedTag }: Props) {
  if (tags.length === 0) return null;

  return (
    <form
      action="/projects"
      method="get"
      className="flex flex-col gap-3 rounded-xl bg-white p-4 ring-1 ring-gray-200 sm:flex-row sm:items-end"
      aria-label="Filter projects by technology"
    >
      <div className="flex-1">
        <label
          htmlFor="project-tag"
          className="mb-1 block text-sm font-semibold text-gray-900"
        >
          Category or technology
        </label>
        <select
          id="project-tag"
          name="tag"
          defaultValue={selectedTag ?? ""}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 sm:max-w-sm"
        >
          <option value="">All projects</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-800 px-4 py-2 font-semibold text-white hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
      >
        Apply filter
      </button>
    </form>
  );
}
