export default function FeatureCard({ icon, title, desc, onClick }) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`bg-white border border-rose-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow w-full text-left ${
        onClick ? "cursor-pointer hover:border-rose-300" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none">{icon}</span>
        <div>
          <p className="font-medium text-gray-900 text-sm">{title}</p>
          <p className="text-sm text-gray-500 mt-1">{desc}</p>
        </div>
      </div>
    </Tag>
  );
}
