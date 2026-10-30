export default function LearningProgressionNote({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p className={`text-sm ${className}`}>
      Course levels are a broad guide. Review each course&apos;s listed curriculum
      and prerequisites to understand its current learning focus. Your starting
      point depends on your skills and goals, not course duration; ask the team
      about the depth of specific topics.
    </p>
  );
}
